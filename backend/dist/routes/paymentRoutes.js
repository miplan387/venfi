"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const paymentSchemas_1 = require("../schemas/paymentSchemas");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
// 1. Crear orden de pago (Binance Pay / Zelle)
router.post('/create', rateLimiter_1.paymentRateLimiter, (0, validate_1.validateRequest)(paymentSchemas_1.createPaymentSchema), (req, res) => {
    paymentController_1.paymentController.createPayment(req, res);
});
// 2. Webhook de Binance Pay
router.post('/webhook', (0, validate_1.validateRequest)(paymentSchemas_1.paymentWebhookSchema), (req, res) => {
    paymentController_1.paymentController.webhook(req, res);
});
// 3. Consultar estado de la orden
router.get('/status/:orderId', (req, res) => {
    paymentController_1.paymentController.getStatus(req, res);
});
// 4. Reportar comprobante Zelle / Zinli (Usuario)
router.post('/zelle/proof', (req, res) => {
    paymentController_1.paymentController.submitZelleProof(req, res);
});
router.post('/zinli/proof', (req, res) => {
    paymentController_1.paymentController.submitZelleProof(req, res);
});
// 5. Listar pagos Zelle / Zinli pendientes (Admin)
router.get('/zelle/pending', (req, res) => {
    paymentController_1.paymentController.getPendingZelle(req, res);
});
router.get('/zinli/pending', (req, res) => {
    paymentController_1.paymentController.getPendingZelle(req, res);
});
// 6. Conciliar/Aprobar/Rechazar pago Zelle / Zinli (Admin)
router.post('/zelle/verify', (req, res) => {
    paymentController_1.paymentController.verifyZelle(req, res);
});
router.post('/zinli/verify', (req, res) => {
    paymentController_1.paymentController.verifyZelle(req, res);
});
// 7. Renovar pauta activa
router.post('/renew', (req, res) => {
    paymentController_1.paymentController.renewPayment(req, res);
});
// ==========================================
// 8. FLUJO DE PAGO MÓVIL (VES)
// ==========================================
// Rutas públicas (usuario autenticado)
router.post('/pagomovil/create', authMiddleware_1.optionalAuthMiddleware, (req, res) => {
    paymentController_1.paymentController.createPagoMovilOrder(req, res);
});
router.get('/pagomovil/qr/:orderId', (req, res) => {
    paymentController_1.paymentController.generatePagoMovilQR(req, res);
});
router.post('/pagomovil/proof', authMiddleware_1.optionalAuthMiddleware, (req, res) => {
    paymentController_1.paymentController.uploadPagoMovilProof(req, res);
});
// Rutas de administración (solo admin)
router.get('/pagomovil/pending', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentController_1.paymentController.listPagoMovilPending(req, res);
});
router.post('/pagomovil/approve', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentController_1.paymentController.approvePagoMovil(req, res);
});
router.post('/pagomovil/reject', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentController_1.paymentController.rejectPagoMovil(req, res);
});
router.get('/pagomovil/config', (req, res) => {
    paymentController_1.paymentController.getPagoMovilConfig(req, res);
});
router.put('/pagomovil/config', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentController_1.paymentController.updatePagoMovilConfig(req, res);
});
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map