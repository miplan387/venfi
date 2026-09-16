"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ratesController = exports.RatesController = void 0;
const ratesService_1 = require("../services/ratesService");
class RatesController {
    async getRates(req, res) {
        try {
            const rates = await ratesService_1.ratesService.getRates();
            res.status(200).json({
                success: true,
                data: rates
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener tasas de cambio'
            });
        }
    }
    async getHistory(req, res) {
        try {
            const type = (req.params.type || req.query.type || 'bcv');
            const days = parseInt(req.query.days || req.query.limit || '7', 10);
            const history = await ratesService_1.ratesService.getHistory(type, days);
            res.status(200).json({
                success: true,
                type,
                days,
                count: history.length,
                data: history
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener histórico de tasas'
            });
        }
    }
}
exports.RatesController = RatesController;
exports.ratesController = new RatesController();
//# sourceMappingURL=ratesController.js.map