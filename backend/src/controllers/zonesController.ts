import { Request, Response } from 'express';
import { zonesService } from '../services/zonesService';

export class ZonesController {
  /**
   * GET /api/zones
   * Obtiene la lista de zonas geográficas disponibles (Nacional, Caracas, Maracaibo, etc.)
   */
  public async getZones(req: Request, res: Response): Promise<void> {
    try {
      const zones = await zonesService.getAllZones();
      res.status(200).json({
        success: true,
        count: zones.length,
        data: zones
      });
    } catch (err: any) {
      console.error('[ZonesController Error]:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener la lista de zonas'
      });
    }
  }

  /**
   * GET /api/zones/:key/pricing
   * Obtiene la estructura de precios y tiers para una zona específica
   */
  public async getZonePricing(req: Request, res: Response): Promise<void> {
    try {
      const key = (req.params.key as string) || 'nacional';
      const pricing = await zonesService.getZonePricing(key);

      res.status(200).json({
        success: true,
        zone: key,
        count: pricing.length,
        data: pricing
      });
    } catch (err: any) {
      console.error('[ZonesController Error]:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener los precios de la zona'
      });
    }
  }
}

export const zonesController = new ZonesController();
