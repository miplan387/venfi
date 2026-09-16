"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rankingController_1 = require("../controllers/rankingController");
const validate_1 = require("../middleware/validate");
const paymentSchemas_1 = require("../schemas/paymentSchemas");
const router = (0, express_1.Router)();
router.get('/', (req, res) => rankingController_1.rankingController.getRanking(req, res));
router.post('/click/:position', (0, validate_1.validateRequest)(paymentSchemas_1.clickTrackSchema), (req, res) => rankingController_1.rankingController.trackClick(req, res));
exports.default = router;
//# sourceMappingURL=rankingRoutes.js.map