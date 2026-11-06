"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pagoMovilConfigSchema = exports.renewPaymentSchema = exports.approveRejectPaymentSchema = exports.verifyPaymentSchema = exports.paymentProofSchema = exports.createPagoMovilSchema = exports.clickTrackSchema = exports.paymentWebhookSchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
exports.createPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        position: zod_1.z.number().int().min(1).max(10),
        amountUsd: zod_1.z.number().positive(),
        durationHours: zod_1.z.number().int().positive().default(24),
        businessName: zod_1.z.string().min(2).max(150),
        targetUrl: zod_1.z.string().url('La URL de destino debe ser válida'),
        slogan: zod_1.z.string().min(5).max(255),
        category: zod_1.z.string().default('General'),
        avatar: zod_1.z.string().default('🚀'),
        paymentMethod: zod_1.z.string().default('binance'),
        zoneKey: zod_1.z.string().optional().default('nacional'),
        zone: zod_1.z.string().optional(),
        txHash: zod_1.z.string().optional(),
        referenceCode: zod_1.z.string().optional()
    })
});
exports.paymentWebhookSchema = zod_1.z.object({
    body: zod_1.z.object({
        merchantTradeNo: zod_1.z.string().optional(),
        orderId: zod_1.z.string().optional(),
        totalFee: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        tradeStatus: zod_1.z.string().optional(),
        status: zod_1.z.string().optional(),
        txHash: zod_1.z.string().optional(),
        bizId: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional()
    })
});
exports.clickTrackSchema = zod_1.z.object({
    params: zod_1.z.object({
        position: zod_1.z.string().regex(/^\d+$/, 'La posición debe ser un número entero')
    }),
    body: zod_1.z.object({
        referrer: zod_1.z.string().optional(),
        userAgent: zod_1.z.string().optional()
    }).optional()
});
exports.createPagoMovilSchema = zod_1.z.object({
    body: zod_1.z.object({
        position: zod_1.z.number().int().min(1).max(10),
        amountUsd: zod_1.z.number().positive().optional(),
        durationHours: zod_1.z.number().int().positive().default(24),
        businessName: zod_1.z.string().min(2).max(150),
        targetUrl: zod_1.z.string().url('La URL de destino debe ser válida'),
        slogan: zod_1.z.string().min(5).max(255),
        category: zod_1.z.string().default('General'),
        avatar: zod_1.z.string().default('🚀'),
        zoneKey: zod_1.z.string().optional().default('nacional'),
        zone_key: zod_1.z.string().optional()
    })
});
exports.paymentProofSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().min(1, 'El ID de orden es obligatorio'),
        referenceNumber: zod_1.z.string().optional(),
        referenceCode: zod_1.z.string().optional(),
        proofImageUrl: zod_1.z.string().optional()
    }).refine(data => data.referenceNumber || data.referenceCode, {
        message: 'El número o código de referencia es obligatorio',
        path: ['referenceNumber']
    })
});
exports.verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().min(1, 'El ID de orden es obligatorio'),
        isApproved: zod_1.z.boolean().optional(),
        adminNotes: zod_1.z.string().optional()
    })
});
exports.approveRejectPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        orderId: zod_1.z.string().min(1, 'El ID de orden es obligatorio'),
        adminNotes: zod_1.z.string().optional()
    })
});
exports.renewPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        position: zod_1.z.number().int().min(1).max(10).optional(),
        durationHours: zod_1.z.number().int().positive().optional(),
        paymentMethod: zod_1.z.string().optional(),
        paymentId: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional()
    })
});
exports.pagoMovilConfigSchema = zod_1.z.object({
    body: zod_1.z.object({
        bank: zod_1.z.string().min(2, 'El nombre del banco es obligatorio'),
        bankCode: zod_1.z.string().min(4).max(4).optional(),
        phone: zod_1.z.string().min(7).max(20),
        idNumber: zod_1.z.string().min(4).max(20),
        beneficiary: zod_1.z.string().optional(),
        beneficiaryName: zod_1.z.string().optional()
    })
});
//# sourceMappingURL=paymentSchemas.js.map