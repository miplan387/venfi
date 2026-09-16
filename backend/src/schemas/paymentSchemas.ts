import { z } from 'zod';

export const createPaymentSchema = z.object({
  body: z.object({
    position: z.number().int().min(1).max(10),
    amountUsd: z.number().positive(),
    durationHours: z.number().int().positive().default(24),
    businessName: z.string().min(2).max(150),
    targetUrl: z.string().url('La URL de destino debe ser válida'),
    slogan: z.string().min(5).max(255),
    category: z.string().default('General'),
    avatar: z.string().default('🚀'),
    paymentMethod: z.string().default('binance')
  })
});

export const paymentWebhookSchema = z.object({
  body: z.object({
    merchantTradeNo: z.string().optional(),
    orderId: z.string().optional(),
    totalFee: z.union([z.string(), z.number()]).optional(),
    tradeStatus: z.string().optional(),
    status: z.string().optional(),
    txHash: z.string().optional(),
    bizId: z.union([z.string(), z.number()]).optional()
  })
});

export const clickTrackSchema = z.object({
  params: z.object({
    position: z.string().regex(/^\d+$/, 'La posición debe ser un número entero')
  }),
  body: z.object({
    referrer: z.string().optional(),
    userAgent: z.string().optional()
  }).optional()
});
