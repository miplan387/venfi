"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthMiddleware = exports.authenticateJwt = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateJwt = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            message: 'Acceso no autorizado. Token JWT requerido.'
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado.',
            error: err.name
        });
    }
};
exports.authenticateJwt = authenticateJwt;
const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = (0, jwt_1.verifyAccessToken)(token);
            req.user = decoded;
        }
        catch {
            // Si el token es inválido o no existe, continúa como anónimo/default
        }
    }
    next();
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
//# sourceMappingURL=authMiddleware.js.map