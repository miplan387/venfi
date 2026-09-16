import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { validateRequest } from '../middleware/validate';
import { paymentRateLimiter } from '../middleware/rateLimiter';
import { createPaymentSchema, paymentWebhookSchema } from '../schemas/paymentSchemas';
import { optionalAuthMiddleware as authMiddleware } from '../middleware/authMiddleware';
import { requireAdmin as adminMiddleware } from '../middleware/adminMiddleware';

const router = Router();

// 1. Crear orden de pago (Binance Pay / Zelle)
router.post('/create', paymentRateLimiter, validateRequest(createPaymentSchema), (req: any, res) => {
  paymentController.createPayment(req, res);
});

// 2. Webhook de Binance Pay
router.post('/webhook', validateRequest(paymentWebhookSchema), (req, res) => {
  paymentController.webhook(req, res);
});

// 3. Consultar estado de la orden
router.get('/status/:orderId', (req, res) => {
  paymentController.getStatus(req, res);
});

// 4. Reportar comprobante Zelle / Zinli (Usuario)
router.post('/zelle/proof', (req, res) => {
  paymentController.submitZelleProof(req, res);
});
router.post('/zinli/proof', (req, res) => {
  paymentController.submitZelleProof(req, res);
});

// 5. Listar pagos Zelle / Zinli pendientes (Admin)
router.get('/zelle/pending', (req, res) => {
  paymentController.getPendingZelle(req, res);
});
router.get('/zinli/pending', (req, res) => {
  paymentController.getPendingZelle(req, res);
});

// 6. Conciliar/Aprobar/Rechazar pago Zelle / Zinli (Admin)
router.post('/zelle/verify', (req: any, res) => {
  paymentController.verifyZelle(req, res);
});
router.post('/zinli/verify', (req: any, res) => {
  paymentController.verifyZelle(req, res);
});

// 7. Renovar pauta activa
router.post('/renew', (req: any, res) => {
  paymentController.renewPayment(req, res);
});

// ==========================================
// 8. FLUJO DE PAGO MÓVIL (VES)
// ==========================================

// Rutas públicas (usuario autenticado)
router.post('/pagomovil/create', authMiddleware, (req: any, res) => {
  paymentController.createPagoMovilOrder(req, res);
});

router.get('/pagomovil/qr/:orderId', (req, res) => {
  paymentController.generatePagoMovilQR(req, res);
});

router.post('/pagomovil/proof', authMiddleware, (req: any, res) => {
  paymentController.uploadPagoMovilProof(req, res);
});

// Rutas de administración (solo admin)
router.get('/pagomovil/pending', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentController.listPagoMovilPending(req, res);
});

router.post('/pagomovil/approve', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentController.approvePagoMovil(req, res);
});

router.post('/pagomovil/reject', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentController.rejectPagoMovil(req, res);
});

router.get('/pagomovil/config', (req, res) => {
  paymentController.getPagoMovilConfig(req, res);
});

router.put('/pagomovil/config', authMiddleware, adminMiddleware, (req: any, res) => {
  paymentController.updatePagoMovilConfig(req, res);
});

export default router;

