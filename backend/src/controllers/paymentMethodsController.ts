import { Request, Response } from 'express';
import { paymentMethodsService } from '../services/paymentMethodsService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export class PaymentMethodsController {
  // 1. Listar todos los métodos de pago (Admin)
  public async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const methods = await paymentMethodsService.getAll();
      res.status(200).json({
        success: true,
        count: methods.length,
        data: methods
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener métodos de pago'
      });
    }
  }

  // 2. Obtener solo los métodos activos (Público / Modal de pago)
  public async getActive(req: Request, res: Response): Promise<void> {
    try {
      const methods = await paymentMethodsService.getActive();
      res.status(200).json({
        success: true,
        count: methods.length,
        data: methods
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener métodos de pago activos'
      });
    }
  }

  // 3. Obtener un método específico por su key
  public async getByKey(req: Request, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const method = await paymentMethodsService.getByKey(key);
      if (!method) {
        res.status(404).json({
          success: false,
          message: `Método de pago '${key}' no encontrado`
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: method
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener el método de pago'
      });
    }
  }

  // 4. Crear un nuevo método de pago (Admin)
  public async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { key, name, icon, description, fields, is_active, requires_approval, sort_order } = req.body;
      if (!key || !name) {
        res.status(400).json({
          success: false,
          message: 'Los campos key y name son obligatorios'
        });
        return;
      }

      // Validar que la key no exista previamente
      const existing = await paymentMethodsService.getByKey(key);
      if (existing) {
        res.status(409).json({
          success: false,
          message: `El método de pago con key '${key}' ya existe`
        });
        return;
      }

      const created = await paymentMethodsService.create({
        key,
        name,
        icon,
        description,
        fields,
        is_active,
        requires_approval,
        sort_order
      });

      res.status(201).json({
        success: true,
        message: 'Método de pago creado exitosamente',
        data: created
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al crear método de pago'
      });
    }
  }

  // 5. Actualizar un método existente (Admin)
  public async update(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const updated = await paymentMethodsService.update(key, req.body);
      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Método de pago '${key}' no encontrado`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: 'Método de pago actualizado exitosamente',
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al actualizar método de pago'
      });
    }
  }

  // 6. Activar/Desactivar un método con un toggle (Admin)
  public async toggleActive(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const updated = await paymentMethodsService.toggleActive(key);
      res.status(200).json({
        success: true,
        message: `Estado del método de pago '${key}' actualizado: ${updated?.is_active ? 'Activo' : 'Inactivo'}`,
        data: updated
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Error al cambiar estado del método de pago'
      });
    }
  }

  // 7. Eliminar método de pago (Admin)
  public async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const key = req.params.key as string;
      const deleted = await paymentMethodsService.deleteMethod(key);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: `Método de pago '${key}' no encontrado`
        });
        return;
      }
      res.status(200).json({
        success: true,
        message: `Método de pago '${key}' eliminado exitosamente`
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Error al eliminar método de pago'
      });
    }
  }
}

export const paymentMethodsController = new PaymentMethodsController();
