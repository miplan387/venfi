"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const marketController_1 = require("../controllers/marketController");
const router = (0, express_1.Router)();
// GET /api/market/oil
router.get('/oil', (req, res) => marketController_1.marketController.getOilPrices(req, res));
// GET /api/market/petroleo (alias en español)
router.get('/petroleo', (req, res) => marketController_1.marketController.getOilPrices(req, res));
// GET /api/market (ruta raíz del módulo de mercado)
router.get('/', (req, res) => marketController_1.marketController.getOilPrices(req, res));
exports.default = router;
//# sourceMappingURL=marketRoutes.js.map