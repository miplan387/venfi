"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingController = exports.RankingController = void 0;
const rankingService_1 = require("../services/rankingService");
class RankingController {
    async getRanking(req, res) {
        try {
            const top10 = await rankingService_1.rankingService.getTop10();
            res.status(200).json({
                success: true,
                count: top10.length,
                data: top10,
                nextRotationHours: 24
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener el ranking'
            });
        }
    }
    async trackClick(req, res) {
        try {
            const position = parseInt(req.params.position, 10);
            const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
            const referrer = req.body?.referrer || req.headers.referer || 'direct';
            const userAgent = req.body?.userAgent || req.headers['user-agent'] || 'unknown';
            const result = await rankingService_1.rankingService.trackClick(position, { ip, referrer, userAgent });
            res.status(200).json({
                success: true,
                message: 'Clic registrado con éxito',
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al registrar clic'
            });
        }
    }
}
exports.RankingController = RankingController;
exports.rankingController = new RankingController();
//# sourceMappingURL=rankingController.js.map