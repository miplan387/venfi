"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
class PaymentController {
    async createPayment(req, res) {
        try {
            const userId = req.user?.userId;
            const order = await paymentService_1.paymentService.createPaymentOrder(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Orden de pago generada exitosamente',
                data: order
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al generar la orden de pago'
            });
        }
    }
    async webhook(req, res) {
        try {
            const headers = req.headers;
            const result = await paymentService_1.paymentService.processWebhook(req.body, headers);
            res.status(200).json({
                returnCode: result.success ? 'SUCCESS' : 'FAIL',
                returnMessage: result.message,
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                returnCode: 'FAIL',
                returnMessage: err.message || 'Error al procesar webhook'
            });
        }
    }
    async getStatus(req, res) {
        try {
            const orderId = req.params.orderId;
            const status = await paymentService_1.paymentService.getPaymentStatus(orderId);
            res.status(200).json({
                success: true,
                data: status
            });
        }
        catch (err) {
            res.status(404).json({
                success: false,
                message: err.message || 'Orden no encontrada'
            });
        }
    }
    async submitZelleProof(req, res) {
        try {
            const { orderId, referenceCode, proofImageUrl } = req.body;
            if (!orderId || !referenceCode) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere orderId y referenceCode'
                });
                return;
            }
            const result = await paymentService_1.paymentService.submitZelleProof(orderId, referenceCode, proofImageUrl);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al enviar comprobante Zelle'
            });
        }
    }
    async getPendingZelle(req, res) {
        try {
            const list = await paymentService_1.paymentService.getPendingZellePayments();
            res.status(200).json({
                success: true,
                count: list.length,
                data: list
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener pagos Zelle pendientes'
            });
        }
    }
    async verifyZelle(req, res) {
        try {
            let { orderId, isApproved, adminNotes, action } = req.body;
            if (typeof isApproved !== 'boolean' && action) {
                isApproved = action === 'APPROVE';
            }
            if (!orderId || typeof isApproved !== 'boolean') {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere orderId y valor booleano isApproved o action ("APPROVE" | "REJECT")'
                });
                return;
            }
            const result = await paymentService_1.paymentService.verifyZellePaymentAdmin(orderId, isApproved, adminNotes);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al verificar pago Zelle'
            });
        }
    }
    async renewPayment(req, res) {
        try {
            const userId = req.user?.userId;
            const order = await paymentService_1.paymentService.renewCampaign(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Orden de renovación generada exitosamente',
                data: order
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al procesar renovación de pauta'
            });
        }
    }
    async createPagoMovilOrder(req, res) {
        try {
            const userId = req.user?.userId;
            const { position, businessName, targetUrl, slogan } = req.body;
            if (!position || !businessName || !targetUrl || !slogan) {
                res.status(400).json({
                    success: false,
                    message: 'Campos obligatorios requeridos: position, businessName, targetUrl, slogan'
                });
                return;
            }
            const order = await paymentService_1.paymentService.createPagoMovilOrder(userId, req.body);
            res.status(201).json({
                success: true,
                message: 'Orden de Pago Móvil generada exitosamente',
                data: order
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al generar la orden de Pago Móvil'
            });
        }
    }
    async uploadPagoMovilProof(req, res) {
        try {
            const { orderId, referenceNumber, proofImageUrl } = req.body;
            if (!orderId || !referenceNumber) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere orderId y referenceNumber'
                });
                return;
            }
            const result = await paymentService_1.paymentService.uploadPagoMovilProof(orderId, referenceNumber, proofImageUrl);
            res.status(200).json({
                success: true,
                message: 'Comprobante registrado',
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al registrar comprobante de Pago Móvil'
            });
        }
    }
    async listPagoMovilPending(req, res) {
        try {
            const list = await paymentService_1.paymentService.listPagoMovilPending();
            res.status(200).json({
                success: true,
                count: list.length,
                data: list
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al listar pagos móviles pendientes'
            });
        }
    }
    async approvePagoMovil(req, res) {
        try {
            const { orderId, adminNotes } = req.body;
            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere el orderId de la transacción'
                });
                return;
            }
            const result = await paymentService_1.paymentService.approvePagoMovil(orderId, adminNotes);
            res.status(200).json({
                success: true,
                message: 'Pago aprobado y tarjeta activada',
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al aprobar Pago Móvil'
            });
        }
    }
    async rejectPagoMovil(req, res) {
        try {
            const { orderId, adminNotes } = req.body;
            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere el orderId de la transacción'
                });
                return;
            }
            const result = await paymentService_1.paymentService.rejectPagoMovil(orderId, adminNotes);
            res.status(200).json({
                success: true,
                message: 'Pago rechazado',
                data: result
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al rechazar Pago Móvil'
            });
        }
    }
    async generatePagoMovilQR(req, res) {
        try {
            const orderId = req.params.orderId;
            if (!orderId) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere el parámetro orderId'
                });
                return;
            }
            const data = await paymentService_1.paymentService.generatePagoMovilQR(orderId);
            res.status(200).json({
                success: true,
                data
            });
        }
        catch (err) {
            res.status(404).json({
                success: false,
                message: err.message || 'Error al generar código QR para Pago Móvil'
            });
        }
    }
    async getPagoMovilConfig(req, res) {
        try {
            const data = paymentService_1.paymentService.getPagoMovilBankData();
            res.status(200).json({
                success: true,
                data
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener configuración bancaria'
            });
        }
    }
    async updatePagoMovilConfig(req, res) {
        try {
            const { bank, bankCode, phone, idNumber, beneficiaryName } = req.body;
            const updated = paymentService_1.paymentService.updatePagoMovilBankData({
                ...(bank && { bank }),
                ...(bankCode && { bankCode }),
                ...(phone && { phone }),
                ...(idNumber && { idNumber }),
                ...(beneficiaryName && { beneficiaryName })
            });
            res.status(200).json({
                success: true,
                message: 'Configuración bancaria de Pago Móvil actualizada correctamente',
                data: updated
            });
        }
        catch (err) {
            res.status(400).json({
                success: false,
                message: err.message || 'Error al actualizar configuración bancaria'
            });
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
//# sourceMappingURL=paymentController.js.map