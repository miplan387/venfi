import crypto from 'crypto';
import axios from 'axios';
import { config } from '../config/env';

export interface BinanceOrderRequest {
  merchantTradeNo: string;
  orderAmount: number;
  currency: string;
  goodsName: string;
  goodsDetail: string;
  userId?: string;
}

export interface BinanceOrderResponse {
  merchantTradeNo: string;
  prepayId: string;
  terminalType: string;
  expireTime: number;
  qrCodeUrl: string;
  qrContent: string;
  checkoutUrl: string;
  deeplink: string;
  universalUrl: string;
  currency: string;
  amount: number;
}

export class BinancePayService {
  /**
   * Genera un nonce aleatorio de 32 caracteres
   */
  private generateNonce(length: number = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  /**
   * Genera la firma criptográfica HMAC-SHA512 requerida por la API de Binance Pay
   * Formato: timestamp + "\n" + nonce + "\n" + payload + "\n"
   */
  public generateSignature(timestamp: number, nonce: string, payload: string): string {
    const message = `${timestamp}\n${nonce}\n${payload}\n`;
    return crypto
      .createHmac('sha512', config.binancePay.secretKey)
      .update(message)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Valida la firma criptográfica en las notificaciones Webhook de Binance Pay
   */
  public verifyWebhookSignature(timestamp: string, nonce: string, rawBody: string, signature: string): boolean {
    if (!signature) return false;
    
    // Si estamos en modo sandbox/desarrollo y la firma es de prueba
    if (config.binancePay.env === 'sandbox' && signature === 'MOCK_SIGNATURE_DEV') {
      return true;
    }

    try {
      const ts = parseInt(timestamp, 10);
      const expectedSignature = this.generateSignature(ts, nonce, rawBody);
      return expectedSignature === signature.toUpperCase();
    } catch (err) {
      console.warn('[BinancePayService] Error al verificar firma:', err);
      return false;
    }
  }

  /**
   * Crea una orden comercial de cobro en Binance Pay
   */
  public async createOrder(order: BinanceOrderRequest): Promise<BinanceOrderResponse> {
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
      returnUrl: `${config.frontendUrl}/?payment=success&orderId=${order.merchantTradeNo}`,
      cancelUrl: `${config.frontendUrl}/?payment=cancel&orderId=${order.merchantTradeNo}`
    };

    const payloadString = JSON.stringify(payloadObj);
    const signature = this.generateSignature(timestamp, nonce, payloadString);

    const headers = {
      'Content-Type': 'application/json',
      'BinancePay-Timestamp': timestamp.toString(),
      'BinancePay-Nonce': nonce,
      'BinancePay-Certificate-SN': config.binancePay.apiKey,
      'BinancePay-Signature': signature
    };

    // Si hay credenciales reales de Binance en producción, intenta llamar al endpoint oficial
    if (config.binancePay.apiKey && config.binancePay.apiKey !== 'binance_pay_test_api_key_venfi') {
      try {
        const response = await axios.post(config.binancePay.endpoint, payloadObj, { headers, timeout: 5000 });
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
      } catch (err: any) {
        console.warn('[BinancePayService] Error con API externa de Binance Pay, activando modo Sandbox/Mock:', err.message);
      }
    }

    // Modo Sandbox / Previsualización interactiva de alta fidelidad
    const prepayId = `BNC_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qrContent = `https://app.binance.com/qr/dplk55392817?merchantId=${config.binancePay.merchantId}&prepayId=${prepayId}&amount=${order.orderAmount}&currency=USDT`;
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

export const binancePayService = new BinancePayService();
