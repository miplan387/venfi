import { Request, Response } from 'express';
import { paymentService } from '../services/paymentService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class PaymentController {
  public async createPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const order = await paymentService.createPaymentOrder(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Orden de pago generada exitosamente',
        data: order
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al generar la orden de pago'
      });
    }
  }

  public async webhook(req: Request, res: Response): Promise<void> {
    try {
      const headers = req.headers;
      const result = await paymentService.processWebhook(req.body, headers);
      res.status(200).json({
        returnCode: result.success ? 'SUCCESS' : 'FAIL',
        returnMessage: result.message,
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        returnCode: 'FAIL',
        returnMessage: err.message || 'Error al procesar webhook'
      });
    }
  }

  public async getStatus(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId as string;
      const status = await paymentService.getPaymentStatus(orderId);
      res.status(200).json({
        success: true,
        data: status
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Orden no encontrada'
      });
    }
  }

  public async submitZelleProof(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, referenceCode, proofImageUrl } = req.body;
      if (!orderId || !referenceCode) {
        res.status(400).json({
          success: false,
          message: 'Se requiere orderId y referenceCode'
        });
        return;
      }
      const result = await paymentService.submitZelleProof(orderId, referenceCode, proofImageUrl);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al enviar comprobante Zelle'
      });
    }
  }

  public async getPendingZelle(req: Request, res: Response): Promise<void> {
    try {
      const list = await paymentService.getPendingZellePayments();
      res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener pagos Zelle pendientes'
      });
    }
  }

  public async verifyZelle(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const result = await paymentService.verifyZellePaymentAdmin(orderId, isApproved, adminNotes);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al verificar pago Zelle'
      });
    }
  }

  public async renewPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const order = await paymentService.renewCampaign(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Orden de renovación generada exitosamente',
        data: order
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al procesar renovación de pauta'
      });
    }
  }

  public async createPagoMovilOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
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

      const order = await paymentService.createPagoMovilOrder(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Orden de Pago Móvil generada exitosamente',
        data: order
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al generar la orden de Pago Móvil'
      });
    }
  }

  public async uploadPagoMovilProof(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId, referenceNumber, proofImageUrl } = req.body;
      if (!orderId || !referenceNumber) {
        res.status(400).json({
          success: false,
          message: 'Se requiere orderId y referenceNumber'
        });
        return;
      }
      const result = await paymentService.uploadPagoMovilProof(orderId, referenceNumber, proofImageUrl);
      res.status(200).json({
        success: true,
        message: 'Comprobante registrado',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al registrar comprobante de Pago Móvil'
      });
    }
  }

  public async listPagoMovilPending(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const list = await paymentService.listPagoMovilPending();
      res.status(200).json({
        success: true,
        count: list.length,
        data: list
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al listar pagos móviles pendientes'
      });
    }
  }

  public async approvePagoMovil(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId, adminNotes } = req.body;
      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el orderId de la transacción'
        });
        return;
      }
      const result = await paymentService.approvePagoMovil(orderId, adminNotes);
      res.status(200).json({
        success: true,
        message: 'Pago aprobado y tarjeta activada',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al aprobar Pago Móvil'
      });
    }
  }

  public async rejectPagoMovil(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { orderId, adminNotes } = req.body;
      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el orderId de la transacción'
        });
        return;
      }
      const result = await paymentService.rejectPagoMovil(orderId, adminNotes);
      res.status(200).json({
        success: true,
        message: 'Pago rechazado',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al rechazar Pago Móvil'
      });
    }
  }

  public async generatePagoMovilQR(req: Request, res: Response): Promise<void> {
    try {
      const orderId = req.params.orderId as string;
      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Se requiere el parámetro orderId'
        });
        return;
      }
      const data = await paymentService.generatePagoMovilQR(orderId);
      res.status(200).json({
        success: true,
        data
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Error al generar código QR para Pago Móvil'
      });
    }
  }

  public async getPagoMovilConfig(req: Request, res: Response): Promise<void> {
    try {
      const data = paymentService.getPagoMovilBankData();
      res.status(200).json({
        success: true,
        data
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener configuración bancaria'
      });
    }
  }

  public async updatePagoMovilConfig(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { bank, bankCode, phone, idNumber, beneficiaryName } = req.body;
      const updated = paymentService.updatePagoMovilBankData({
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
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al actualizar configuración bancaria'
      });
    }
  }
}

export const paymentController = new PaymentController();
