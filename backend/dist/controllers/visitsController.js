"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitsController = exports.VisitsController = void 0;
const visitsService_1 = require("../services/visitsService");
class VisitsController {
    /**
     * Obtiene las estadísticas de visitas y usuarios activos actuales
     * GET /api/visits
     */
    async getStats(req, res) {
        try {
            // Si el cliente envía un sessionId o IP, registrar su presencia activa
            const visitorId = req.headers['x-visitor-id'] || req.ip || 'anonymous';
            await visitsService_1.visitsService.heartbeat(visitorId);
            const stats = await visitsService_1.visitsService.getVisitsStats();
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener estadísticas de visitas'
            });
        }
    }
    /**
     * Registra una nueva visita e incrementa el contador general
     * POST /api/visits/track
     */
    async trackVisit(req, res) {
        try {
            const visitorId = req.body?.visitorId || req.headers['x-visitor-id'] || req.ip || 'anonymous';
            const stats = await visitsService_1.visitsService.trackVisit(visitorId);
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al registrar visita'
            });
        }
    }
    /**
     * Mantiene viva la sesión de un usuario para cálculo de usuarios en línea (5 min)
     * POST /api/visits/heartbeat
     */
    async heartbeat(req, res) {
        try {
            const visitorId = req.body?.visitorId || req.headers['x-visitor-id'] || req.ip || 'anonymous';
            const result = await visitsService_1.visitsService.heartbeat(visitorId);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error en heartbeat'
            });
        }
    }
}
exports.VisitsController = VisitsController;
exports.visitsController = new VisitsController();
//# sourceMappingURL=visitsController.js.map