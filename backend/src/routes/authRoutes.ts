import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticateJwt } from '../middleware/authMiddleware';
import { 
  registerSchema, 
  loginSchema, 
  refreshTokenSchema, 
  googleAuthSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../schemas/authSchemas';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), (req, res) => authController.register(req, res));
router.post('/login', authRateLimiter, validateRequest(loginSchema), (req, res) => authController.login(req, res));
router.post('/refresh', validateRequest(refreshTokenSchema), (req, res) => authController.refreshToken(req, res));
router.get('/me', authenticateJwt, (req, res) => authController.getMe(req, res));
router.post('/google', validateRequest(googleAuthSchema), (req, res) => authController.googleAuth(req, res));

// Recuperación de Contraseña protegida con Rate Limiting y Validación de Esquema
router.post('/forgot-password', authRateLimiter, validateRequest(forgotPasswordSchema), (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', authRateLimiter, validateRequest(resetPasswordSchema), (req, res) => authController.resetPassword(req, res));

export default router;
