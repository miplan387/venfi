"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remesasController = exports.RemesasController = void 0;
const remesasService_1 = require("../services/remesasService");
class RemesasController {
    // 1. Obtener comparativa en tiempo real (Público)
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
    // 2. Listar todos los proveedores / casas de cambio (Admin)
    async getAllProviders(req, res) {
        try {
            const providers = await remesasService_1.remesasService.getAllProviders();
            res.status(200).json({
                success: true,
                count: providers.length,
                data: providers
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener proveedores de remesas'
            });
        }
    }
    // 3. Obtener un proveedor específico por su key
    async getProviderByKey(req, res) {
        try {
            const key = req.params.key;
            const provider = await remesasService_1.remesasService.getProviderByKey(key);
            if (!provider) {
                res.status(404).json({
                    success: false,
                    message: `Proveedor de remesas '${key}' no encontrado`
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: provider
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener el proveedor de remesas'
            });
        }
    }
    // 4. Crear nuevo proveedor (Admin)
    async createProvider(req, res) {
        try {
            const { key, name, icon, description, countries, rate_multiplier, rate_usd_bs, buy_rate_multiplier, sell_rate_multiplier, buy_rate, sell_rate, commission_percent, commission_fixed_usd, delivery_time, payment_methods, delivery_methods, rating, badge, url, market_type, sort_order, is_active } = req.body;
            if (!key || !name) {
                res.status(400).json({
                    success: false,
                    message: 'Los campos key y name son obligatorios'
                });
                return;
            }
            const existing = await remesasService_1.remesasService.getProviderByKey(key);
            if (existing) {
                res.status(409).json({
                    success: false,
                    message: `El proveedor con key '${key}' ya existe`
                });
                return;
            }
            const created = await remesasService_1.remesasService.createProvider({
                key,
                name,
                icon,
                description,
                countries,
                rate_multiplier,
                rate_usd_bs,
                buy_rate_multiplier,
                sell_rate_multiplier,
                buy_rate,
                sell_rate,
                commission_percent,
                commission_fixed_usd,
                delivery_time,
                payment_methods,
                delivery_methods,
                rating,
                badge,
                url,
                market_type,
                sort_order,
                is_active
            });
            res.status(201).json({
                success: true,
                message: 'Casa de cambio / Proveedor de remesas creado exitosamente',
                data: created
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al crear proveedor de remesas'
            });
        }
    }
    // 5. Actualizar proveedor existente (Admin)
    async updateProvider(req, res) {
        try {
            const key = req.params.key;
            const updated = await remesasService_1.remesasService.updateProvider(key, req.body);
            if (!updated) {
                res.status(404).json({
                    success: false,
                    message: `Proveedor de remesas '${key}' no encontrado`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Proveedor de remesas actualizado exitosamente',
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al actualizar proveedor de remesas'
            });
        }
    }
    // 6. Activar/Desactivar proveedor con toggle (Admin)
    async toggleProviderActive(req, res) {
        try {
            const key = req.params.key;
            const updated = await remesasService_1.remesasService.toggleProviderActive(key);
            res.status(200).json({
                success: true,
                message: `Estado del proveedor '${key}' actualizado: ${updated?.is_active ? 'Activo' : 'Inactivo'}`,
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al cambiar estado del proveedor de remesas'
            });
        }
    }
    // 7. Eliminar proveedor (Admin)
    async deleteProvider(req, res) {
        try {
            const key = req.params.key;
            const deleted = await remesasService_1.remesasService.deleteProvider(key);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: `Proveedor de remesas '${key}' no encontrado`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: `Proveedor de remesas '${key}' eliminado exitosamente`
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al eliminar proveedor de remesas'
            });
        }
    }
}
exports.RemesasController = RemesasController;
exports.remesasController = new RemesasController();
//# sourceMappingURL=remesasController.js.map