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
    paymentMethod: z.string().default('binance'),
    zoneKey: z.string().optional().default('nacional'),
    zone: z.string().optional(),
    txHash: z.string().optional(),
    referenceCode: z.string().optional()
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

export const createPagoMovilSchema = z.object({
  body: z.object({
    position: z.number().int().min(1).max(10),
    amountUsd: z.number().positive().optional(),
    durationHours: z.number().int().positive().default(24),
    businessName: z.string().min(2).max(150),
    targetUrl: z.string().url('La URL de destino debe ser válida'),
    slogan: z.string().min(5).max(255),
    category: z.string().default('General'),
    avatar: z.string().default('🚀'),
    zoneKey: z.string().optional().default('nacional'),
    zone_key: z.string().optional()
  })
});

export const paymentProofSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'El ID de orden es obligatorio'),
    referenceNumber: z.string().optional(),
    referenceCode: z.string().optional(),
    proofImageUrl: z.string().optional()
  }).refine(data => data.referenceNumber || data.referenceCode, {
    message: 'El número o código de referencia es obligatorio',
    path: ['referenceNumber']
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'El ID de orden es obligatorio'),
    isApproved: z.boolean().optional(),
    adminNotes: z.string().optional()
  })
});

export const approveRejectPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'El ID de orden es obligatorio'),
    adminNotes: z.string().optional()
  })
});

export const renewPaymentSchema = z.object({
  body: z.object({
    position: z.number().int().min(1).max(10).optional(),
    durationHours: z.number().int().positive().optional(),
    paymentMethod: z.string().optional(),
    paymentId: z.union([z.string(), z.number()]).optional()
  })
});

export const pagoMovilConfigSchema = z.object({
  body: z.object({
    bank: z.string().min(2, 'El nombre del banco es obligatorio'),
    bankCode: z.string().min(4).max(4).optional(),
    phone: z.string().min(7).max(20),
    idNumber: z.string().min(4).max(20),
    beneficiary: z.string().optional(),
    beneficiaryName: z.string().optional()
  })
});
