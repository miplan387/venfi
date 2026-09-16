"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodsController = exports.PaymentMethodsController = void 0;
const paymentMethodsService_1 = require("../services/paymentMethodsService");
class PaymentMethodsController {
    // 1. Listar todos los métodos de pago (Admin)
    async getAll(req, res) {
        try {
            const methods = await paymentMethodsService_1.paymentMethodsService.getAll();
            res.status(200).json({
                success: true,
                count: methods.length,
                data: methods
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener métodos de pago'
            });
        }
    }
    // 2. Obtener solo los métodos activos (Público / Modal de pago)
    async getActive(req, res) {
        try {
            const methods = await paymentMethodsService_1.paymentMethodsService.getActive();
            res.status(200).json({
                success: true,
                count: methods.length,
                data: methods
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener métodos de pago activos'
            });
        }
    }
    // 3. Obtener un método específico por su key
    async getByKey(req, res) {
        try {
            const key = req.params.key;
            const method = await paymentMethodsService_1.paymentMethodsService.getByKey(key);
            if (!method) {
                res.status(404).json({
                    success: false,
                    message: `Método de pago '${key}' no encontrado`
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: method
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener el método de pago'
            });
        }
    }
    // 4. Crear un nuevo método de pago (Admin)
    async create(req, res) {
        try {
            const { key, name, icon, description, fields, is_active, requires_approval, sort_order } = req.body;
            if (!key || !name) {
                res.status(400).json({
                    success: false,
                    message: 'Los campos key y name son obligatorios'
                });
                return;
            }
            // Validar que la key no exista previamente
            const existing = await paymentMethodsService_1.paymentMethodsService.getByKey(key);
            if (existing) {
                res.status(409).json({
                    success: false,
                    message: `El método de pago con key '${key}' ya existe`
                });
                return;
            }
            const created = await paymentMethodsService_1.paymentMethodsService.create({
                key,
                name,
                icon,
                description,
                fields,
                is_active,
                requires_approval,
                sort_order
            });
            res.status(201).json({
                success: true,
                message: 'Método de pago creado exitosamente',
                data: created
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al crear método de pago'
            });
        }
    }
    // 5. Actualizar un método existente (Admin)
    async update(req, res) {
        try {
            const key = req.params.key;
            const updated = await paymentMethodsService_1.paymentMethodsService.update(key, req.body);
            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: `Método de pago '${key}' no encontrado`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Método de pago actualizado exitosamente',
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al actualizar método de pago'
            });
        }
    }
    // 6. Activar/Desactivar un método con un toggle (Admin)
    async toggleActive(req, res) {
        try {
            const key = req.params.key;
            const updated = await paymentMethodsService_1.paymentMethodsService.toggleActive(key);
            res.status(200).json({
                success: true,
                message: `Estado del método de pago '${key}' actualizado: ${updated?.is_active ? 'Activo' : 'Inactivo'}`,
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al cambiar estado del método de pago'
            });
        }
    }
    // 7. Eliminar método de pago (Admin)
    async delete(req, res) {
        try {
            const key = req.params.key;
            const deleted = await paymentMethodsService_1.paymentMethodsService.deleteMethod(key);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: `Método de pago '${key}' no encontrado`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: `Método de pago '${key}' eliminado exitosamente`
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al eliminar método de pago'
            });
        }
    }
}
exports.PaymentMethodsController = PaymentMethodsController;
exports.paymentMethodsController = new PaymentMethodsController();
//# sourceMappingURL=paymentMethodsController.js.map