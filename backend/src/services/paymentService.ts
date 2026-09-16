import { db } from '../database/db';
import { rankingService } from './rankingService';
import { binancePayService } from './binancePayService';
import { ratesService } from './ratesService';
import { randomUUID } from 'crypto';

export interface PagoMovilBankData {
  bank: string;
  bankCode: string;
  phone: string;
  idNumber: string;
  beneficiaryName: string;
}

export class PaymentService {
  /**
   * Crea una nueva orden de pago para pautar en el ranking (Binance Pay o Zelle)
   */
  public async createPaymentOrder(userId: string | undefined, data: {
    position: number;
    amountUsd: number;
    durationHours?: number;
    businessName: string;
    targetUrl: string;
    slogan: string;
    category?: string;
    avatar?: string;
    paymentMethod?: string;
  }) {
    const paymentMethod = data.paymentMethod || 'binance';
    const duration = data.durationHours || 24;
    const expiresAt = new Date(Date.now() + duration * 3600 * 1000);
    const orderId = `VENFI_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const zellePaymentId = randomUUID();

    // Validar precio mínimo según posición requerida
    const expectedAmount = data.position === 1 ? 15.00 : (data.position <= 3 ? 10.00 : 5.00);
    const finalAmount = Math.max(data.amountUsd, expectedAmount);

    let paymentRecord: any;

    if (db.isPostgresActive) {
      const res = await db.query(
        `INSERT INTO payments (id, user_id, amount_usd, position, duration_hours, status, payment_method, business_name, target_url, slogan, category, avatar, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [
          orderId,
          userId || null,
          finalAmount,
          data.position,
          duration,
          paymentMethod,
          data.businessName,
          data.targetUrl,
          data.slogan,
          data.category || 'General',
          data.avatar || '🚀',
          expiresAt
        ]
      );
      paymentRecord = res.rows[0];

      // Si es Zelle o Zinli, registrar en la tabla zelle_payments
      if (paymentMethod === 'zelle' || paymentMethod === 'zinli') {
        await db.query(
          `INSERT INTO zelle_payments (id, user_id, order_id, amount_usd, position, status, created_at)
           VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP)`,
          [zellePaymentId, userId || null, orderId, finalAmount, data.position]
        );
      }
    } else {
      const store = db.getInMemoryStore();
      paymentRecord = {
        id: orderId,
        user_id: userId || null,
        amount_usd: finalAmount,
        position: data.position,
        duration_hours: duration,
        status: 'pending',
        payment_method: paymentMethod,
        tx_hash: null,
        business_name: data.businessName,
        target_url: data.targetUrl,
        slogan: data.slogan,
        category: data.category || 'General',
        avatar: data.avatar || '🚀',
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };
      store.payments.push(paymentRecord);

      if (paymentMethod === 'zelle' || paymentMethod === 'zinli') {
        store.zelle_payments.push({
          id: zellePaymentId,
          user_id: userId || null,
          order_id: orderId,
          amount_usd: finalAmount,
          position: data.position,
          reference_code: null,
          proof_image_url: null,
          status: 'pending',
          admin_notes: null,
          created_at: new Date().toISOString(),
          verified_at: null,
          completed_at: null
        });
      }
    }

