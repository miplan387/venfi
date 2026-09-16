"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remesasController = exports.RemesasController = void 0;
const remesasService_1 = require("../services/remesasService");
class RemesasController {
    async getRemesas(req, res) {
        try {
            const amountParam = req.query.amount ? parseFloat(req.query.amount) : 100;
            const countryParam = req.query.country || 'COLOMBIA';
            const comparison = await remesasService_1.remesasService.getRemesas(amountParam, countryParam);
            res.status(200).json({
                success: true,
                data: comparison
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al calcular la comparativa de remesas'
            });
        }
    }
}
exports.RemesasController = RemesasController;
exports.remesasController = new RemesasController();
//# sourceMappingURL=remesasController.js.map