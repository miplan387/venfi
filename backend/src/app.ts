import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { setupSwagger } from './docs/swagger';
import { generalRateLimiter } from './middleware/rateLimiter';
import { config } from './config/env';

export const createApp = (): Express => {
  const app = express();

  // 1. Headers de Seguridad con Helmet (Configuración Compatible con Cross-Origin y SPA)
  app.use(
    helmet({
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
    })
  );

  // 2. Control de Acceso CORS Flexible y Seguro para Desarrollo y Producción
  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:3000',
    'https://venfi.app',
    'https://www.venfi.app'
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          config.nodeEnv !== 'production' ||
          allowedOrigins.includes(origin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
        } else {
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
    })
  );

  // 3. Parser de Body con límites seguros
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Rate Limiter General Anti-Abuso
  app.use(generalRateLimiter);

  // 5. Documentación Swagger UI en /api-docs
  setupSwagger(app);

  // 6. Montar Rutas API
  app.use('/api', routes);

  // 7. Ruta raíz de bienvenida y estado
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Venfi API (Venezuela + Finanzas)',
      description: 'Plataforma líder de herramientas financieras y ranking publicitario',
      version: '1.0.0',
      status: 'operational',
      environment: config.nodeEnv,
      documentation: '/api-docs',
      health: '/api/health'
    });
  });

  // 8. Manejador de rutas no encontradas (404)
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
  });

  // 9. Manejador global de errores (500)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Venfi API Error]:', err.message || err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Error interno del servidor'
    });
  });

  return app;
};
