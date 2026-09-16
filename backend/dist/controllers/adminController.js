"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
class AdminController {
    async getCards(req, res) {
        try {
            const cards = await adminService_1.adminService.getAllCards();
            res.status(200).json({
                success: true,
                count: cards.length,
                data: cards
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener tarjetas del ranking'
            });
        }
    }
    async updateCard(req, res) {
        try {
            const cardId = req.params.id;
            const updated = await adminService_1.adminService.updateCard(cardId, req.body);
            res.status(200).json({
                success: true,
                message: 'Tarjeta del ranking actualizada exitosamente',
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al actualizar la tarjeta'
            });
        }
    }
    async toggleCardStatus(req, res) {
        try {
            const cardId = req.params.id;
            const result = await adminService_1.adminService.toggleCardStatus(cardId);
            res.status(200).json({
                success: true,
                message: `Estado de la tarjeta cambiado exitosamente`,
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al cambiar estado de la tarjeta'
            });
        }
    }
    async renewCard(req, res) {
        try {
            const cardId = req.params.id;
            const hours = req.body.durationHours || 24;
            const result = await adminService_1.adminService.renewCard(cardId, hours);
            res.status(200).json({
                success: true,
                message: `Pauta extendida por ${hours} horas adicionales`,
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al renovar pauta de la tarjeta'
            });
        }
    }
    async deleteCard(req, res) {
        try {
            const cardId = req.params.id;
            const result = await adminService_1.adminService.deleteCard(cardId);
            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al eliminar tarjeta'
            });
        }
    }
}
exports.AdminController = AdminController;
exports.adminController = new AdminController();
//# sourceMappingURL=adminController.js.map