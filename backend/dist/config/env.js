"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/venfi',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.JWT_SECRET || 'venfi_jwt_super_secret_access_key_2026_matrix_dark',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'venfi_jwt_super_secret_refresh_key_2026_matrix_dark',
    jwtExpiresIn: '1h',
    jwtRefreshExpiresIn: '7d',
    binancePay: {
        apiKey: process.env.BINANCE_PAY_API_KEY || 'binance_mock_api_key',
        secretKey: process.env.BINANCE_PAY_SECRET_KEY || 'binance_mock_secret_key',
        merchantId: process.env.BINANCE_PAY_MERCHANT_ID || '284910482',
        env: process.env.BINANCE_PAY_ENV || 'sandbox',
        webhookUrl: process.env.BINANCE_PAY_WEBHOOK_URL || 'http://localhost:5000/api/payments/webhook',
        endpoint: process.env.BINANCE_PAY_ENV === 'live'
            ? 'https://bpay.binanceapi.com/binancepay/openapi/v2/order'
            : 'https://bpay.binanceapi.com/binancepay/openapi/v2/order'
    },
    externalApis: {
        bcv: process.env.BCV_API_URL || 'https://ve.dolarapi.com/v1/dolares/oficial',
        paralelo: process.env.PARALELO_API_URL || 'https://ve.dolarapi.com/v1/dolares/paralelo',
        usdt: process.env.USDT_API_URL || 'https://ve.dolarapi.com/v1/dolares/usdt',
        openWeatherApiKey: process.env.OPENWEATHER_API_KEY || ''
    }
};
//# sourceMappingURL=env.js.map