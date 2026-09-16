"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.binancePayService = exports.BinancePayService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const env_1 = require("../config/env");
class BinancePayService {
    /**
     * Genera un nonce aleatorio de 32 caracteres
     */
    generateNonce(length = 32) {
        return crypto_1.default.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    }
    /**
     * Genera la firma criptográfica HMAC-SHA512 requerida por la API de Binance Pay
     * Formato: timestamp + "\n" + nonce + "\n" + payload + "\n"
     */
    generateSignature(timestamp, nonce, payload) {
        const message = `${timestamp}\n${nonce}\n${payload}\n`;
        return crypto_1.default
            .createHmac('sha512', env_1.config.binancePay.secretKey)
            .update(message)
            .digest('hex')
            .toUpperCase();
    }
    /**
     * Valida la firma criptográfica en las notificaciones Webhook de Binance Pay
     */
    verifyWebhookSignature(timestamp, nonce, rawBody, signature) {
        if (!signature)
            return false;
        // Si estamos en modo sandbox/desarrollo y la firma es de prueba
        if (env_1.config.binancePay.env === 'sandbox' && signature === 'MOCK_SIGNATURE_DEV') {
            return true;
        }
        try {
            const ts = parseInt(timestamp, 10);
            const expectedSignature = this.generateSignature(ts, nonce, rawBody);
            return expectedSignature === signature.toUpperCase();
        }
        catch (err) {
            console.warn('[BinancePayService] Error al verificar firma:', err);
            return false;
        }
    }
    /**
     * Crea una orden comercial de cobro en Binance Pay
     */
    async createOrder(order) {
        const timestamp = Date.now();
        const nonce = this.generateNonce();
        const expireTime = timestamp + 15 * 60 * 1000; // 15 minutos de vigencia
        const payloadObj = {
            env: {
                terminalType: 'WEB'
            },
            merchantTradeNo: order.merchantTradeNo,
            orderAmount: order.orderAmount,
            currency: order.currency || 'USDT',
            goods: {
                goodsType: '02', // Virtual goods / Advertising
                goodsCategory: '6000',
                referenceGoodsId: `VENFI_${order.merchantTradeNo}`,
                goodsName: order.goodsName,
                goodsDetail: order.goodsDetail
            },
            returnUrl: `${env_1.config.frontendUrl}/?payment=success&orderId=${order.merchantTradeNo}`,
            cancelUrl: `${env_1.config.frontendUrl}/?payment=cancel&orderId=${order.merchantTradeNo}`
        };
        const payloadString = JSON.stringify(payloadObj);
        const signature = this.generateSignature(timestamp, nonce, payloadString);
        const headers = {
            'Content-Type': 'application/json',
            'BinancePay-Timestamp': timestamp.toString(),
            'BinancePay-Nonce': nonce,
            'BinancePay-Certificate-SN': env_1.config.binancePay.apiKey,
            'BinancePay-Signature': signature
        };
        // Si hay credenciales reales de Binance en producción, intenta llamar al endpoint oficial
        if (env_1.config.binancePay.apiKey && env_1.config.binancePay.apiKey !== 'binance_pay_test_api_key_venfi') {
            try {
                const response = await axios_1.default.post(env_1.config.binancePay.endpoint, payloadObj, { headers, timeout: 5000 });
                if (response.data && response.data.status === 'SUCCESS') {
                    const d = response.data.data;
                    return {
                        merchantTradeNo: order.merchantTradeNo,
                        prepayId: d.prepayId,
                        terminalType: d.terminalType,
                        expireTime: d.expireTime,
                        qrCodeUrl: d.qrcodeImg,
                        qrContent: d.qrContent,
                        checkoutUrl: d.checkoutUrl,
                        deeplink: d.deeplink,
                        universalUrl: d.universalUrl,
                        currency: order.currency,
                        amount: order.orderAmount
                    };
                }
            }
            catch (err) {
                console.warn('[BinancePayService] Error con API externa de Binance Pay, activando modo Sandbox/Mock:', err.message);
            }
        }
        // Modo Sandbox / Previsualización interactiva de alta fidelidad
        const prepayId = `BNC_${Date.now()}_${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
        const qrContent = `https://app.binance.com/qr/dplk55392817?merchantId=${env_1.config.binancePay.merchantId}&prepayId=${prepayId}&amount=${order.orderAmount}&currency=USDT`;
        const checkoutUrl = `https://pay.binance.com/es-LA/checkout?prepayId=${prepayId}&orderId=${order.merchantTradeNo}`;
        const deeplink = `bnc://app.binance.com/payment/secpay?orderId=${order.merchantTradeNo}`;
        return {
            merchantTradeNo: order.merchantTradeNo,
            prepayId,
            terminalType: 'WEB',
            expireTime,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrContent)}`,
            qrContent,
            checkoutUrl,
            deeplink,
            universalUrl: checkoutUrl,
            currency: order.currency || 'USDT',
            amount: order.orderAmount
        };
    }
}
exports.BinancePayService = BinancePayService;
exports.binancePayService = new BinancePayService();
//# sourceMappingURL=binancePayService.js.map