    // Procesar según método de pago
    if (paymentMethod === 'binance') {
      const binanceOrder = await binancePayService.createOrder({
        merchantTradeNo: orderId,
        orderAmount: finalAmount,
        currency: 'USDT',
        goodsName: `Venfi Publicidad Ranking #${data.position}`,
        goodsDetail: data.slogan,
        userId
      });

      return {
        success: true,
        paymentId: paymentRecord.id,
        orderId,
        amountUsd: finalAmount,
        currency: 'USDT',
        paymentMethod: 'binance',
        binancePay: binanceOrder,
        message: 'Orden comercial de Binance Pay generada exitosamente. Escanea el código QR o abre Binance App.'
      };
    } else if (paymentMethod === 'zinli') {
      return {
        success: true,
        paymentId: paymentRecord.id,
        orderId,
        zellePaymentId,
        amountUsd: finalAmount,
        currency: 'USD',
        paymentMethod: 'zinli',
        zinliInfo: {
          recipientEmail: 'miplan3d@gmail.com',
          accountHolder: 'Venfi Publicidad',
          referenceNote: orderId,
          amount: finalAmount,
          instructions: 'Envía el monto exacto vía Zinli al correo miplan3d@gmail.com. Luego reporta tu número de referencia.'
        },
        message: 'Datos de Zinli generados. Reporta tu comprobante para activación.'
      };
    } else {
      return {
        success: true,
        paymentId: paymentRecord.id,
        orderId,
        zellePaymentId,
        amountUsd: finalAmount,
        currency: 'USD',
        paymentMethod: 'zelle',
        zelleInfo: {
          recipientEmail: 'pagos@venfi.app',
          accountHolder: 'Venfi Media LLC',
          referenceNote: orderId,
          amount: finalAmount,
          instructions: 'Envía el monto exacto vía Zelle colocando tu Order ID en el campo de nota de la transferencia. Luego reporta tu número de referencia.'
        },
        message: 'Datos de transferencia Zelle generados. Reporta tu comprobante para activación.'
      };
    }
  }

  /**
   * Procesa el Webhook de Binance Pay y activa la pauta en el ranking
   */
  public async processWebhook(payload: any, headers?: any) {
    const orderId = payload.merchantTradeNo || payload.orderId || payload.bizId || payload.data?.merchantTradeNo;
    const txHash = payload.txHash || payload.data?.transactionId || `TX_${Date.now()}_BINANCE`;
    const tradeStatus = payload.tradeStatus || payload.data?.status || 'SUCCESS';

    if (tradeStatus !== 'SUCCESS' && tradeStatus !== 'PAID') {
      return { success: false, message: `Estado de pago no completado: ${tradeStatus}` };
    }

    let payment: any;

    if (db.isPostgresActive) {
      let res = await db.query(
        'SELECT * FROM payments WHERE id::text = $1 OR id::text LIKE $2 LIMIT 1',
        [orderId, `%${orderId}%`]
      );
      payment = res.rows[0];

      if (!payment) {
        const latestRes = await db.query(
          "SELECT * FROM payments WHERE status = 'pending' ORDER BY created_at DESC LIMIT 1"
        );
        payment = latestRes.rows[0];
      }

      if (payment) {

        // Actualizar estado a completed
        await db.query(
          "UPDATE payments SET status = 'completed', tx_hash = $1 WHERE id = $2",
          [txHash, payment.id]
        );

        // Desplegar anuncio en el Ranking
        await rankingService.placeAdInRanking({
          userId: payment.user_id,
          paymentId: payment.id,
          position: payment.position,
          businessName: payment.business_name,
          targetUrl: payment.target_url,
          slogan: payment.slogan,
          category: payment.category,
          avatar: payment.avatar,
          amountPaid: Number(payment.amount_usd),
          durationHours: payment.duration_hours
        });

        // Crear notificación de confirmación
        if (payment.user_id) {
          await db.query(
            "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, 'payment')",
            [payment.user_id, `¡Pago verificado! Tu anuncio '${payment.business_name}' ya está en el puesto #${payment.position} del Ranking.`]
          );
        }

        return {
          success: true,
          message: 'Pago de Binance Pay verificado exitosamente y ranking actualizado.',
          orderId: payment.id,
          position: payment.position,
          businessName: payment.business_name
        };
      }
    }

    // Modo Memoria
    const store = db.getInMemoryStore();
    payment = store.payments.find(p => p.id === orderId || (typeof orderId === 'string' && p.id.includes(orderId)));

    if (!payment && store.payments.length > 0) {
      payment = store.payments[store.payments.length - 1]; // Toma el más reciente para testing
    }

    if (payment) {
      payment.status = 'completed';
      payment.tx_hash = txHash;

      await rankingService.placeAdInRanking({
        userId: payment.user_id,
        paymentId: payment.id,
        position: payment.position,
        businessName: payment.business_name,
        targetUrl: payment.target_url,
        slogan: payment.slogan,
        category: payment.category,
        avatar: payment.avatar,
        amountPaid: Number(payment.amount_usd),
        durationHours: payment.duration_hours
      });

      if (payment.user_id) {
        store.notifications.push({
          id: `notif_${Date.now()}`,
          user_id: payment.user_id,
          message: `¡Pago verificado! Tu anuncio '${payment.business_name}' ya está en el puesto #${payment.position} del Ranking.`,
          type: 'payment',
          created_at: new Date().toISOString(),
          is_read: false
        });
      }

      return {
        success: true,
        message: 'Pago de Binance Pay verificado exitosamente y ranking actualizado.',
        orderId: payment.id,
        position: payment.position,
        businessName: payment.business_name
      };
    }

    return { success: false, message: 'No se encontró la orden de pago asociada.' };
  }

  /**
   * Consulta el estado de una orden de pago
   */
  public async getPaymentStatus(orderId: string) {
    if (db.isPostgresActive) {
      const res = await db.query('SELECT * FROM payments WHERE id::text = $1', [orderId]);
      if (res.rows.length === 0) {
        throw new Error('Orden no encontrada');
      }
      return res.rows[0];
    }

    const store = db.getInMemoryStore();
    const payment = store.payments.find(p => p.id === orderId);
    if (!payment) {
      throw new Error('Orden no encontrada');
    }
    return payment;
  }

  /**
   * Permite al usuario reportar comprobante y código de referencia Zelle
   */
  public async submitZelleProof(orderId: string, referenceCode: string, proofImageUrl?: string) {
    if (db.isPostgresActive) {
      await db.query(
        `UPDATE zelle_payments 
         SET reference_code = $1, proof_image_url = $2, status = 'pending'
         WHERE order_id = $3`,
        [referenceCode, proofImageUrl || null, orderId]
      );

      await db.query(
        "UPDATE payments SET status = 'pending', tx_hash = $1 WHERE id::text = $2",
        [referenceCode, orderId]
      );

      return {
        success: true,
        message: 'Comprobante Zelle registrado exitosamente. Nuestro equipo administrativo verificará la transacción en minutos.'
      };
    }

    const store = db.getInMemoryStore();
    let zelle = store.zelle_payments.find(z => z.order_id === orderId);
    if (!zelle) {
      zelle = {
        id: randomUUID(),
        user_id: null,
        order_id: orderId,
        amount_usd: 15.00,
        position: 1,
        reference_code: referenceCode,
        proof_image_url: proofImageUrl || null,
        status: 'pending',
        admin_notes: null,
        created_at: new Date().toISOString(),
        verified_at: null,
        completed_at: null
      };
      store.zelle_payments.push(zelle);
    } else {
      zelle.reference_code = referenceCode;
      zelle.proof_image_url = proofImageUrl || null;
      zelle.status = 'pending';
    }

    const payment = store.payments.find(p => p.id === orderId);
    if (payment) {
      payment.status = 'pending';
      payment.tx_hash = referenceCode;
    }

    return {
      success: true,
      message: 'Comprobante Zelle registrado exitosamente. Nuestro equipo administrativo verificará la transacción en minutos.'
    };
  }

  /**
   * Obtiene la lista de pagos Zelle pendientes de verificación para el panel administrativo
   */
  public async getPendingZellePayments() {
    if (db.isPostgresActive) {
      const res = await db.query(
        `SELECT z.*, p.business_name, p.target_url, p.slogan, p.category, p.avatar, u.email as user_email
         FROM zelle_payments z
         JOIN payments p ON z.order_id = p.id::text
         LEFT JOIN users u ON z.user_id = u.id
         WHERE z.status IN ('pending', 'verified')
         ORDER BY z.created_at DESC`
      );
      return res.rows;
    }

    const store = db.getInMemoryStore();
    return store.zelle_payments.map(z => {
      const payment = store.payments.find(p => p.id === z.order_id) || {};
      const user = store.users.find(u => u.id === z.user_id) || {};
      return {
        ...z,
        business_name: payment.business_name || 'Anunciante Venfi',
        target_url: payment.target_url || 'https://venfi.app',
        slogan: payment.slogan || 'Campaña publicitaria',
        category: payment.category || 'General',
        avatar: payment.avatar || '🚀',
        user_email: user.email || 'anunciante@venfi.app'
      };
    });
  }

  /**
   * Conciliación y verificación manual de pago Zelle por parte de un Administrador
   */
  public async verifyZellePaymentAdmin(orderId: string, isApproved: boolean, adminNotes?: string) {
    const now = new Date();
    const finalStatus = isApproved ? 'completed' : 'rejected';

    if (db.isPostgresActive) {
      const zelleRes = await db.query('SELECT * FROM zelle_payments WHERE order_id = $1', [orderId]);
      const paymentRes = await db.query('SELECT * FROM payments WHERE id::text = $1', [orderId]);

      if (paymentRes.rows.length === 0) {
        throw new Error('Orden de pago no encontrada');
      }

      const payment = paymentRes.rows[0];

      // Actualizar tabla zelle_payments
      await db.query(
        `UPDATE zelle_payments 
         SET status = $1, admin_notes = $2, verified_at = $3, completed_at = $4
         WHERE order_id = $5`,
        [finalStatus, adminNotes || (isApproved ? 'Aprobado manualmente' : 'Rechazado por fondos no recibidos'), now, isApproved ? now : null, orderId]
      );

      // Actualizar tabla payments
      await db.query(
        'UPDATE payments SET status = $1 WHERE id::text = $2',
        [finalStatus, orderId]
      );

      if (isApproved) {
        // Desplegar pauta en el Ranking
        await rankingService.placeAdInRanking({
          userId: payment.user_id,
          paymentId: payment.id,
          position: payment.position,
          businessName: payment.business_name,
          targetUrl: payment.target_url,
          slogan: payment.slogan,
          category: payment.category,
          avatar: payment.avatar,
          amountPaid: Number(payment.amount_usd),
          durationHours: payment.duration_hours
        });

        // Crear notificación para el usuario
        if (payment.user_id) {
          await db.query(
            "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, 'payment')",
            [payment.user_id, `¡Transferencia Zelle verificada! Tu anuncio '${payment.business_name}' ha sido activado en el puesto #${payment.position} del Ranking.`]
          );
        }
      } else {
        // Notificar rechazo
        if (payment.user_id) {
          await db.query(
            "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, 'alert')",
            [payment.user_id, `Tu pago Zelle para '${payment.business_name}' fue rechazado. Motivo: ${adminNotes || 'Referencia no encontrada en cuenta bancaria.'}`]
          );
        }
      }

      return {
        success: true,
        status: finalStatus,
        orderId,
        message: isApproved ? 'Pago Zelle aprobado y pauta activada en el ranking.' : 'Pago Zelle rechazado.'
      };
    }

    // Modo Memoria
    const store = db.getInMemoryStore();
    const zelle = store.zelle_payments.find(z => z.order_id === orderId);
    const payment = store.payments.find(p => p.id === orderId);

    if (zelle) {
      zelle.status = finalStatus;
      zelle.admin_notes = adminNotes || (isApproved ? 'Aprobado manualmente' : 'Rechazado');
      zelle.verified_at = now.toISOString();
      if (isApproved) zelle.completed_at = now.toISOString();
    }

    if (payment) {
      payment.status = finalStatus;

      if (isApproved) {
        await rankingService.placeAdInRanking({
          userId: payment.user_id,
          paymentId: payment.id,
          position: payment.position,
          businessName: payment.business_name,
          targetUrl: payment.target_url,
          slogan: payment.slogan,
          category: payment.category,
          avatar: payment.avatar,
          amountPaid: Number(payment.amount_usd),
          durationHours: payment.duration_hours
        });

        if (payment.user_id) {
          store.notifications.push({
            id: `notif_${Date.now()}`,
            user_id: payment.user_id,
            message: `¡Transferencia Zelle verificada! Tu anuncio '${payment.business_name}' ha sido activado en el puesto #${payment.position} del Ranking.`,
            type: 'payment',
            created_at: new Date().toISOString(),
            is_read: false
          });
        }
      } else {
        if (payment.user_id) {
          store.notifications.push({
            id: `notif_${Date.now()}`,
            user_id: payment.user_id,
            message: `Tu pago Zelle para '${payment.business_name}' fue rechazado. Motivo: ${adminNotes || 'Referencia no encontrada en cuenta bancaria.'}`,
            type: 'alert',
            created_at: new Date().toISOString(),
            is_read: false
          });
        }
      }
    }

    return {
      success: true,
      status: finalStatus,
      orderId,
      message: isApproved ? 'Pago Zelle aprobado y pauta activada en el ranking.' : 'Pago Zelle rechazado.'
    };
  }

  /**
   * Procesa la renovación de una pauta activa en el ranking extendiendo su duración
   */
  public async renewCampaign(userId: string | undefined, data: {
    paymentId?: string;
    position: number;
    durationHours?: number;
    paymentMethod?: string;
  }) {
    const duration = data.durationHours || 24;
    const expectedAmount = data.position === 1 ? 15.00 : (data.position <= 3 ? 10.00 : 5.00);
    const orderId = `VENFI_RENEW_${Date.now()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Obtener detalles de la pauta existente
    let businessName = 'Anuncio Renovado';
    let targetUrl = 'https://venfi.app';
    let slogan = 'Pauta publicitaria extendida en Venfi';
    let avatar = '🚀';
    let category = 'General';

    if (db.isPostgresActive && data.paymentId) {
      const res = await db.query('SELECT * FROM payments WHERE id::text = $1', [data.paymentId]);
      if (res.rows.length > 0) {
        const p = res.rows[0];
        businessName = p.business_name;
        targetUrl = p.target_url;
        slogan = p.slogan;
        avatar = p.avatar;
        category = p.category;
      }
    }

    return this.createPaymentOrder(userId, {
      position: data.position,
      amountUsd: expectedAmount,
      durationHours: duration,
      businessName,
      targetUrl,
      slogan,
      avatar,
      category,
      paymentMethod: data.paymentMethod || 'binance'
    });
  }

  private pagoMovilBankData: PagoMovilBankData = {
    bank: 'BNC (Banco Nacional de Crédito)',
    bankCode: '0191',
    phone: '0412-4160819',
    idNumber: 'V-11112387',
    beneficiaryName: 'Venfi Publicidad & Medios C.A.'
  };

  public getPagoMovilBankData(): PagoMovilBankData {
    return this.pagoMovilBankData;
  }

  public updatePagoMovilBankData(data: Partial<PagoMovilBankData>): PagoMovilBankData {
    this.pagoMovilBankData = { ...this.pagoMovilBankData, ...data };
    return this.pagoMovilBankData;
  }

  /**
   * 1. Solicita una orden de pago en Bolívares (VES) usando Pago Móvil
   */
  public async createPagoMovilOrder(userId: string | undefined, orderData: {
    position: number;
    amountUsd?: number;
    durationHours?: number;
    businessName: string;
    targetUrl: string;
    slogan: string;
    category?: string;
    avatar?: string;
  }) {
    const duration = orderData.durationHours || 24;
    const expiresAt = new Date(Date.now() + duration * 3600 * 1000);
    const orderId = `VENFI_PM_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Validar monto mínimo según puesto requerido
    const expectedAmount = orderData.position === 1 ? 15.00 : (orderData.position <= 3 ? 10.00 : 5.00);
    const finalAmountUsd = Math.max(orderData.amountUsd || expectedAmount, expectedAmount);

    // Obtener tasa BCV oficial
    const bcvRate = await ratesService.getBcvRate();
    const amountVes = Number((finalAmountUsd * bcvRate).toFixed(2));

    let paymentRecord: any;

    if (db.isPostgresActive) {
      const res = await db.query(
        `INSERT INTO payments (
          id, user_id, amount_usd, position, duration_hours, status, payment_method, 
          business_name, target_url, slogan, category, avatar, expires_at
        ) VALUES ($1, $2, $3, $4, $5, 'pending', 'pago_movil', $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          orderId,
          userId || null,
          finalAmountUsd,
          orderData.position,
          duration,
          orderData.businessName,
          orderData.targetUrl,
          orderData.slogan,
          orderData.category || 'General',
          orderData.avatar || '🚀',
          expiresAt
        ]
      );
      paymentRecord = res.rows[0];
    } else {
      const store = db.getInMemoryStore();
      paymentRecord = {
        id: orderId,
        user_id: userId || null,
        amount_usd: finalAmountUsd,
        position: orderData.position,
        duration_hours: duration,
        status: 'pending',
        payment_method: 'pago_movil',
        tx_hash: null,
        reference_number: null,
        proof_image_url: null,
        business_name: orderData.businessName,
        target_url: orderData.targetUrl,
        slogan: orderData.slogan,
        category: orderData.category || 'General',
        avatar: orderData.avatar || '🚀',
        created_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString()
      };
      store.payments.push(paymentRecord);
    }

    const cleanPhone = this.pagoMovilBankData.phone.replace(/[^0-9]/g, '');
    const cleanId = this.pagoMovilBankData.idNumber.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const qrPayload = `PAGOMOVIL|${this.pagoMovilBankData.bankCode}|${cleanPhone}|${cleanId}|${amountVes}|${orderId}`;

    let qrImage = '';
    try {
      const QRCode = await import('qrcode');
      qrImage = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: { dark: '#030712', light: '#ffffff' },
        width: 320
      });
    } catch (e) {
      console.warn('Error al generar QR de Pago Móvil en create:', e);
    }

    return {
      orderId,
      amountUsd: finalAmountUsd,
      amountVes,
      bcvRate,
      bankData: this.getPagoMovilBankData(),
      qrPayload,
      qrImage,
      payment: paymentRecord
    };
  }

  /**
   * Genera el código QR dinámico y payload interbancario de Pago Móvil para una orden
   */
  public async generatePagoMovilQR(orderId: string) {
    let payment: any;
    if (db.isPostgresActive) {
      const res = await db.query('SELECT * FROM payments WHERE id::text = $1', [orderId]);
      if (res.rows.length === 0) {
        throw new Error('Orden de Pago Móvil no encontrada.');
      }
      payment = res.rows[0];
    } else {
      const store = db.getInMemoryStore();
      payment = store.payments.find(p => p.id === orderId);
      if (!payment) {
        throw new Error('Orden de Pago Móvil no encontrada.');
      }
    }

    const bcvRate = await ratesService.getBcvRate();
    const amountUsd = Number(payment.amount_usd);
    const amountVes = Number((amountUsd * bcvRate).toFixed(2));
    const bankData = this.getPagoMovilBankData();

    const cleanPhone = bankData.phone.replace(/[^0-9]/g, '');
    const cleanId = bankData.idNumber.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    const qrPayload = `PAGOMOVIL|${bankData.bankCode}|${cleanPhone}|${cleanId}|${amountVes}|${orderId}`;

    const QRCode = await import('qrcode');
    const qrImage = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      color: {
        dark: '#030712',
        light: '#ffffff'
      },
      width: 320
    });

    return {
      orderId,
      amountUsd,
      amountVes,
      bcvRate,
      bankData,
      qrPayload,
      qrImage
    };
  }

  /**
   * 2. Registra el comprobante de pago móvil (número de referencia y captura)
   */
  public async uploadPagoMovilProof(orderId: string, referenceNumber: string, proofImageUrl?: string) {
    if (!orderId || !referenceNumber) {
      throw new Error('El ID de orden y el número de referencia son obligatorios.');
    }

    if (db.isPostgresActive) {
      const checkRes = await db.query('SELECT * FROM payments WHERE id::text = $1', [orderId]);
      if (checkRes.rows.length === 0) {
        throw new Error('Orden de Pago Móvil no encontrada.');
      }
      const current = checkRes.rows[0];
      if (current.status !== 'pending') {
        throw new Error(`La orden ya ha sido procesada con estado: ${current.status}`);
      }

      const updateRes = await db.query(
        `UPDATE payments 
         SET reference_number = $1, proof_image_url = $2, tx_hash = $1
         WHERE id::text = $3
         RETURNING *`,
        [referenceNumber.trim(), proofImageUrl || null, orderId]
      );

      return {
        success: true,
        message: 'Comprobante registrado exitosamente. Nuestro equipo administrativo verificará la transacción en minutos.',
        data: updateRes.rows[0]
      };
    }

    const store = db.getInMemoryStore();
    const payment = store.payments.find(p => p.id === orderId);
    if (!payment) {
      throw new Error('Orden de Pago Móvil no encontrada.');
    }
    if (payment.status !== 'pending') {
      throw new Error(`La orden ya ha sido procesada con estado: ${payment.status}`);
    }

    payment.reference_number = referenceNumber.trim();
    payment.proof_image_url = proofImageUrl || null;
    payment.tx_hash = referenceNumber.trim();

    return {
      success: true,
      message: 'Comprobante registrado exitosamente. Nuestro equipo administrativo verificará la transacción en minutos.',
      data: payment
    };
  }

  /**
   * 3. Devuelve todas las órdenes con payment_method = 'pago_movil' y status = 'pending'
   */
  public async listPagoMovilPending() {
    if (db.isPostgresActive) {
      const res = await db.query(
        `SELECT p.*, u.email as user_email, u.username as user_username
         FROM payments p
         LEFT JOIN users u ON p.user_id = u.id
         WHERE p.payment_method IN ('pago_movil', 'pagomovil') AND p.status = 'pending'
         ORDER BY p.created_at DESC`
      );
      return res.rows;
    }

    const store = db.getInMemoryStore();
    return store.payments
      .filter(p => (p.payment_method === 'pago_movil' || p.payment_method === 'pagomovil') && p.status === 'pending')
      .map(p => {
        const user = store.users.find(u => u.id === p.user_id) || {};
        return {
          ...p,
          user_email: user.email || 'anunciante@venfi.app',
          user_username: user.username || 'Anunciante'
        };
      });
  }

  /**
   * 4. Aprueba una orden de Pago Móvil y activa la pauta en el ranking
   */
  public async approvePagoMovil(orderId: string, adminNotes?: string) {
    if (db.isPostgresActive) {
      const paymentRes = await db.query('SELECT * FROM payments WHERE id::text = $1', [orderId]);
      if (paymentRes.rows.length === 0) {
        throw new Error('Orden de pago no encontrada.');
      }
      const payment = paymentRes.rows[0];

      await db.query(
        "UPDATE payments SET status = 'completed' WHERE id::text = $1",
        [orderId]
      );

      await rankingService.placeAdInRanking({
        userId: payment.user_id,
        paymentId: payment.id,
        position: payment.position,
        businessName: payment.business_name,
        targetUrl: payment.target_url,
        slogan: payment.slogan,
        category: payment.category,
        avatar: payment.avatar,
        amountPaid: Number(payment.amount_usd),
        durationHours: payment.duration_hours
      });

      if (payment.user_id) {
        await db.query(
          "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, 'payment')",
          [payment.user_id, `¡Pago Móvil verificado! Tu anuncio '${payment.business_name}' ha sido activado en el puesto #${payment.position} del Ranking.`]
        );
      }

      return {
        success: true,
        message: 'Pago aprobado y tarjeta activada',
        orderId,
        status: 'completed',
        adminNotes
      };
    }

    const store = db.getInMemoryStore();
    const payment = store.payments.find(p => p.id === orderId);
    if (!payment) {
      throw new Error('Orden de pago no encontrada.');
    }
    payment.status = 'completed';

    await rankingService.placeAdInRanking({
      userId: payment.user_id,
      paymentId: payment.id,
      position: payment.position,
      businessName: payment.business_name,
      targetUrl: payment.target_url,
      slogan: payment.slogan,
      category: payment.category,
      avatar: payment.avatar,
      amountPaid: Number(payment.amount_usd),
      durationHours: payment.duration_hours
    });

    return {
      success: true,
      message: 'Pago aprobado y tarjeta activada',
      orderId,
      status: 'completed',
      adminNotes
    };
  }

  /**
   * 5. Rechaza una orden de Pago Móvil
   */
  public async rejectPagoMovil(orderId: string, adminNotes?: string) {
    if (db.isPostgresActive) {
      const paymentRes = await db.query('SELECT * FROM payments WHERE id::text = $1', [orderId]);
      if (paymentRes.rows.length === 0) {
        throw new Error('Orden de pago no encontrada.');
      }
      const payment = paymentRes.rows[0];

      await db.query(
        "UPDATE payments SET status = 'rejected' WHERE id::text = $1",
        [orderId]
      );

      if (payment.user_id) {
        await db.query(
          "INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, 'alert')",
          [payment.user_id, `Tu Pago Móvil para '${payment.business_name}' fue rechazado. Motivo: ${adminNotes || 'Referencia bancaria no encontrada o inválida.'}`]
        );
      }

      return {
        success: true,
        message: 'Pago rechazado',
        orderId,
        status: 'rejected',
        adminNotes
      };
    }

    const store = db.getInMemoryStore();
    const payment = store.payments.find(p => p.id === orderId);
    if (!payment) {
      throw new Error('Orden de pago no encontrada.');
    }
    payment.status = 'rejected';

    return {
      success: true,
      message: 'Pago rechazado',
      orderId,
      status: 'rejected',
      adminNotes
    };
  }
}

export const paymentService = new PaymentService();

