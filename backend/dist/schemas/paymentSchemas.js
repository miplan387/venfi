"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clickTrackSchema = exports.paymentWebhookSchema = exports.createPaymentSchema = void 0;
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
        paymentMethod: zod_1.z.string().default('binance')
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
//# sourceMappingURL=paymentSchemas.js.map