import { Request, Response } from 'express';
import { visitsService } from '../services/visitsService';

export class VisitsController {
  /**
   * Obtiene las estadísticas de visitas y usuarios activos actuales
   * GET /api/visits
   */
  public async getStats(req: Request, res: Response): Promise<void> {
    try {
      // Si el cliente envía un sessionId o IP, registrar su presencia activa
      const visitorId = (req.headers['x-visitor-id'] as string) || req.ip || 'anonymous';
      await visitsService.heartbeat(visitorId);

      const stats = await visitsService.getVisitsStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener estadísticas de visitas'
      });
    }
  }

  /**
   * Registra una nueva visita e incrementa el contador general
   * POST /api/visits/track
   */
  public async trackVisit(req: Request, res: Response): Promise<void> {
    try {
      const visitorId = (req.body?.visitorId as string) || (req.headers['x-visitor-id'] as string) || req.ip || 'anonymous';
      const stats = await visitsService.trackVisit(visitorId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al registrar visita'
      });
    }
  }

  /**
   * Mantiene viva la sesión de un usuario para cálculo de usuarios en línea (5 min)
   * POST /api/visits/heartbeat
   */
  public async heartbeat(req: Request, res: Response): Promise<void> {
    try {
      const visitorId = (req.body?.visitorId as string) || (req.headers['x-visitor-id'] as string) || req.ip || 'anonymous';
      const result = await visitsService.heartbeat(visitorId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error en heartbeat'
      });
    }
  }
}

export const visitsController = new VisitsController();
