"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.googleAuthSchema = exports.refreshTokenSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Correo electrónico no válido'),
        username: zod_1.z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').max(30),
        password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        walletAddress: zod_1.z.string().optional()
    })
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Correo electrónico no válido'),
        password: zod_1.z.string().min(1, 'La contraseña es obligatoria')
    })
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'El refreshToken es obligatorio')
    })
});
exports.googleAuthSchema = zod_1.z.object({
    body: zod_1.z.object({
        googleId: zod_1.z.string().min(1, 'googleId es requerido'),
        email: zod_1.z.string().email('Correo electrónico no válido'),
        name: zod_1.z.string().min(1, 'El nombre es obligatorio'),
        walletAddress: zod_1.z.string().optional()
    })
});
exports.forgotPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Correo electrónico no válido')
    })
});
exports.resetPasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, 'El token de restablecimiento es obligatorio'),
        newPassword: zod_1.z.string().min(6, 'La nueva contraseña debe tener al menos 6 caracteres')
    })
});
//# sourceMappingURL=authSchemas.js.map