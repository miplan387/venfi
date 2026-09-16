"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentMethodsController_1 = require("../controllers/paymentMethodsController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
// 1. Obtener métodos activos (Público, para modal de pagos)
router.get('/active', (req, res) => {
    paymentMethodsController_1.paymentMethodsController.getActive(req, res);
});
// 2. Listar todos los métodos de pago (Admin)
router.get('/', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentMethodsController_1.paymentMethodsController.getAll(req, res);
});
// 3. Obtener un método específico por key (Público / Admin)
router.get('/:key', (req, res) => {
    paymentMethodsController_1.paymentMethodsController.getByKey(req, res);
});
// 4. Crear nuevo método de pago (Admin)
router.post('/', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentMethodsController_1.paymentMethodsController.create(req, res);
});
// 5. Actualizar método de pago existente (Admin)
router.put('/:key', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentMethodsController_1.paymentMethodsController.update(req, res);
});
// 6. Alternar estado activo / inactivo (Admin)
router.patch('/:key/toggle', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentMethodsController_1.paymentMethodsController.toggleActive(req, res);
});
// 7. Eliminar método de pago (Admin)
router.delete('/:key', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => {
    paymentMethodsController_1.paymentMethodsController.delete(req, res);
});
exports.default = router;
//# sourceMappingURL=paymentMethodsRoutes.js.map