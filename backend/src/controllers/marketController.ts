import { Request, Response } from 'express';
import { marketDataService } from '../services/marketDataService';

export class MarketController {
  /**
   * GET /api/market/oil o /api/market/petroleo
   * Retorna las cotizaciones del Petróleo Brent (EIA) y Crudo Merey 16 (Venezuela)
   */
  public async getOilPrices(req: Request, res: Response): Promise<void> {
    try {
      const forceRefresh = req.query.forceRefresh === 'true';
      const data = await marketDataService.getOilPrices(forceRefresh);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('[MarketController] Error al obtener precios del petróleo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener cotizaciones del mercado petrolero',
        error: error.message || 'Error interno'
      });
    }
  }
}

export const marketController = new MarketController();
