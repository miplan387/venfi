"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Endpoints del Dashboard de Anunciante
router.get('/dashboard', authMiddleware_1.optionalAuthMiddleware, (req, res) => dashboardController_1.dashboardController.getSummary(req, res));
router.get('/dashboard/clicks', authMiddleware_1.optionalAuthMiddleware, (req, res) => dashboardController_1.dashboardController.getClicks(req, res));
router.get('/dashboard/geolocation', authMiddleware_1.optionalAuthMiddleware, (req, res) => dashboardController_1.dashboardController.getGeolocation(req, res));
router.get('/dashboard/campaigns', authMiddleware_1.optionalAuthMiddleware, (req, res) => dashboardController_1.dashboardController.getCampaigns(req, res));
router.get('/dashboard/payments', authMiddleware_1.optionalAuthMiddleware, (req, res) => dashboardController_1.dashboardController.getPayments(req, res));
router.get('/notifications', authMiddleware_1.optionalAuthMiddleware, (req, res) => dashboardController_1.dashboardController.getNotifications(req, res));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map