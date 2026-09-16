import { Router } from 'express';
import { paymentMethodsController } from '../controllers/paymentMethodsController';
import { optionalAuthMiddleware as authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin as adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// 1. Obtener métodos activos (Público, para modal de pagos)
router.get('/active', (req, res) => {
  paymentMethodsController.getActive(req, res);
});

// 2. Listar todos los métodos de pago (Admin)
router.get('/', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentMethodsController.getAll(req, res);
});

// 3. Obtener un método específico por key (Público / Admin)
router.get('/:key', (req, res) => {
  paymentMethodsController.getByKey(req, res);
});

// 4. Crear nuevo método de pago (Admin)
router.post('/', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentMethodsController.create(req, res);
});

// 5. Actualizar método de pago existente (Admin)
router.put('/:key', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentMethodsController.update(req, res);
});

// 6. Alternar estado activo / inactivo (Admin)
router.patch('/:key/toggle', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentMethodsController.toggleActive(req, res);
});

// 7. Eliminar método de pago (Admin)
router.delete('/:key', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentMethodsController.delete(req, res);
});

export default router;
