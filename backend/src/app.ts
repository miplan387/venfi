import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import axios from 'axios';
import routes from './routes';
import { setupSwagger } from './docs/swagger';
import { generalRateLimiter } from './middleware/rateLimiter';
import { config } from './config/env';
import { supabase, isSupabaseConfigured } from './database/supabase';
import { zonesService } from './services/zonesService';

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

  // Diagnóstico directo de conexión saliente hacia DolarAPI (sin caché)
  app.get('/api/test-rates', async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      const response = await axios.get('https://ve.dolarapi.com/v1/dolares/oficial', {
        timeout: 6000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        }
      });
      const latencyMs = Date.now() - startTime;
      res.status(200).json({
        success: true,
        message: 'Conexión exitosa a DolarAPI oficial',
        latencyMs,
        data: response.data
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      console.error('[test-rates] Error al conectar con DolarAPI:', err.message);
      res.status(500).json({
        success: false,
        message: 'Fallo al conectar con DolarAPI oficial',
        latencyMs,
        error: {
          message: err.message,
          code: err.code || null,
          status: err.response?.status || null,
          statusText: err.response?.statusText || null,
          data: err.response?.data || null
        }
      });
    }
  });

  // Diagnóstico directo de la tabla zone_pricing en Supabase REST
  app.get('/api/test-zone-pricing', async (req: Request, res: Response) => {
    const startTime = Date.now();
    try {
      if (!isSupabaseConfigured || !supabase) {
        return res.status(200).json({
          success: false,
          supabaseConfigured: false,
          message: 'Supabase no está configurado (variables no presentes o locales)',
          env: {
            SUPABASE_URL_EXISTS: !!process.env.SUPABASE_URL,
            SUPABASE_SERVICE_ROLE_KEY_EXISTS: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        });
      }

      console.log('[test-zone-pricing] Consultando Supabase REST para zone_pricing (nacional)...');
      const { data, error, status, statusText } = await supabase
        .from('zone_pricing')
        .select('*')
        .eq('zone_key', 'nacional');

      const latencyMs = Date.now() - startTime;

      if (error) {
        return res.status(500).json({
          success: false,
          supabaseConfigured: true,
          latencyMs,
          httpStatus: status,
          statusText,
          error: {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          },
          diagnosis: error.message.includes('schema cache')
            ? 'CRÍTICO: La tabla public.zone_pricing NO EXISTE en la base de datos de Supabase. Debe ejecutarse backend/src/database/crear_tablas_faltantes_supabase.sql en el SQL Editor de Supabase.'
            : 'Error devuelto por Supabase REST API.'
        });
      }

      return res.status(200).json({
        success: true,
        supabaseConfigured: true,
        latencyMs,
        count: (data || []).length,
        data: data || [],
        diagnosis: (data || []).length === 0
          ? 'La tabla public.zone_pricing existe pero está VACÍA en Supabase.'
          : `La tabla public.zone_pricing existe y contiene ${data?.length} tarifas para la zona nacional.`
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        latencyMs: Date.now() - startTime,
        error: err.message
      });
    }
  });

  // Ejecución asíncrona no bloqueante de seed para zone_pricing
  zonesService.seedZonePricingIfNeeded().catch(err => {
    console.warn('[Seed Warning]:', err.message);
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