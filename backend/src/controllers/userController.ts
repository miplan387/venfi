import { Response } from 'express';
import { userService } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class UserController {
  public async getDashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Usuario no autenticado' });
        return;
      }

      const dashboard = await userService.getUserDashboard(userId);
      res.status(200).json({
        success: true,
        data: dashboard
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener datos del dashboard'
      });
    }
  }
}

export const userController = new UserController();
