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
        ],
        remittance_providers: [
            {
                id: 1,
                key: 'binance_p2p',
                name: 'Binance P2P (USDT / PagoMóvil)',
                icon: '🟡',
                description: 'Comercio P2P directo sin comisiones intermedias a tasa USDT de mercado',
                countries: ['USA', 'COLOMBIA', 'PERU', 'CHILE', 'BRASIL', 'ARGENTINA', 'ESPANA', 'EUR', 'EUROPA'],
                rate_multiplier: 1.002,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9980,
                sell_rate_multiplier: 1.0020,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 0.0,
                commission_fixed_usd: 0.0,
                delivery_time: '5 - 15 min (Inmediato)',
                payment_methods: ['Pago local', 'PagoMóvil', 'Transferencia Bs'],
                delivery_methods: ['Pago Móvil', 'Transferencia Bs'],
                rating: 4.9,
                badge: 'MEJOR TASA & CERO COMISIÓN',
                url: 'https://p2p.binance.com/es-LA',
                market_type: 'parallel',
                sort_order: 1,
                is_active: true
            },
            {
                id: 2,
                key: 'airtm',
                name: 'Airtm Remesas',
                icon: '🔵',
                description: 'Billetera digital multimoneda para la diáspora venezolana',
                countries: ['USA', 'COLOMBIA', 'PERU', 'CHILE', 'BRASIL', 'ARGENTINA', 'ESPANA', 'EUR', 'EUROPA'],
                rate_multiplier: 0.985,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9650,
                sell_rate_multiplier: 0.9850,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 2.8,
                commission_fixed_usd: 0.5,
                delivery_time: '15 - 30 min',
                payment_methods: ['Bancos locales', 'PagoMóvil'],
                delivery_methods: ['Pago Móvil', 'Transferencia Bancaria'],
                rating: 4.6,
                badge: 'MULTIMONEDA DIÁSPORA',
                url: 'https://airtm.com',
                market_type: 'parallel',
                sort_order: 2,
                is_active: true
            },
            {
                id: 3,
                key: 'zoom',
                name: 'Zoom / Western Union Internacional',
                icon: '🔴',
                description: 'Red oficial autorizada de casas de cambio y remesas en Venezuela',
                countries: ['USA', 'COLOMBIA', 'PERU', 'CHILE', 'BRASIL', 'ARGENTINA', 'ESPANA', 'EUR', 'EUROPA'],
                rate_multiplier: 0.95,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9300,
                sell_rate_multiplier: 0.9500,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 4.5,
                commission_fixed_usd: 1.5,
                delivery_time: '1 - 4 horas',
                payment_methods: ['Agencias Zoom', 'PagoMóvil', 'Retiro Efectivo'],
                delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Retiro Efectivo'],
                rating: 4.7,
                badge: 'RED OFICIAL AUTORIZADA',
                url: 'https://zoom.red/remesas',
                market_type: 'parallel',
                sort_order: 3,
                is_active: true
            },
            {
                id: 4,
                key: 'moneygram',
                name: 'MoneyGram Diáspora',
                icon: '🌐',
                description: 'Red de transferencias y depósitos bancarios directos internacionales',
                countries: ['USA', 'COLOMBIA', 'PERU', 'CHILE', 'BRASIL', 'ARGENTINA', 'ESPANA', 'EUR', 'EUROPA'],
                rate_multiplier: 0.94,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9200,
                sell_rate_multiplier: 0.9400,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 5.0,
                commission_fixed_usd: 2.0,
                delivery_time: '24 horas',
                payment_methods: ['Depósito Bancario Directo'],
                delivery_methods: ['Depósito Bancario Directo'],
                rating: 4.4,
                badge: 'RED BANCARIA GLOBAL',
                url: 'https://moneygram.com',
                market_type: 'parallel',
                sort_order: 4,
                is_active: true
            },
            {
                id: 5,
                key: 'italcambio',
                name: 'ItalCambio',
                icon: '🇮🇹',
                description: 'Envíos desde Italia y Europa a Venezuela',
                countries: ['ITALIA', 'ESPAÑA', 'ESPANA', 'EUROPA', 'EUR', 'USA'],
                rate_multiplier: 0.965,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9450,
                sell_rate_multiplier: 0.9650,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 3.5,
                commission_fixed_usd: 3.00,
                delivery_time: '24 - 48 horas',
                payment_methods: ['Transferencia EUR', 'Efectivo EUR'],
                delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Efectivo Bs'],
                rating: 4.5,
                badge: 'ESPECIALISTA EUROPA',
                url: 'https://italcambio.com',
                market_type: 'official',
                sort_order: 5,
                is_active: true
            },
            {
                id: 6,
                key: 'angulo_lopez',
                name: 'Casa de Cambio Angulo López',
                icon: '🏛️',
                description: 'Casa de cambio tradicional venezolana con amplia trayectoria',
                countries: ['COLOMBIA', 'USA', 'ESPAÑA', 'ESPANA', 'EUR', 'PANAMA', 'PERU', 'CHILE'],
                rate_multiplier: 0.96,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9400,
                sell_rate_multiplier: 0.9600,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 3.8,
                commission_fixed_usd: 2.50,
                delivery_time: '12 - 24 horas',
                payment_methods: ['Transferencia Bancaria', 'Depósito en Efectivo', 'Zelle'],
                delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Efectivo Bs'],
                rating: 4.6,
                badge: 'TRADICIÓN & SEGURIDAD',
                url: 'https://casadecambioangulolopez.com',
                market_type: 'official',
                sort_order: 6,
                is_active: true
            },
            {
                id: 7,
                key: 'insular',
                name: 'Insular Tasa de Cambio',
                icon: '🏝️',
                description: 'Casa de cambio con presencia en la región insular y oriente del país',
                countries: ['USA', 'COLOMBIA', 'BRASIL', 'ESPAÑA', 'ESPANA', 'EUR', 'CHILE', 'PERU', 'PANAMA'],
                rate_multiplier: 0.955,
                rate_usd_bs: 0,
                buy_rate_multiplier: 0.9350,
                sell_rate_multiplier: 0.9550,
                buy_rate: 0,
                sell_rate: 0,
                commission_percent: 4.0,
                commission_fixed_usd: 2.00,
                delivery_time: '24 horas',
                payment_methods: ['Transferencia Internacional', 'Efectivo USD/EUR'],
                delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Retiro Agencias'],
                rating: 4.4,
                badge: 'REGIÓN INSULAR & ORIENTE',
                url: 'https://insularcambio.com',
                market_type: 'official',
                sort_order: 7,
                is_active: true
            }
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
                // Asegurar columnas de buy_rate, sell_rate y market_type en remittance_providers
                await client.query(`
          ALTER TABLE remittance_providers ADD COLUMN IF NOT EXISTS buy_rate_multiplier DECIMAL(5,4) DEFAULT 0.9750;
          ALTER TABLE remittance_providers ADD COLUMN IF NOT EXISTS sell_rate_multiplier DECIMAL(5,4) DEFAULT 1.0000;
          ALTER TABLE remittance_providers ADD COLUMN IF NOT EXISTS buy_rate DECIMAL(10,4) DEFAULT 0;
          ALTER TABLE remittance_providers ADD COLUMN IF NOT EXISTS sell_rate DECIMAL(10,4) DEFAULT 0;
          ALTER TABLE remittance_providers ADD COLUMN IF NOT EXISTS market_type VARCHAR(20) DEFAULT 'parallel';
        `);
                // Migración de clasificación de mercado
                await client.query(`
          UPDATE remittance_providers SET market_type = 'official' WHERE key IN ('italcambio', 'angulo_lopez', 'insular');
          UPDATE remittance_providers SET market_type = 'parallel' WHERE key IN ('binance_p2p', 'airtm', 'zinli', 'wally', 'zoom', 'moneygram');
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
                // Asegurar que las casas de cambio iniciales existan en remittance_providers
                for (const p of this.inMemoryDb.remittance_providers) {
                    await client.query(`INSERT INTO remittance_providers (
              key, name, icon, description, countries, rate_multiplier, rate_usd_bs,
              buy_rate_multiplier, sell_rate_multiplier, buy_rate, sell_rate,
              commission_percent, commission_fixed_usd, delivery_time, payment_methods,
              delivery_methods, rating, badge, url, market_type, sort_order, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            ON CONFLICT (key) DO NOTHING`, [
                        p.key, p.name, p.icon, p.description, JSON.stringify(p.countries || []),
                        p.rate_multiplier || 1.0, p.rate_usd_bs || 0,
                        p.buy_rate_multiplier || 0.9750, p.sell_rate_multiplier || 1.0000,
                        p.buy_rate || 0, p.sell_rate || 0,
                        p.commission_percent || 0, p.commission_fixed_usd || 0, p.delivery_time || '24 horas',
                        JSON.stringify(p.payment_methods || []), JSON.stringify(p.delivery_methods || []),
                        p.rating || 4.5, p.badge || '', p.url || '', p.market_type || 'parallel', p.sort_order || 0, p.is_active ?? true
                    ]);
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