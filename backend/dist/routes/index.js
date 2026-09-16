"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const rankingRoutes_1 = __importDefault(require("./rankingRoutes"));
const paymentRoutes_1 = __importDefault(require("./paymentRoutes"));
const ratesRoutes_1 = __importDefault(require("./ratesRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const weatherRoutes_1 = __importDefault(require("./weatherRoutes"));
const remesasRoutes_1 = __importDefault(require("./remesasRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const visitsRoutes_1 = __importDefault(require("./visitsRoutes"));
const paymentMethodsRoutes_1 = __importDefault(require("./paymentMethodsRoutes"));
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/ranking', rankingRoutes_1.default);
router.use('/payments', paymentRoutes_1.default);
router.use('/rates', ratesRoutes_1.default);
router.use('/user', userRoutes_1.default);
router.use('/weather', weatherRoutes_1.default);
router.use('/remesas', remesasRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/visits', visitsRoutes_1.default);
router.use('/payment-methods', paymentMethodsRoutes_1.default);
router.use('/payments/methods', paymentMethodsRoutes_1.default);
// Health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'online',
        app: 'Venfi Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map