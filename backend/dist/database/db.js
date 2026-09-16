"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.db = void 0;
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../config/env");
class DatabaseManager {
    pool = null;
    isConnectedToPostgres = false;
    // Almacén en memoria de respaldo para desarrollo local ágil / fallback
    inMemoryDb = {
        users: [],
        payments: [],
        ranking: [],
        clicks_log: [],
        notifications: [],
        rates_history: [],
        zelle_payments: [],
        payment_methods: [
            { id: 1, key: 'binance', name: 'Binance Pay (USDT)', icon: '🟡', description: 'Pago instantáneo con criptomonedas y confirmación automática por Webhook.', fields: { merchantId: '284910482', currency: 'USDT' }, is_active: true, requires_approval: false, sort_order: 1 },
            { id: 2, key: 'zinli', name: 'Zinli (USD)', icon: '💳', description: 'Pago con Zinli, billetera digital en dólares con acreditación inmediata.', fields: { email: 'miplan3d@gmail.com', name: 'Venfi Publicidad' }, is_active: true, requires_approval: true, sort_order: 2 },
            { id: 3, key: 'pago_movil', name: 'Pago Móvil (VES)', icon: '📱', description: 'Pago interbancario en Bolívares con QR dinámico a tasa oficial BCV.', fields: { bank: 'BNC (Banco Nacional de Crédito)', bankCode: '0191', phone: '0412-4160819', idNumber: 'V-11112387', beneficiary: 'Venfi Publicidad & Medios C.A.' }, is_active: true, requires_approval: true, sort_order: 3 }
        ]
    };
    constructor() {
        if (env_1.config.databaseUrl) {
            this.pool = new pg_1.Pool({
                connectionString: env_1.config.databaseUrl,
                ssl: env_1.config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
                max: 30, // Pool robusto para concurrencia
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 10000
            });
        }
    }
    async init() {
        try {
            if (this.pool) {
                const client = await this.pool.connect();
                this.isConnectedToPostgres = true;
                console.log('✅ Conectado exitosamente a PostgreSQL (Supabase / Pool)');
                // Ejecutar schema si es necesario
                const schemaPath = path_1.default.join(__dirname, 'schema.sql');
                if (fs_1.default.existsSync(schemaPath)) {
                    const schemaSql = fs_1.default.readFileSync(schemaPath, 'utf-8');
                    await client.query(schemaSql);
                }
                // Asegurar columnas de variación en rates_history
                await client.query(`
          ALTER TABLE rates_history ADD COLUMN IF NOT EXISTS variation_abs DECIMAL(10,4);
          ALTER TABLE rates_history ADD COLUMN IF NOT EXISTS variation_pct DECIMAL(5,2);
          ALTER TABLE rates_history ADD COLUMN IF NOT EXISTS direction VARCHAR(10);
        `);
                // Ejecutar seed inicial si ranking está vacío
                const rankingCountRes = await client.query('SELECT COUNT(*) FROM ranking');
                if (parseInt(rankingCountRes.rows[0].count, 10) === 0) {
                    const seedPath = path_1.default.join(__dirname, 'seed.sql');
                    if (fs_1.default.existsSync(seedPath)) {
                        const seedSql = fs_1.default.readFileSync(seedPath, 'utf-8');
                        await client.query(seedSql);
                    }
                }
                client.release();
            }
        }
        catch (err) {
            console.warn('⚠️ No se pudo conectar a PostgreSQL externo. Iniciando Motor de Base de Datos En-Memoria Relacional para desarrollo:', err.message);
            this.isConnectedToPostgres = false;
            this.seedInMemory();
        }
    }
    seedInMemory() {
        // Cargar usuarios por defecto
        this.inMemoryDb.users = [
            {
                id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                email: 'admin@venfi.app',
                username: 'venfi_admin',
                password_hash: '$2a$10$QjY8p1Q3z5S.E7xN0kP8yO2sK7wJ7G8h0d6.l7v1k1X.r9i4l4t.y',
                role: 'admin',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                wallet_address: null,
                google_id: null
            },
            {
                id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
                email: 'electrocaracas@gmail.com',
                username: 'electrocaracas',
                password_hash: '$2a$10$QjY8p1Q3z5S.E7xN0kP8yO2sK7wJ7G8h0d6.l7v1k1X.r9i4l4t.y',
                role: 'advertiser',
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                wallet_address: '0x71C...4b9F',
                google_id: null
            }
        ];
        // Cargar Ranking Inicial
        this.inMemoryDb.ranking = [
            {
                id: 1,
                position: 1,
                user_id: 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
                payment_id: null,
                business_name: 'ElectroCaracas Express ⚡',
                target_url: 'https://instagram.com/electrocaracas',
                slogan: 'Los mejores precios en iPhone, PlayStation 5 y Laptops con envíos a toda Venezuela y garantía de 1 año.',
                category: 'Tecnología & Retail',
                avatar: '⚡',
                tier: 'gold',
                amount_paid: 15.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 3420,
                views_received: 48920,
                is_active: true
            },
            {
                id: 2,
                position: 2,
                user_id: null,
                payment_id: null,
                business_name: 'VenRemesas Direct 🇻🇪🇺🇸',
                target_url: 'https://venremesas.com',
                slogan: 'Envía dinero desde EE.UU., España y Chile con la mejor tasa del mercado. Acreditación en 5 minutos.',
                category: 'Finanzas & Remesas',
                avatar: '💸',
                tier: 'silver',
                amount_paid: 10.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 1890,
                views_received: 29400,
                is_active: true
            },
            {
                id: 3,
                position: 3,
                user_id: null,
                payment_id: null,
                business_name: 'CriptoTrader VE Academy 📈',
                target_url: 'https://t.me/criptotradervip',
                slogan: 'Aprende trading de futuros y arbitraje P2P en Binance. Comunidad VIP con más de 3,500 miembros activos.',
                category: 'Educación & Cripto',
                avatar: '📊',
                tier: 'silver',
                amount_paid: 10.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 1450,
                views_received: 24100,
                is_active: true
            },
            {
                id: 4,
                position: 4,
                user_id: null,
                payment_id: null,
                business_name: 'Repuestos Automotrices El Ávila 🚗',
                target_url: 'https://repuestosavila.com',
                slogan: 'Especialistas en tren delantero, motores y suspensión para Toyota, Ford y Chevrolet.',
                category: 'Automotriz',
                avatar: '🔧',
                tier: 'dark',
                amount_paid: 5.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 890,
                views_received: 14200,
                is_active: true
            },
            {
                id: 5,
                position: 5,
                user_id: null,
                payment_id: null,
                business_name: 'TuViaje Margarita & Los Roques ✈️',
                target_url: 'https://tuviajemargarita.ve',
                slogan: 'Paquetes turísticos todo incluido con boletos aéreos y hospedaje de lujo.',
                category: 'Turismo & Viajes',
                avatar: '🏖️',
                tier: 'dark',
                amount_paid: 5.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 760,
                views_received: 11800,
                is_active: true
            },
            {
                id: 6,
                position: 6,
                user_id: null,
                payment_id: null,
                business_name: 'Burger Brothers Caracas 🍔',
                target_url: 'https://instagram.com/burgerbrothersccs',
                slogan: 'Las mejores smash burgers con pan brioche artesanal en Las Mercedes y Chacao.',
                category: 'Gastronomía',
                avatar: '🍔',
                tier: 'dark',
                amount_paid: 5.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 640,
                views_received: 9500,
                is_active: true
            },
            {
                id: 7,
                position: 7,
                user_id: null,
                payment_id: null,
                business_name: 'Servicios Jurídicos y Apostillas ⚖️',
                target_url: 'https://apostillasvzla.com',
                slogan: 'Gestoría legal exprés de antecedentes penales, títulos universitarios y partidas para emigrar.',
                category: 'Servicios Legales',
                avatar: '📜',
                tier: 'dark',
                amount_paid: 5.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 580,
                views_received: 8900,
                is_active: true
            },
            {
                id: 8,
                position: 8,
                user_id: null,
                payment_id: null,
                business_name: 'Calzados Moda Valencia 👟',
                target_url: 'https://modavalencia.shop',
                slogan: 'Venta al mayor y detal de calzado deportivo importado directo de fábrica.',
                category: 'Moda & Ropa',
                avatar: '👟',
                tier: 'dark',
                amount_paid: 5.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 490,
                views_received: 7200,
                is_active: true
            },
            {
                id: 9,
                position: 9,
                user_id: null,
                payment_id: null,
                business_name: 'Ferretería & Construcción Total 🏗️',
                target_url: 'https://ferreconstructora.com',
                slogan: 'Materiales eléctricos, tuberías, cemento y pintura con despacho directo a obra.',
                category: 'Construcción',
                avatar: '🧱',
                tier: 'dark',
                amount_paid: 5.00,
                start_time: new Date().toISOString(),
                end_time: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
                clicks_received: 410,
                views_received: 6100,
                is_active: true
            },
            {
                id: 10,
                position: 10,
                user_id: null,
                payment_id: null,
                business_name: 'Espacio Publicitario Disponible ✨',
                target_url: 'https://venfi.app/#ranking',
                slogan: 'Coloca tu negocio aquí frente a miles de compradores diarios en toda Venezuela por solo $5.',
                category: '¡Tu Marca Aquí!',
                avatar: '🚀',
                tier: 'dark',
                amount_paid: 0.00,
                start_time: new Date().toISOString(),
                end_time: null,
                clicks_received: 120,
                views_received: 4500,
                is_active: true
            }
        ];
    }
    // Getters para acceso a la base de datos
    getInMemoryStore() {
        return this.inMemoryDb;
    }
    get isPostgresActive() {
        return this.isConnectedToPostgres;
    }
    async query(text, params) {
        if (this.isConnectedToPostgres && this.pool) {
            const res = await this.pool.query(text, params);
            return {
                rows: res.rows,
                rowCount: res.rowCount || 0
            };
        }
        // Si está en modo memoria, los servicios usan directamente los repositorios
        return { rows: [], rowCount: 0 };
    }
}
exports.db = new DatabaseManager();
exports.pool = exports.db;
//# sourceMappingURL=db.js.map