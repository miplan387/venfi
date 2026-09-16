"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const routes_1 = __importDefault(require("./routes"));
const swagger_1 = require("./docs/swagger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const env_1 = require("./config/env");
const createApp = () => {
    const app = (0, express_1.default)();
    // 1. Headers de Seguridad con Helmet (Configuración Compatible con Cross-Origin y SPA)
    app.use((0, helmet_1.default)({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        contentSecurityPolicy: false, // Desactivado en API para máxima compatibilidad con frontend SPA y Swagger
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        },
        frameguard: { action: 'deny' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        noSniff: true,
        xssFilter: true,
        hidePoweredBy: true
    }));
    // 2. Control de Acceso CORS Flexible y Seguro para Desarrollo y Producción
    const allowedOrigins = [
        env_1.config.frontendUrl,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:3000',
        'https://venfi.app',
        'https://www.venfi.app'
    ];
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            if (!origin ||
                env_1.config.nodeEnv !== 'production' ||
                allowedOrigins.includes(origin) ||
                /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('No permitido por la política CORS de Venfi'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'BinancePay-Timestamp',
            'BinancePay-Nonce',
            'BinancePay-Certificate-SN',
            'BinancePay-Signature',
            'x-visitor-id',
            'x-admin-key'
        ]
    }));
    // 3. Parser de Body con límites seguros
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    // 4. Rate Limiter General Anti-Abuso
    app.use(rateLimiter_1.generalRateLimiter);
    // 5. Documentación Swagger UI en /api-docs
    (0, swagger_1.setupSwagger)(app);
    // 6. Montar Rutas API
    app.use('/api', routes_1.default);
    // 7. Ruta raíz de bienvenida y estado
    app.get('/', (req, res) => {
        res.json({
            name: 'Venfi API (Venezuela + Finanzas)',
            description: 'Plataforma líder de herramientas financieras y ranking publicitario',
            version: '1.0.0',
            status: 'operational',
            environment: env_1.config.nodeEnv,
            documentation: '/api-docs',
            health: '/api/health'
        });
    });
    // 8. Manejador de rutas no encontradas (404)
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
        });
    });
    // 9. Manejador global de errores (500)
    app.use((err, req, res, next) => {
        console.error('[Venfi API Error]:', err.message || err);
        res.status(err.status || 500).json({
            success: false,
            message: err.message || 'Error interno del servidor'
        });
    });
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map