import { Request, Response } from 'express';
import * as goldDataService from '../services/goldDataService';

export const getGoldPrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const forceRefresh = req.query.forceRefresh === 'true';
    const data = await goldDataService.getGoldMarketData(forceRefresh);
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error en /api/market/gold:', error);
    res.status(500).json({ success: false, error: 'Error al obtener datos del oro' });
  }
};
