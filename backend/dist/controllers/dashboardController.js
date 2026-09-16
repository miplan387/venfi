"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboardService_1 = require("../services/dashboardService");
class DashboardController {
    async getSummary(req, res) {
        try {
            const userId = req.user?.userId || 'default_user';
            const summary = await dashboardService_1.dashboardService.getDashboardSummary(userId);
            res.status(200).json({
                success: true,
                data: summary
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener resumen del dashboard'
            });
        }
    }
    async getClicks(req, res) {
        try {
            const userId = req.user?.userId || 'default_user';
            const days = parseInt(req.query.days || '7', 10);
            const history = await dashboardService_1.dashboardService.getClicksHistory(userId, days);
            res.status(200).json({
                success: true,
                count: history.length,
                data: history
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener historial de clics'
            });
        }
    }
    async getGeolocation(req, res) {
        try {
            const userId = req.user?.userId || 'default_user';
            const geo = await dashboardService_1.dashboardService.getGeolocationData(userId);
            res.status(200).json({
                success: true,
                count: geo.length,
                data: geo
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener datos de geolocalización'
            });
        }
    }
    async getCampaigns(req, res) {
        try {
            const userId = req.user?.userId || 'default_user';
            const campaigns = await dashboardService_1.dashboardService.getActiveCampaigns(userId);
            res.status(200).json({
                success: true,
                count: campaigns.length,
                data: campaigns
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener campañas activas'
            });
        }
    }
    async getPayments(req, res) {
        try {
            const userId = req.user?.userId || 'default_user';
            const payments = await dashboardService_1.dashboardService.getPaymentHistory(userId);
            res.status(200).json({
                success: true,
                count: payments.length,
                data: payments
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener historial de pagos'
            });
        }
    }
    async getNotifications(req, res) {
        try {
            const userId = req.user?.userId || 'default_user';
            const notifs = await dashboardService_1.dashboardService.getUserNotifications(userId);
            res.status(200).json({
                success: true,
                count: notifs.length,
                data: notifs
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener notificaciones'
            });
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
//# sourceMappingURL=dashboardController.js.map