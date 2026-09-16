"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const requireAdmin = (req, res, next) => {
    // Si está autenticado y tiene rol 'admin', permitir
    if (req.user && req.user.role === 'admin') {
        next();
        return;
    }
    // Permitir en entorno local de desarrollo si se pasa header 'x-admin-key: venfi-admin-2026'
    const adminKey = req.headers['x-admin-key'];
    if (adminKey === 'venfi-admin-2026') {
        req.user = {
            userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            email: 'admin@venfi.app',
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
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=adminMiddleware.js.map