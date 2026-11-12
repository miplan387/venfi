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

  /**
   * GET /api/admin/pricing
   * Obtiene todos los registros de zone_pricing para el Centro de Control
   */
  public async getAllPricing(req: Request, res: Response): Promise<void> {
    try {
      const pricing = await zonesService.getAllPricing();
      res.status(200).json({
        success: true,
        count: pricing.length,
        data: pricing
      });
    } catch (err: any) {
      console.error('[ZonesController Error]:', err);
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener la configuración de precios'
      });
    }
  }

  /**
   * PUT /api/admin/pricing/:id
   * Actualiza precio, duración y estado de un puesto en zone_pricing
   */
  public async updatePricing(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const { zone_key, position, tier, price_usd, duration_hours, is_active } = req.body || {};
      const updated = await zonesService.updatePricing(id, {
        zone_key,
        position,
        tier,
        price_usd,
        duration_hours,
        is_active
      });

      res.status(200).json({
        success: true,
        message: 'Tarifa y duración actualizadas exitosamente',
        data: updated
      });
    } catch (err: any) {
      console.error('[ZonesController Update Error]:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al actualizar la tarifa'
      });
    }
  }

  /**
   * POST /api/admin/pricing
   * Crea una nueva tarifa en zone_pricing
   */
  public async createPricing(req: Request, res: Response): Promise<void> {
    try {
      const { zone_key, position, tier, price_usd, duration_hours, is_active } = req.body || {};
      const created = await zonesService.createPricing({
        zone_key,
        position,
        tier,
        price_usd,
        duration_hours,
        is_active
      });

      res.status(201).json({
        success: true,
        message: 'Nueva tarifa creada exitosamente',
        data: created
      });
    } catch (err: any) {
      console.error('[ZonesController Create Error]:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al crear la tarifa'
      });
    }
  }

  /**
   * DELETE /api/admin/pricing/:id
   * Elimina una tarifa de zone_pricing
   */
  public async deletePricing(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await zonesService.deletePricing(id);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err: any) {
      console.error('[ZonesController Delete Error]:', err);
      res.status(400).json({
        success: false,
        message: err.message || 'Error al eliminar la tarifa'
      });
    }
  }
}

export const zonesController = new ZonesController();
