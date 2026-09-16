import { Request, Response } from 'express';
import { remesasService } from '../services/remesasService';

export class RemesasController {
  public async getRemesas(req: Request, res: Response): Promise<void> {
    try {
      const amountParam = req.query.amount ? parseFloat(req.query.amount as string) : 100;
      const countryParam = (req.query.country as string) || 'COLOMBIA';
      const comparison = await remesasService.getRemesas(amountParam, countryParam);
      res.status(200).json({
        success: true,
        data: comparison
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al calcular la comparativa de remesas'
      });
    }
  }
}

export const remesasController = new RemesasController();
