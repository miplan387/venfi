import { Request, Response } from 'express';
import { ratesService } from '../services/ratesService';

export class RatesController {
  public async getRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = await ratesService.getRates();
      res.status(200).json({
        success: true,
        data: rates
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener tasas de cambio'
      });
    }
  }

  public async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const type = (req.params.type || req.query.type || 'bcv') as string;
      const days = parseInt(req.query.days as string || req.query.limit as string || '7', 10);
      const history = await ratesService.getHistory(type, days);
      
      res.status(200).json({
        success: true,
        type,
        days,
        count: history.length,
        data: history
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener histórico de tasas'
      });
    }
  }
}

export const ratesController = new RatesController();
