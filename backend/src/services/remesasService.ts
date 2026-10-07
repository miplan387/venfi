import { db, pool } from '../database/db';
import { ratesService } from './ratesService';

export interface RemittanceProvider {
  id?: number;
  key: string;
  name: string;
  icon?: string;
  description?: string;
  countries?: string[];
  rate_multiplier?: number;
  rate_usd_bs?: number;
  buy_rate_multiplier?: number;
  sell_rate_multiplier?: number;
  buy_rate?: number;
  sell_rate?: number;
  commission_percent?: number;
  commission_fixed_usd?: number;
  delivery_time?: string;
  payment_methods?: string[];
  delivery_methods?: string[];
  rating?: number;
  badge?: string;
  url?: string;
  market_type?: 'official' | 'parallel';
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RemittanceOption {
  key: string;
  plataforma: string;
  icon: string;
  market_type: 'official' | 'parallel';
  buy_rate: number;
  sell_rate: number;
  buy_rate_multiplier: number;
  sell_rate_multiplier: number;
  tasa_compra_bs_por_usd: number;
  tasa_venta_bs_por_usd: number;
  tasa_compra_bs_por_origen: number;
  tasa_venta_bs_por_origen: number;
  tasa_bs_por_usd: number;
  tasa_bs_por_origen: number;
  moneda_origen: string;
  comision_origen: number;
  monto_neto_origen: number;
  monto_final_bs: number;
  tiempo_estimado: string;
  metodos_pago: string[];
  metodos_entrega: string[];
  calificacion: number;
  badge: string;
  url_afiliado: string;
  es_recomendado: boolean;
  es_mejor_oficial?: boolean;
  es_mejor_paralelo?: boolean;
}

export interface RemesasComparisonResult {
  pais_origen: string;
  moneda_origen: string;
  simbolo_origen: string;
  monto_enviado_origen: number;
  monto_enviado_usd: number;
  fecha_calculo: string;
  mejor_opcion: string;
  mejor_opcion_oficial?: string;
  mejor_opcion_paralelo?: string;
  tasa_base_bcv: number;
  tasa_base_usdt: number;
  diferencia_bs_ganancia: number;
  opciones: RemittanceOption[];
  opciones_oficiales: RemittanceOption[];
  opciones_paralelas: RemittanceOption[];
}

export class RemesasService {
  /**
   * Obtiene todos los proveedores configurados (Admin)
   */
  public async getAllProviders(): Promise<RemittanceProvider[]> {
    if (db.isPostgresActive) {
      const result = await pool.query(
        'SELECT * FROM remittance_providers ORDER BY sort_order ASC, id ASC'
      );
      return result.rows.map(this.normalizeProviderRow);
    }

    const store = db.getInMemoryStore();
    return [...(store.remittance_providers || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  /**
   * Obtiene solo los proveedores activos
   */
  public async getActiveProviders(): Promise<RemittanceProvider[]> {
    if (db.isPostgresActive) {
      const result = await pool.query(
        'SELECT * FROM remittance_providers WHERE is_active = true ORDER BY sort_order ASC, id ASC'
      );
      return result.rows.map(this.normalizeProviderRow);
    }

    const store = db.getInMemoryStore();
    return (store.remittance_providers || [])
      .filter(p => p.is_active)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }

  /**
   * Obtiene un proveedor por su key única
   */
  public async getProviderByKey(key: string): Promise<RemittanceProvider | null> {
    if (db.isPostgresActive) {
      const result = await pool.query(
        'SELECT * FROM remittance_providers WHERE key = $1',
        [key]
      );
      return result.rows[0] ? this.normalizeProviderRow(result.rows[0]) : null;
    }

    const store = db.getInMemoryStore();
    const found = (store.remittance_providers || []).find(p => p.key === key);
    return found || null;
  }

  /**
   * Crea un nuevo proveedor / casa de cambio
   */
  public async createProvider(data: Partial<RemittanceProvider>): Promise<RemittanceProvider> {
    if (!data.key || !data.name) {
      throw new Error('Los campos key y name son obligatorios');
    }

    const buyMultiplier = Number(data.buy_rate_multiplier ?? 0.975);
    const sellMultiplier = Number(data.sell_rate_multiplier ?? data.rate_multiplier ?? 1.0);
    const buyRate = Number(data.buy_rate ?? 0);
    const sellRate = Number(data.sell_rate ?? data.rate_usd_bs ?? 0);
    const marketType = data.market_type === 'official' ? 'official' : 'parallel';

    if (db.isPostgresActive) {
      const result = await pool.query(
        `INSERT INTO remittance_providers (
          key, name, icon, description, countries, rate_multiplier, rate_usd_bs,
          buy_rate_multiplier, sell_rate_multiplier, buy_rate, sell_rate,
          commission_percent, commission_fixed_usd, delivery_time, payment_methods,
          delivery_methods, rating, badge, url, market_type, sort_order, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING *`,
        [
          data.key,
          data.name,
          data.icon || '🏢',
          data.description || '',
          JSON.stringify(data.countries || []),
          sellMultiplier,
          sellRate,
          buyMultiplier,
          sellMultiplier,
          buyRate,
          sellRate,
          Number(data.commission_percent) || 0,
          Number(data.commission_fixed_usd) || 0,
          data.delivery_time || '24 horas',
          JSON.stringify(data.payment_methods || []),
          JSON.stringify(data.delivery_methods || []),
          Number(data.rating) || 4.5,
          data.badge || '',
          data.url || '',
          marketType,
          Number(data.sort_order) || 0,
          data.is_active !== undefined ? data.is_active : true
        ]
      );
      return this.normalizeProviderRow(result.rows[0]);
    }

    const store = db.getInMemoryStore();
    if (!store.remittance_providers) store.remittance_providers = [];
    const newItem: RemittanceProvider = {
      id: store.remittance_providers.length + 1,
      key: data.key,
      name: data.name,
      icon: data.icon || '🏢',
      description: data.description || '',
      countries: Array.isArray(data.countries) ? data.countries : [],
      rate_multiplier: sellMultiplier,
      rate_usd_bs: sellRate,
      buy_rate_multiplier: buyMultiplier,
      sell_rate_multiplier: sellMultiplier,
      buy_rate: buyRate,
      sell_rate: sellRate,
      commission_percent: Number(data.commission_percent) || 0,
      commission_fixed_usd: Number(data.commission_fixed_usd) || 0,
      delivery_time: data.delivery_time || '24 horas',
      payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
      delivery_methods: Array.isArray(data.delivery_methods) ? data.delivery_methods : [],
      rating: Number(data.rating) || 4.5,
      badge: data.badge || '',
      url: data.url || '',
      market_type: marketType,
      sort_order: Number(data.sort_order) || 0,
      is_active: data.is_active !== undefined ? data.is_active : true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.remittance_providers.push(newItem);
    return newItem;
  }

  /**
   * Actualiza un proveedor existente
   */
  public async updateProvider(key: string, data: Partial<RemittanceProvider>): Promise<RemittanceProvider | null> {
    if (db.isPostgresActive) {
      const updates: string[] = [];
      const values: any[] = [];
      let idx = 1;

      const fieldMap: Record<string, boolean> = {
        name: true, icon: true, description: true, countries: true,
        rate_multiplier: true, rate_usd_bs: true,
        buy_rate_multiplier: true, sell_rate_multiplier: true,
        buy_rate: true, sell_rate: true, market_type: true,
        commission_percent: true, commission_fixed_usd: true,
        delivery_time: true, payment_methods: true,
        delivery_methods: true, rating: true, badge: true, url: true,
        sort_order: true, is_active: true
      };

      for (const field of Object.keys(fieldMap)) {
        if ((data as any)[field] !== undefined) {
          updates.push(`${field} = $${idx}`);
          let val = (data as any)[field];
          if (['countries', 'payment_methods', 'delivery_methods'].includes(field)) {
            val = typeof val === 'string' ? val : JSON.stringify(val);
          }
          values.push(val);
          idx++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(key);

      const query = `UPDATE remittance_providers SET ${updates.join(', ')} WHERE key = $${idx} RETURNING *`;
      const result = await pool.query(query, values);
      return result.rows[0] ? this.normalizeProviderRow(result.rows[0]) : null;
    }

    const store = db.getInMemoryStore();
    if (!store.remittance_providers) store.remittance_providers = [];
    const idx = store.remittance_providers.findIndex(p => p.key === key);
    if (idx === -1) return null;

    store.remittance_providers[idx] = {
      ...store.remittance_providers[idx],
      ...data,
      updated_at: new Date().toISOString()
    };
    return store.remittance_providers[idx];
  }

  /**
   * Alterna el estado activo / inactivo de un proveedor
   */
  public async toggleProviderActive(key: string): Promise<RemittanceProvider | null> {
    const current = await this.getProviderByKey(key);
    if (!current) throw new Error('Proveedor de remesas no encontrado');
    const newStatus = !current.is_active;

    if (db.isPostgresActive) {
      const result = await pool.query(
        'UPDATE remittance_providers SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING *',
        [newStatus, key]
      );
      return result.rows[0] ? this.normalizeProviderRow(result.rows[0]) : null;
    }

    const store = db.getInMemoryStore();
    if (!store.remittance_providers) store.remittance_providers = [];
    const item = store.remittance_providers.find(p => p.key === key);
    if (item) {
      item.is_active = newStatus;
      item.updated_at = new Date().toISOString();
    }
    return item || null;
  }

  /**
   * Elimina un proveedor
   */
  public async deleteProvider(key: string): Promise<{ key: string } | null> {
    if (db.isPostgresActive) {
      const result = await pool.query(
        'DELETE FROM remittance_providers WHERE key = $1 RETURNING key',
        [key]
      );
      return result.rows[0] || null;
    }

    const store = db.getInMemoryStore();
    if (!store.remittance_providers) store.remittance_providers = [];
    const idx = store.remittance_providers.findIndex(p => p.key === key);
    if (idx !== -1) {
      store.remittance_providers.splice(idx, 1);
      return { key };
    }
    return null;
  }

  /**
   * Normaliza los campos JSON de PostgreSQL
   */
  private normalizeProviderRow(row: any): RemittanceProvider {
    return {
      ...row,
      countries: typeof row.countries === 'string' ? JSON.parse(row.countries) : (row.countries || []),
      payment_methods: typeof row.payment_methods === 'string' ? JSON.parse(row.payment_methods) : (row.payment_methods || []),
      delivery_methods: typeof row.delivery_methods === 'string' ? JSON.parse(row.delivery_methods) : (row.delivery_methods || []),
      rate_multiplier: Number(row.rate_multiplier) || 1.0,
      rate_usd_bs: Number(row.rate_usd_bs) || 0,
      buy_rate_multiplier: Number(row.buy_rate_multiplier) || 0.9750,
      sell_rate_multiplier: Number(row.sell_rate_multiplier) || Number(row.rate_multiplier) || 1.0000,
      buy_rate: Number(row.buy_rate) || 0,
      sell_rate: Number(row.sell_rate) || Number(row.rate_usd_bs) || 0,
      commission_percent: Number(row.commission_percent) || 0,
      commission_fixed_usd: Number(row.commission_fixed_usd) || 0,
      rating: Number(row.rating) || 4.5,
      market_type: row.market_type === 'official' ? 'official' : 'parallel',
      sort_order: Number(row.sort_order) || 0,
      is_active: Boolean(row.is_active)
    };
  }

  /**
   * Calcula la comparativa de remesas en tiempo real distinguiendo Mercado Oficial vs Paralelo
   * @param amount Monto en moneda de origen a enviar
   * @param originCountry País o moneda de origen ('COLOMBIA', 'PERU', 'CHILE', 'BRASIL', 'ARGENTINA', 'USA', 'ESPANA', etc.)
   */
  public async getRemesas(amount: number = 100, originCountry: string = 'USA'): Promise<RemesasComparisonResult> {
    const country = originCountry.toUpperCase();
    const ratesData = await ratesService.getRates();
    const bcvRate = ratesData.bcv.rate;
    const paraleloRate = ratesData.paralelo.rate;
    const usdtRate = ratesData.usdtBinance.rate;
    const euroRate = ratesData.euroBcv.rate;
    const latam = ratesData.latam;

    // Configuración de divisas de origen
    const countryConfig: Record<string, { code: string; symbol: string; name: string; rateVsUsd: number; rateVsVes: number }> = {
      COLOMBIA: { code: 'COP', symbol: '$', name: 'Colombia', rateVsUsd: latam.cop.rateVsUsd, rateVsVes: latam.cop.rateVsVes },
      COP: { code: 'COP', symbol: '$', name: 'Colombia', rateVsUsd: latam.cop.rateVsUsd, rateVsVes: latam.cop.rateVsVes },
      PERU: { code: 'PEN', symbol: 'S/', name: 'Perú', rateVsUsd: latam.pen.rateVsUsd, rateVsVes: latam.pen.rateVsVes },
      PEN: { code: 'PEN', symbol: 'S/', name: 'Perú', rateVsUsd: latam.pen.rateVsUsd, rateVsVes: latam.pen.rateVsVes },
      CHILE: { code: 'CLP', symbol: '$', name: 'Chile', rateVsUsd: latam.clp.rateVsUsd, rateVsVes: latam.clp.rateVsVes },
      CLP: { code: 'CLP', symbol: '$', name: 'Chile', rateVsUsd: latam.clp.rateVsUsd, rateVsVes: latam.clp.rateVsVes },
      BRASIL: { code: 'BRL', symbol: 'R$', name: 'Brasil', rateVsUsd: latam.brl.rateVsUsd, rateVsVes: latam.brl.rateVsVes },
      BRL: { code: 'BRL', symbol: 'R$', name: 'Brasil', rateVsUsd: latam.brl.rateVsUsd, rateVsVes: latam.brl.rateVsVes },
      ARGENTINA: { code: 'ARS', symbol: '$', name: 'Argentina', rateVsUsd: latam.ars.rateVsUsd, rateVsVes: latam.ars.rateVsVes },
      ARS: { code: 'ARS', symbol: '$', name: 'Argentina', rateVsUsd: latam.ars.rateVsUsd, rateVsVes: latam.ars.rateVsVes },
      ESPANA: { code: 'EUR', symbol: '€', name: 'España / Europa', rateVsUsd: ratesData.bcv.rate / (ratesData.euroBcv?.rate || 919.15), rateVsVes: euroRate },
      ESPAÑA: { code: 'EUR', symbol: '€', name: 'España / Europa', rateVsUsd: ratesData.bcv.rate / (ratesData.euroBcv?.rate || 919.15), rateVsVes: euroRate },
      EUR: { code: 'EUR', symbol: '€', name: 'España / Europa', rateVsUsd: ratesData.bcv.rate / (ratesData.euroBcv?.rate || 919.15), rateVsVes: euroRate },
      EUROPA: { code: 'EUR', symbol: '€', name: 'Europa', rateVsUsd: ratesData.bcv.rate / (ratesData.euroBcv?.rate || 919.15), rateVsVes: euroRate },
      ITALIA: { code: 'EUR', symbol: '€', name: 'Italia', rateVsUsd: ratesData.bcv.rate / (ratesData.euroBcv?.rate || 919.15), rateVsVes: euroRate },
      PANAMA: { code: 'USD', symbol: '$', name: 'Panamá', rateVsUsd: 1, rateVsVes: bcvRate },
      PAB: { code: 'USD', symbol: '$', name: 'Panamá', rateVsUsd: 1, rateVsVes: bcvRate },
      USA: { code: 'USD', symbol: '$', name: 'Estados Unidos', rateVsUsd: 1, rateVsVes: bcvRate },
      USD: { code: 'USD', symbol: '$', name: 'Estados Unidos', rateVsUsd: 1, rateVsVes: bcvRate }
    };

    const activeOrigin = countryConfig[country] || countryConfig.USA;
    const sentAmount = Math.max(1, amount || (activeOrigin.code === 'COP' ? 200000 : (activeOrigin.code === 'CLP' ? 50000 : 100)));
    const equivalentUsd = Number((sentAmount / activeOrigin.rateVsUsd).toFixed(2));

    // Obtener proveedores activos desde base de datos / memoria
    let activeProviders = await this.getActiveProviders();

    // Si no hay proveedores cargados, recurrir a los predeterminados
    if (!activeProviders || activeProviders.length === 0) {
      activeProviders = [
        {
          key: 'binance_p2p',
          name: 'Binance P2P (USDT / PagoMóvil)',
          icon: '🟡',
          rate_multiplier: 1.002,
          buy_rate_multiplier: 0.998,
          sell_rate_multiplier: 1.002,
          market_type: 'parallel',
          commission_percent: 0.0,
          commission_fixed_usd: 0.0,
          delivery_time: '5 - 15 min (Inmediato)',
          payment_methods: [`Pago local (${activeOrigin.code})`, 'PagoMóvil', 'Transferencia Bs'],
          delivery_methods: ['Pago Móvil', 'Transferencia Bs'],
          rating: 4.9,
          badge: 'MEJOR TASA & CERO COMISIÓN',
          url: 'https://p2p.binance.com/es-LA'
        },
        {
          key: 'airtm',
          name: 'Airtm Remesas',
          icon: '🔵',
          rate_multiplier: 0.985,
          buy_rate_multiplier: 0.965,
          sell_rate_multiplier: 0.985,
          market_type: 'parallel',
          commission_percent: 2.8,
          commission_fixed_usd: 0.5,
          delivery_time: '15 - 30 min',
          payment_methods: [`Bancos ${activeOrigin.name}`, 'PagoMóvil'],
          delivery_methods: ['Pago Móvil', 'Transferencia Bancaria'],
          rating: 4.6,
          badge: 'MULTIMONEDA DIÁSPORA',
          url: 'https://airtm.com'
        },
        {
          key: 'zoom',
          name: 'Zoom / Western Union Internacional',
          icon: '🔴',
          rate_multiplier: 0.95,
          buy_rate_multiplier: 0.930,
          sell_rate_multiplier: 0.950,
          market_type: 'parallel',
          commission_percent: 4.5,
          commission_fixed_usd: 1.5,
          delivery_time: '1 - 4 horas',
          payment_methods: ['Agencias Zoom', 'PagoMóvil', 'Retiro Efectivo'],
          delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Retiro Efectivo'],
          rating: 4.7,
          badge: 'RED OFICIAL AUTORIZADA',
          url: 'https://zoom.red/remesas'
        },
        {
          key: 'moneygram',
          name: 'MoneyGram Diáspora',
          icon: '🌐',
          rate_multiplier: 0.94,
          buy_rate_multiplier: 0.920,
          sell_rate_multiplier: 0.940,
          market_type: 'parallel',
          commission_percent: 5.0,
          commission_fixed_usd: 2.0,
          delivery_time: '24 horas',
          payment_methods: ['Depósito Bancario Directo'],
          delivery_methods: ['Depósito Bancario Directo'],
          rating: 4.4,
          badge: 'RED BANCARIA GLOBAL',
          url: 'https://moneygram.com'
        },
        {
          key: 'italcambio',
          name: 'ItalCambio',
          icon: '🇮🇹',
          rate_multiplier: 0.965,
          buy_rate_multiplier: 0.945,
          sell_rate_multiplier: 0.965,
          market_type: 'official',
          commission_percent: 3.5,
          commission_fixed_usd: 3.00,
          delivery_time: '24 - 48 horas',
          payment_methods: ['Transferencia EUR', 'Efectivo EUR'],
          delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Efectivo Bs'],
          rating: 4.5,
          badge: 'ESPECIALISTA EUROPA',
          url: 'https://italcambio.com'
        },
        {
          key: 'angulo_lopez',
          name: 'Casa de Cambio Angulo López',
          icon: '🏛️',
          rate_multiplier: 0.96,
          buy_rate_multiplier: 0.940,
          sell_rate_multiplier: 0.960,
          market_type: 'official',
          commission_percent: 3.8,
          commission_fixed_usd: 2.50,
          delivery_time: '12 - 24 horas',
          payment_methods: ['Transferencia Bancaria', 'Depósito en Efectivo', 'Zelle'],
          delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Efectivo Bs'],
          rating: 4.6,
          badge: 'TRADICIÓN & SEGURIDAD',
          url: 'https://casadecambioangulolopez.com'
        },
        {
          key: 'insular',
          name: 'Insular Tasa de Cambio',
          icon: '🏝️',
          countries: ['USA', 'COLOMBIA', 'BRASIL', 'ESPAÑA', 'ESPANA', 'EUR', 'CHILE', 'PERU', 'PANAMA'],
          rate_multiplier: 0.955,
          buy_rate_multiplier: 0.935,
          sell_rate_multiplier: 0.955,
          market_type: 'official',
          commission_percent: 4.0,
          commission_fixed_usd: 2.00,
          delivery_time: '24 horas',
          payment_methods: ['Transferencia Internacional', 'Efectivo USD/EUR'],
          delivery_methods: ['Pago Móvil', 'Transferencia Bs', 'Retiro Agencias'],
          rating: 4.4,
          badge: 'REGIÓN INSULAR & ORIENTE',
          url: 'https://insularcambio.com'
        }
      ];
    }

    // Filtrar proveedores que cubran el país seleccionado (o todos si no tienen restricción)
    const applicableProviders = activeProviders.filter(prov => {
      if (!prov.countries || prov.countries.length === 0) return true;
      const normalizedCountries = prov.countries.map(c => String(c).toUpperCase().trim());
      return normalizedCountries.includes(country) ||
        normalizedCountries.includes(activeOrigin.code) ||
        normalizedCountries.includes(activeOrigin.name.toUpperCase()) ||
        (activeOrigin.code === 'EUR' && (normalizedCountries.includes('ESPANA') || normalizedCountries.includes('ESPAÑA') || normalizedCountries.includes('EUROPA') || normalizedCountries.includes('ITALIA')));
    });

    const providersToCalculate = applicableProviders.length > 0 ? applicableProviders : activeProviders;

    // Calcular rendimiento final en Bolívares según mercado (Oficial BCV vs Paralelo USDT)
    const calculated: RemittanceOption[] = providersToCalculate.map((opt) => {
      const feePercent = Number(opt.commission_percent) || 0;
      const fixedFeeUsd = Number(opt.commission_fixed_usd) || 0;
      const marketType = opt.market_type === 'official' ? 'official' : 'parallel';
      
      const sellRateMultiplier = Number(opt.sell_rate_multiplier ?? opt.rate_multiplier ?? 1.0);
      const buyRateMultiplier = Number(opt.buy_rate_multiplier ?? 0.975);
      
      const fixedSellRateUsdBs = Number(opt.sell_rate ?? opt.rate_usd_bs ?? 0);
      const fixedBuyRateUsdBs = Number(opt.buy_rate ?? 0);

      // Tasa base según mercado: BCV para casas oficiales, USDT para mercado paralelo
      const baseRateUsd = marketType === 'official' ? bcvRate : usdtRate;

      // Cálculo de comisión en moneda de origen
      const comision_origen = Number(((sentAmount * (feePercent / 100)) + (fixedFeeUsd * activeOrigin.rateVsUsd)).toFixed(2));
      const monto_neto_origen = Number(Math.max(0, sentAmount - comision_origen).toFixed(2));
      const neto_usd = monto_neto_origen / activeOrigin.rateVsUsd;

      // Determinación de tasa de cambio Bs por USD (Compra y Venta)
      const tasa_venta_usd = fixedSellRateUsdBs > 0
        ? fixedSellRateUsdBs
        : Number((baseRateUsd * sellRateMultiplier).toFixed(2));

      const tasa_compra_usd = fixedBuyRateUsdBs > 0
        ? fixedBuyRateUsdBs
        : Number((baseRateUsd * buyRateMultiplier).toFixed(2));

      // Tasas por unidad de moneda de origen
      const tasa_venta_origen = Number((tasa_venta_usd / activeOrigin.rateVsUsd).toFixed(4));
      const tasa_compra_origen = Number((tasa_compra_usd / activeOrigin.rateVsUsd).toFixed(4));

      // La tasa efectiva y el monto final recibido por el familiar se calculan con la Tasa de Venta
      const tasa_bs_por_usd = tasa_venta_usd;
      const tasa_bs_por_origen = tasa_venta_origen;
      const monto_final_bs = Number((neto_usd * tasa_venta_usd).toFixed(2));

      return {
        key: opt.key,
        plataforma: opt.name,
        icon: opt.icon || '🏢',
        market_type: marketType,
        buy_rate: tasa_compra_origen,
        sell_rate: tasa_venta_origen,
        buy_rate_multiplier: buyRateMultiplier,
        sell_rate_multiplier: sellRateMultiplier,
        tasa_compra_bs_por_usd: tasa_compra_usd,
        tasa_venta_bs_por_usd: tasa_venta_usd,
        tasa_compra_bs_por_origen: tasa_compra_origen,
        tasa_venta_bs_por_origen: tasa_venta_origen,
        tasa_bs_por_usd,
        tasa_bs_por_origen,
        moneda_origen: activeOrigin.code,
        comision_origen,
        monto_neto_origen,
        monto_final_bs,
        tiempo_estimado: opt.delivery_time || '24 horas',
        metodos_pago: Array.isArray(opt.payment_methods) && opt.payment_methods.length > 0
          ? opt.payment_methods
          : [`Pago local (${activeOrigin.code})`, 'PagoMóvil'],
        metodos_entrega: Array.isArray(opt.delivery_methods) && opt.delivery_methods.length > 0
          ? opt.delivery_methods
          : ['Pago Móvil', 'Transferencia Bs'],
        calificacion: Number(opt.rating) || 4.5,
        badge: opt.badge || '',
        url_afiliado: opt.url || '',
        es_recomendado: false
      };
    });

    // Separar opciones por mercado
    const oficiales = calculated.filter(o => o.market_type === 'official').sort((a, b) => b.monto_final_bs - a.monto_final_bs);
    const paralelas = calculated.filter(o => o.market_type === 'parallel').sort((a, b) => b.monto_final_bs - a.monto_final_bs);

    // Resaltar la mejor opción de cada mercado
    if (oficiales.length > 0) {
      oficiales[0].es_mejor_oficial = true;
    }
    if (paralelas.length > 0) {
      paralelas[0].es_mejor_paralelo = true;
    }

    // Ordenar lista general por mayor rendimiento
    calculated.sort((a, b) => b.monto_final_bs - a.monto_final_bs);

    if (calculated.length > 0) {
      calculated[0].es_recomendado = true;
    }

    const mejorOpcion = calculated[0] || { plataforma: 'N/A', monto_final_bs: 0 };
    const peorOpcion = calculated[calculated.length - 1] || { plataforma: 'N/A', monto_final_bs: 0 };
    const diferencia_bs_ganancia = Number((mejorOpcion.monto_final_bs - peorOpcion.monto_final_bs).toFixed(2));

    return {
      pais_origen: activeOrigin.name,
      moneda_origen: activeOrigin.code,
      simbolo_origen: activeOrigin.symbol,
      monto_enviado_origen: sentAmount,
      monto_enviado_usd: equivalentUsd,
      fecha_calculo: new Date().toISOString(),
      mejor_opcion: mejorOpcion.plataforma,
      mejor_opcion_oficial: oficiales[0]?.plataforma,
      mejor_opcion_paralelo: paralelas[0]?.plataforma,
      tasa_base_bcv: bcvRate,
      tasa_base_usdt: usdtRate,
      diferencia_bs_ganancia,
      opciones: calculated,
      opciones_oficiales: oficiales,
      opciones_paralelas: paralelas
    };
  }
}

export const remesasService = new RemesasService();
