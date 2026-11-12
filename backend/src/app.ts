import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { setupSwagger } from './docs/swagger';
import { generalRateLimiter } from './middleware/rateLimiter';
import { config } from './config/env';
import { supabase, isSupabaseConfigured } from './database/supabase';

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

  // 2. Control de Acceso CORS Seguro para Web, Flutter y Producción
  app.use(cors({
    origin: (origin, callback) => {
      // Permite solicitudes sin origen (curl, mobile apps, Flutter) o refleja el origen de forma compatible con credentials
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key', 'x-visitor-id', 'BinancePay-Timestamp', 'BinancePay-Nonce', 'BinancePay-Certificate-SN', 'BinancePay-Signature']
  }));

  // 3. Parser de Body con límites seguros
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Rate Limiter General Anti-Abuso
  app.use(generalRateLimiter);

  // 5. Documentación Swagger UI en /api-docs
  setupSwagger(app);

  // 6. RUTA DE CHEQUEO PARA CPANEL (Evita el error de content-type)
  // cPanel hace una petición a la URL de la aplicación y espera HTML.
  app.get('/api', (req: Request, res: Response) => {
    res.send('<h1>Venfidata API está en línea</h1>');
  });

  app.get('/api/', (req: Request, res: Response) => {
    res.send('<h1>Venfidata API está en línea</h1>');
  });

  // Endpoint temporal de diagnóstico de conexión a Supabase REST API (HTTPS / Puerto 443)
  app.get('/api/db-test', async (req: Request, res: Response) => {
    let supabaseHost = 'no_configurado';
    try {
      if (process.env.SUPABASE_URL) {
        supabaseHost = new URL(process.env.SUPABASE_URL).hostname;
      }
    } catch (_) {
      supabaseHost = 'url_invalida';
    }

    const diagnostics = {
      nodeEnv: config.nodeEnv,
      isSupabaseConfigured,
      hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
      hasSupabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      supabaseHost
    };

    if (!supabase) {
      res.status(500).json({
        success: false,
        source: 'supabase_rest',
        error: 'Cliente Supabase no inicializado. Verifica SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en cPanel/.env.',
        diagnostics
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('visits')
        .select('total_visits')
        .eq('id', 1)
        .maybeSingle();

      if (error) {
        res.status(500).json({
          success: false,
          source: 'supabase_rest',
          error: error.message,
          code: error.code || null,
          details: error.details || null,
          hint: error.hint || null,
          diagnostics
        });
        return;
      }

      res.status(200).json({
        success: true,
        source: 'supabase_rest',
        total_visits: data ? Number(data.total_visits) : null,
        rowFound: Boolean(data),
        diagnostics
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        source: 'supabase_rest',
        error: err.message || 'Error inesperado al consultar Supabase REST API',
        diagnostics
      });
    }
  });

  // 7. Montar Rutas API
  app.use('/api', routes);

  // 8. Ruta raíz de bienvenida y estado (Por si se accede al dominio principal sin /api)
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'Venfidata API (Venezuela + Finanzas)',
      description: 'Plataforma líder de herramientas financieras y ranking publicitario',
      version: '1.0.0',
      status: 'operational',
      environment: config.nodeEnv,
      documentation: '/api-docs',
      health: '/api/health'
    });
  });

  // 9. Manejador de rutas no encontradas (404)
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    });
  });

  // 10. Manejador global de errores (500)
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Venfidata API Error]:', err.stack || err.message || err);
    const statusCode = err.status || err.statusCode || 500;
    const isProd = config.nodeEnv === 'production';
    res.status(statusCode).json({
      success: false,
      message: isProd && statusCode === 500
        ? 'Error interno del servidor'
        : (err.message || 'Error interno del servidor')
    });
  });

  return app;
};