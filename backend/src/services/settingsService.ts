import { db } from '../database/db';
import { paymentService } from './paymentService';

export interface PaymentSettingItem {
  key: string;
  value: Record<string, any>;
  updated_at?: string;
}

class SettingsService {
  /**
   * Obtiene todos los ajustes de configuración de pagos
   */
  public async getPaymentSettings(): Promise<Record<string, any>> {
    if (db.isPostgresActive) {
      const res = await db.query('SELECT key, value, updated_at FROM payment_settings ORDER BY key ASC');
      const settingsMap: Record<string, any> = {};
      for (const row of res.rows) {
        settingsMap[row.key] = {
          ...row.value,
          updated_at: row.updated_at
        };
      }
      return settingsMap;
    }

    const store = db.getInMemoryStore();
    const settingsMap: Record<string, any> = {};
    for (const item of store.payment_settings || []) {
      settingsMap[item.key] = {
        ...item.value,
        updated_at: item.updated_at
      };
    }
    return settingsMap;
  }

  /**
   * Obtiene la configuración de un método de pago por su key
   */
  public async getPaymentSettingByKey(key: string): Promise<Record<string, any> | null> {
    if (db.isPostgresActive) {
      const res = await db.query('SELECT key, value, updated_at FROM payment_settings WHERE key = $1', [key]);
      if (res.rows.length === 0) return null;
      return {
        ...res.rows[0].value,
        updated_at: res.rows[0].updated_at
      };
    }

    const store = db.getInMemoryStore();
    const found = (store.payment_settings || []).find((s: any) => s.key === key);
    if (!found) return null;
    return {
      ...found.value,
      updated_at: found.updated_at
    };
  }

  /**
   * Actualiza o crea la configuración de un método de pago
   */
  public async updatePaymentSetting(key: string, value: Record<string, any>): Promise<Record<string, any>> {
    // Si viene anidado en value, desempaquetar
    const cleanValue = value.value !== undefined ? value.value : value;

    if (db.isPostgresActive) {
      const res = await db.query(
        `INSERT INTO payment_settings (key, value, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [key, JSON.stringify(cleanValue)]
      );
      
      const updated = res.rows[0];

      // Si se actualiza pago_movil, sincronizar con paymentService
      if (key === 'pago_movil') {
        paymentService.updatePagoMovilBankData({
          bank: cleanValue.bank,
          phone: cleanValue.phone,
          idNumber: cleanValue.idNumber,
          beneficiaryName: cleanValue.beneficiary || cleanValue.beneficiaryName
        });
      }

      return {
        key: updated.key,
        value: updated.value,
        updated_at: updated.updated_at
      };
    }

    const store = db.getInMemoryStore();
    if (!store.payment_settings) {
      store.payment_settings = [];
    }
    const idx = store.payment_settings.findIndex((s: any) => s.key === key);
    const updatedRecord = {
      key,
      value: cleanValue,
      updated_at: new Date().toISOString()
    };

    if (idx >= 0) {
      store.payment_settings[idx] = updatedRecord;
    } else {
      store.payment_settings.push(updatedRecord);
    }

    if (key === 'pago_movil') {
      paymentService.updatePagoMovilBankData({
        bank: cleanValue.bank,
        phone: cleanValue.phone,
        idNumber: cleanValue.idNumber,
        beneficiaryName: cleanValue.beneficiary || cleanValue.beneficiaryName
      });
    }

    return updatedRecord;
  }
}

export const settingsService = new SettingsService();

