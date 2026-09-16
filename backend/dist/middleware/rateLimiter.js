"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalRateLimiter = exports.paymentRateLimiter = exports.authRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Limitador estricto para autenticación y pagos (prevención de fuerza bruta)
exports.authRateLimiter = (0, express_rate_limit_1.default)({
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
exports.paymentRateLimiter = (0, express_rate_limit_1.default)({
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
exports.generalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 200, // 200 req/min por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Demasiadas peticiones al servidor. Por favor intenta más tarde.'
    }
});
//# sourceMappingURL=rateLimiter.js.map