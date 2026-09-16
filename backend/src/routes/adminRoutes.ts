import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { optionalAuthMiddleware } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// Middleware de autenticación y privilegios de Administrador
router.use(optionalAuthMiddleware, requireAdmin);

// 1. Obtener todas las tarjetas del ranking con datos del anunciante
router.get('/cards', (req, res) => {
  adminController.getCards(req, res);
});

// 2. Actualizar los datos de una tarjeta (texto, link, emoji, posición, categoría)
router.put('/cards/:id', (req, res) => {
  adminController.updateCard(req, res);
});

// 3. Alternar estado activo/inactivo (is_active)
router.patch('/cards/:id/toggle', (req, res) => {
  adminController.toggleCardStatus(req, res);
});

// 4. Renovar / Extender duración de una tarjeta
router.post('/cards/:id/renew', (req, res) => {
  adminController.renewCard(req, res);
});

// 5. Eliminar / Restablecer tarjeta a espacio disponible
router.delete('/cards/:id', (req, res) => {
  adminController.deleteCard(req, res);
});

export default router;
