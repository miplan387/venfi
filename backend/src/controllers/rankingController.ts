import { Request, Response } from 'express';
import { rankingService } from '../services/rankingService';

export class RankingController {
  public async getRanking(req: Request, res: Response): Promise<void> {
    try {
      const top10 = await rankingService.getTop10();
      res.status(200).json({
        success: true,
        count: top10.length,
        data: top10,
        nextRotationHours: 24
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener el ranking'
      });
    }
  }

  public async trackClick(req: Request, res: Response): Promise<void> {
    try {
      const position = parseInt(req.params.position as string, 10);
      const ip = req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1';
      const referrer = req.body?.referrer || req.headers.referer || 'direct';
      const userAgent = req.body?.userAgent || req.headers['user-agent'] || 'unknown';

      const result = await rankingService.trackClick(position, { ip, referrer, userAgent });
      res.status(200).json({
        success: true,
        message: 'Clic registrado con éxito',
        data: result
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al registrar clic'
      });
    }
  }
}

export const rankingController = new RankingController();
