"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const authMiddleware_1 = require("../middleware/authMiddleware");
const authSchemas_1 = require("../schemas/authSchemas");
const router = (0, express_1.Router)();
router.post('/register', rateLimiter_1.authRateLimiter, (0, validate_1.validateRequest)(authSchemas_1.registerSchema), (req, res) => authController_1.authController.register(req, res));
router.post('/login', rateLimiter_1.authRateLimiter, (0, validate_1.validateRequest)(authSchemas_1.loginSchema), (req, res) => authController_1.authController.login(req, res));
router.post('/refresh', (0, validate_1.validateRequest)(authSchemas_1.refreshTokenSchema), (req, res) => authController_1.authController.refreshToken(req, res));
router.get('/me', authMiddleware_1.authenticateJwt, (req, res) => authController_1.authController.getMe(req, res));
router.post('/google', (0, validate_1.validateRequest)(authSchemas_1.googleAuthSchema), (req, res) => authController_1.authController.googleAuth(req, res));
// Recuperación de Contraseña
router.post('/forgot-password', rateLimiter_1.authRateLimiter, (req, res) => authController_1.authController.forgotPassword(req, res));
router.post('/reset-password', rateLimiter_1.authRateLimiter, (req, res) => authController_1.authController.resetPassword(req, res));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map