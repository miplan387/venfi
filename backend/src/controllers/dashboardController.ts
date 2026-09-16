import { Response } from 'express';
import { dashboardService } from '../services/dashboardService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class DashboardController {
  public async getSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'default_user';
      const summary = await dashboardService.getDashboardSummary(userId);
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener resumen del dashboard'
      });
    }
  }

  public async getClicks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'default_user';
      const days = parseInt(req.query.days as string || '7', 10);
      const history = await dashboardService.getClicksHistory(userId, days);
      res.status(200).json({
        success: true,
        count: history.length,
        data: history
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener historial de clics'
      });
    }
  }

  public async getGeolocation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'default_user';
      const geo = await dashboardService.getGeolocationData(userId);
      res.status(200).json({
        success: true,
        count: geo.length,
        data: geo
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener datos de geolocalización'
      });
    }
  }

  public async getCampaigns(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'default_user';
      const campaigns = await dashboardService.getActiveCampaigns(userId);
      res.status(200).json({
        success: true,
        count: campaigns.length,
        data: campaigns
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener campañas activas'
      });
    }
  }

  public async getPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'default_user';
      const payments = await dashboardService.getPaymentHistory(userId);
      res.status(200).json({
        success: true,
        count: payments.length,
        data: payments
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener historial de pagos'
      });
    }
  }

  public async getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId || 'default_user';
      const notifs = await dashboardService.getUserNotifications(userId);
      res.status(200).json({
        success: true,
        count: notifs.length,
        data: notifs
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener notificaciones'
      });
    }
  }
}

export const dashboardController = new DashboardController();
