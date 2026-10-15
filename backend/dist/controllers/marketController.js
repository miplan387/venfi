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
}
exports.MarketController = MarketController;
exports.marketController = new MarketController();
//# sourceMappingURL=marketController.js.map