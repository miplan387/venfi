import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  // Si está autenticado y tiene rol 'admin', permitir
  if (req.user && req.user.role === 'admin') {
    next();
    return;
  }

  // Permitir si coincide con ADMIN_KEY configurado (o clave de desarrollo solo fuera de producción)
  const adminKey = req.headers['x-admin-key'];
  const expectedAdminKey = process.env.ADMIN_KEY || (process.env.NODE_ENV !== 'production' ? 'venfi-admin-2026' : '');
  if (expectedAdminKey && adminKey === expectedAdminKey) {
    req.user = {
      userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      email: 'soporte@venfidata.com',
      username: 'venfi_admin',
      role: 'admin'
    };
    next();
    return;
  }


  res.status(403).json({
    success: false,
    message: 'Acceso denegado. Se requieren privilegios de Administrador (Role: admin).'
  });
};
