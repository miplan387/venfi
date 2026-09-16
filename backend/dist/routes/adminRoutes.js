"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
// Middleware de autenticación y privilegios de Administrador
router.use(authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin);
// 1. Obtener todas las tarjetas del ranking con datos del anunciante
router.get('/cards', (req, res) => {
    adminController_1.adminController.getCards(req, res);
});
// 2. Actualizar los datos de una tarjeta (texto, link, emoji, posición, categoría)
router.put('/cards/:id', (req, res) => {
    adminController_1.adminController.updateCard(req, res);
});
// 3. Alternar estado activo/inactivo (is_active)
router.patch('/cards/:id/toggle', (req, res) => {
    adminController_1.adminController.toggleCardStatus(req, res);
});
// 4. Renovar / Extender duración de una tarjeta
router.post('/cards/:id/renew', (req, res) => {
    adminController_1.adminController.renewCard(req, res);
});
// 5. Eliminar / Restablecer tarjeta a espacio disponible
router.delete('/cards/:id', (req, res) => {
    adminController_1.adminController.deleteCard(req, res);
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map