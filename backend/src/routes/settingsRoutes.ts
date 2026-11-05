import { Router } from 'express';
import { settingsController } from '../controllers/settingsController';
import { optionalAuthMiddleware as authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin as adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// 1. Obtener la configuración actual de métodos de pago (Público)
router.get('/payments', (req, res) => {
  settingsController.getPaymentSettings(req, res);
});

// 2. Actualizar configuración de un método de pago específico (Admin)
router.put('/payments/:key', authMiddleware, adminMiddleware, (req: any, res) => {
  settingsController.updatePaymentSetting(req, res);
});

export default router;

