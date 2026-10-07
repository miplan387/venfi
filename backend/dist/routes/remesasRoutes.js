"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const remesasController_1 = require("../controllers/remesasController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const adminMiddleware_1 = require("../middleware/adminMiddleware");
const router = (0, express_1.Router)();
// 1. Obtener comparativa en tiempo real (Público)
router.get('/', (req, res) => remesasController_1.remesasController.getRemesas(req, res));
// 2. Listar todos los proveedores / casas de cambio (Admin)
router.get('/providers', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => remesasController_1.remesasController.getAllProviders(req, res));
// 3. Obtener un proveedor específico por key (Público / Admin)
router.get('/providers/:key', (req, res) => remesasController_1.remesasController.getProviderByKey(req, res));
// 4. Crear nuevo proveedor (Admin)
router.post('/providers', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => remesasController_1.remesasController.createProvider(req, res));
// 5. Actualizar proveedor existente (Admin)
router.put('/providers/:key', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => remesasController_1.remesasController.updateProvider(req, res));
// 6. Alternar estado activo / inactivo (Admin)
router.patch('/providers/:key/toggle', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => remesasController_1.remesasController.toggleProviderActive(req, res));
// 7. Eliminar proveedor (Admin)
router.delete('/providers/:key', authMiddleware_1.optionalAuthMiddleware, adminMiddleware_1.requireAdmin, (req, res) => remesasController_1.remesasController.deleteProvider(req, res));
exports.default = router;
//# sourceMappingURL=remesasRoutes.js.map