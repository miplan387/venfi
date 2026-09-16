import { Request, Response } from 'express';
import { adminService } from '../services/adminService';

export class AdminController {
  public async getCards(req: Request, res: Response): Promise<void> {
    try {
      const cards = await adminService.getAllCards();
      res.status(200).json({
        success: true,
        count: cards.length,
        data: cards
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener tarjetas del ranking'
      });
    }
  }

  public async updateCard(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.id as string;
      const updated = await adminService.updateCard(cardId, req.body);
      res.status(200).json({
        success: true,
        message: 'Tarjeta del ranking actualizada exitosamente',
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al actualizar la tarjeta'
      });
    }
  }

  public async toggleCardStatus(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.id as string;
      const result = await adminService.toggleCardStatus(cardId);
      res.status(200).json({
        success: true,
        message: `Estado de la tarjeta cambiado exitosamente`,
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al cambiar estado de la tarjeta'
      });
    }
  }

  public async renewCard(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.id as string;
      const hours = req.body.durationHours || 24;
      const result = await adminService.renewCard(cardId, hours);
      res.status(200).json({
        success: true,
        message: `Pauta extendida por ${hours} horas adicionales`,
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al renovar pauta de la tarjeta'
      });
    }
  }

  public async deleteCard(req: Request, res: Response): Promise<void> {
    try {
      const cardId = req.params.id as string;
      const result = await adminService.deleteCard(cardId);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al eliminar tarjeta'
      });
    }
  }
}

export const adminController = new AdminController();
