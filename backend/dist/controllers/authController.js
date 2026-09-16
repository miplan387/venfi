"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    async register(req, res) {
        try {
            const result = await authService_1.authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al registrar usuario'
            });
        }
    }
    async login(req, res) {
        try {
            const result = await authService_1.authService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'Sesión iniciada exitosamente',
                data: result
            });
        }
        catch (err) {
            res.status(401).json({
                success: false,
                message: err.message || 'Credenciales inválidas'
            });
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            const tokens = await authService_1.authService.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                message: 'Token actualizado exitosamente',
                data: tokens
            });
        }
        catch (err) {
            res.status(401).json({
                success: false,
                message: err.message || 'Error al refrescar token'
            });
        }
    }
    async getMe(req, res) {
        try {
            if (!req.user?.userId) {
                res.status(401).json({ success: false, message: 'No autenticado' });
                return;
            }
            const user = await authService_1.authService.getMe(req.user.userId);
            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (err) {
            res.status(404).json({
                success: false,
                message: err.message || 'Usuario no encontrado'
            });
        }
    }
    async googleAuth(req, res) {
        try {
            const result = await authService_1.authService.googleAuth(req.body);
            res.status(200).json({
                success: true,
                message: 'Autenticación con Google exitosa',
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error en autenticación con Google'
            });
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.status(400).json({ success: false, message: 'El correo electrónico es requerido' });
                return;
            }
            const result = await authService_1.authService.forgotPassword(email);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al procesar la solicitud de recuperación'
            });
        }
    }
    async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            const result = await authService_1.authService.resetPassword(token, newPassword);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al restablecer la contraseña'
            });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map