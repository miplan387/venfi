import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class AuthController {
  public async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al registrar usuario'
      });
    }
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);
      res.status(200).json({
        success: true,
        message: 'Sesión iniciada exitosamente',
        data: result
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || 'Credenciales inválidas'
      });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);
      res.status(200).json({
        success: true,
        message: 'Token actualizado exitosamente',
        data: tokens
      });
    } catch (err: any) {
      res.status(401).json({
        success: false,
        message: err.message || 'Error al refrescar token'
      });
    }
  }

  public async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: 'No autenticado' });
        return;
      }
      const user = await authService.getMe(req.user.userId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err: any) {
      res.status(404).json({
        success: false,
        message: err.message || 'Usuario no encontrado'
      });
    }
  }

  public async googleAuth(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.googleAuth(req.body);
      res.status(200).json({
        success: true,
        message: 'Autenticación con Google exitosa',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error en autenticación con Google'
      });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ success: false, message: 'El correo electrónico es requerido' });
        return;
      }
      const result = await authService.forgotPassword(email);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al procesar la solicitud de recuperación'
      });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al restablecer la contraseña'
      });
    }
  }
}

export const authController = new AuthController();
