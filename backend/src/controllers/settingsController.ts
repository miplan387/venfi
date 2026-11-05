import { Request, Response } from 'express';
import { settingsService } from '../services/settingsService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class SettingsController {
  /**
   * GET /api/settings/payments (Público)
   * Devuelve la configuración actual de todos los métodos de pago
   */
  public async getPaymentSettings(req: Request, res: Response): Promise<void> {
    try {
      const settings = await settingsService.getPaymentSettings();
      res.status(200).json({
        success: true,
        data: settings
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener la configuración de pagos'
      });
    }
  }

  /**
   * PUT /api/settings/payments/:key (Protegido Admin)
   * Actualiza la configuración de un método de pago
   */
  public async updatePaymentSetting(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = (req.params.key as string)?.toLowerCase();
      if (!key) {
        res.status(400).json({
          success: false,
          message: 'El parámetro key del método de pago es obligatorio'
        });
        return;
      }

      const body = req.body;
      if (!body || typeof body !== 'object') {
        res.status(400).json({
          success: false,
          message: 'El cuerpo de la solicitud debe ser un objeto JSON válido'
        });
        return;
      }

      const updated = await settingsService.updatePaymentSetting(key, body);
      res.status(200).json({
        success: true,
        message: `Configuración de '${key}' actualizada exitosamente`,
        data: updated
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al actualizar la configuración de pago'
      });
    }
  }
}

export const settingsController = new SettingsController();

