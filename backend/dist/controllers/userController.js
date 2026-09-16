"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const userService_1 = require("../services/userService");
class UserController {
    async getDashboard(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ success: false, message: 'Usuario no autenticado' });
                return;
            }
            const dashboard = await userService_1.userService.getUserDashboard(userId);
            res.status(200).json({
                success: true,
                data: dashboard
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                message: err.message || 'Error al obtener datos del dashboard'
            });
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=userController.js.map