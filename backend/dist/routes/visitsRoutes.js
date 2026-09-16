"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitsController_1 = require("../controllers/visitsController");
const router = (0, express_1.Router)();
// GET /api/visits - Obtener estadísticas de visitas y usuarios activos
router.get('/', (req, res) => visitsController_1.visitsController.getStats(req, res));
// POST /api/visits/track - Registrar una nueva visita
router.post('/track', (req, res) => visitsController_1.visitsController.trackVisit(req, res));
// POST /api/visits/heartbeat - Heartbeat de usuario activo (5 min)
router.post('/heartbeat', (req, res) => visitsController_1.visitsController.heartbeat(req, res));
exports.default = router;
//# sourceMappingURL=visitsRoutes.js.map