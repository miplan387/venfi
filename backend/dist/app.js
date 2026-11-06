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
    // 2. Control de Acceso CORS Seguro para Web, Flutter y Producción
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            // Permite solicitudes sin origen (curl, mobile apps, Flutter) o refleja el origen de forma compatible con credentials
            callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'x-visitor-id', 'BinancePay-Timestamp', 'BinancePay-Nonce', 'BinancePay-Certificate-SN', 'BinancePay-Signature']
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
            name: 'Venfidata API (Venezuela + Finanzas)',
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
        console.error('[Venfidata API Error]:', err.stack || err.message || err);
        const statusCode = err.status || err.statusCode || 500;
        const isProd = env_1.config.nodeEnv === 'production';
        res.status(statusCode).json({
            success: false,
            message: isProd && statusCode === 500
                ? 'Error interno del servidor'
                : (err.message || 'Error interno del servidor')
        });
    });
    return app;
};
exports.createApp = createApp;
//# sourceMappingURL=app.js.map