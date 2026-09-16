"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ratesController_1 = require("../controllers/ratesController");
const router = (0, express_1.Router)();
router.get('/', (req, res) => ratesController_1.ratesController.getRates(req, res));
router.get('/history', (req, res) => ratesController_1.ratesController.getHistory(req, res));
router.get('/history/:type', (req, res) => ratesController_1.ratesController.getHistory(req, res));
exports.default = router;
//# sourceMappingURL=ratesRoutes.js.map