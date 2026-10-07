import { Request, Response } from 'express';
import { remesasService } from '../services/remesasService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class RemesasController {
  // 1. Obtener comparativa en tiempo real (Público)
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

  // 2. Listar todos los proveedores / casas de cambio (Admin)
  public async getAllProviders(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const providers = await remesasService.getAllProviders();
      res.status(200).json({
        success: true,
        count: providers.length,
        data: providers
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener proveedores de remesas'
      });
    }
  }

  // 3. Obtener un proveedor específico por su key
  public async getProviderByKey(req: Request, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const provider = await remesasService.getProviderByKey(key);
      if (!provider) {
        res.status(404).json({
          success: false,
          message: `Proveedor de remesas '${key}' no encontrado`
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: provider
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener el proveedor de remesas'
      });
    }
  }

  // 4. Crear nuevo proveedor (Admin)
  public async createProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        key, name, icon, description, countries,
        rate_multiplier, rate_usd_bs,
        buy_rate_multiplier, sell_rate_multiplier,
        buy_rate, sell_rate,
        commission_percent, commission_fixed_usd, delivery_time, payment_methods,
        delivery_methods, rating, badge, url, market_type, sort_order, is_active
      } = req.body;

      if (!key || !name) {
        res.status(400).json({
          success: false,
          message: 'Los campos key y name son obligatorios'
        });
        return;
      }

      const existing = await remesasService.getProviderByKey(key);
      if (existing) {
        res.status(409).json({
          success: false,
          message: `El proveedor con key '${key}' ya existe`
        });
        return;
      }

      const created = await remesasService.createProvider({
        key,
        name,
        icon,
        description,
        countries,
        rate_multiplier,
        rate_usd_bs,
        buy_rate_multiplier,
        sell_rate_multiplier,
        buy_rate,
        sell_rate,
        commission_percent,
        commission_fixed_usd,
        delivery_time,
        payment_methods,
        delivery_methods,
        rating,
        badge,
        url,
        market_type,
        sort_order,
        is_active
      });

      res.status(201).json({
        success: true,
        message: 'Casa de cambio / Proveedor de remesas creado exitosamente',
        data: created
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al crear proveedor de remesas'
      });
    }
  }

  // 5. Actualizar proveedor existente (Admin)
  public async updateProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const updated = await remesasService.updateProvider(key, req.body);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Proveedor de remesas '${key}' no encontrado`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Proveedor de remesas actualizado exitosamente',
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al actualizar proveedor de remesas'
      });
    }
  }

  // 6. Activar/Desactivar proveedor con toggle (Admin)
  public async toggleProviderActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const updated = await remesasService.toggleProviderActive(key);
      res.status(200).json({
        success: true,
        message: `Estado del proveedor '${key}' actualizado: ${updated?.is_active ? 'Activo' : 'Inactivo'}`,
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al cambiar estado del proveedor de remesas'
      });
    }
  }

  // 7. Eliminar proveedor (Admin)
  public async deleteProvider(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const deleted = await remesasService.deleteProvider(key);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `Proveedor de remesas '${key}' no encontrado`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Proveedor de remesas '${key}' eliminado exitosamente`
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al eliminar proveedor de remesas'
      });
    }
  }
}

export const remesasController = new RemesasController();
