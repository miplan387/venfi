import rateLimit from 'express-rate-limit';

// Limitador estricto para autenticación y pagos (prevención de fuerza bruta)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // 20 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes de autenticación desde esta IP. Intenta nuevamente en 15 minutos.'
  }
});

// Limitador para creación de pagos
export const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutos
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Límite de órdenes de pago alcanzado. Por favor espera unos minutos.'
  }
});

// Limitador general para el resto de la API (1,000 usuarios concurrentes)
export const generalRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 200, // 200 req/min por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas peticiones al servidor. Por favor intenta más tarde.'
  }
});
