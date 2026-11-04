"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketController = exports.MarketController = void 0;
const marketDataService_1 = require("../services/marketDataService");
class MarketController {
    /**
     * GET /api/market/oil o /api/market/petroleo
     * Retorna las cotizaciones del Petróleo Brent (EIA) y Crudo Merey 16 (Venezuela)
     */
    async getOilPrices(req, res) {
        try {
            const forceRefresh = req.query.forceRefresh === 'true';
            const data = await marketDataService_1.marketDataService.getOilPrices(forceRefresh);
            res.status(200).json({
                success: true,
                data
            });
        }
        catch (error) {
            console.error('[MarketController] Error al obtener precios del petróleo:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener cotizaciones del mercado petrolero',
                error: error.message || 'Error interno'
            });
        }
    }
    /**
     * GET /api/market/history/:type
     * Parámetros opcionales: ?days=7 o ?days=30
     * Retorna el historial diario y tendencia de cotizaciones para oro y petróleo
     */
    async getCommodityHistory(req, res) {
        try {
            const type = String(req.params.type);
            const days = parseInt(req.query.days, 10) || 7;
            const data = await marketDataService_1.marketDataService.getCommodityHistory(type, days);
            res.status(200).json({
                success: true,
                data
            });
        }
        catch (error) {
            console.error('[MarketController] Error al obtener historial de commodity:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Error al obtener historial'
            });
        }
    }
}
exports.MarketController = MarketController;
exports.marketController = new MarketController();
//# sourceMappingURL=marketController.js.map