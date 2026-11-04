import axios from 'axios';
import { config } from '../config/env';
import { db } from '../database/db';

export interface OilPriceItem {
  name: string;
  code: string;
  price: number;
  previousPrice: number;
  change: string;
  changeAmount: number;
  changePercentage: string;
  direction: 'up' | 'down' | 'same';
  isPositive: boolean;
  unit: string;
  date: string;
  source: string;
  formula?: string;
  discount?: number;
}

export interface OilMarketResponse {
  brent: OilPriceItem;
  merey: OilPriceItem;
  meta: {
    mereyDiscount: number;
    dataDelayNotice: string;
    lastUpdated: string;
    dataSource: 'eia_api' | 'fallback';
    ttlHours: number;
  };
}

export class MarketDataService {
  private cache: OilMarketResponse | null = null;
  private lastFetched: number = 0;
  private readonly CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas (Polling según actualización diaria de la EIA)
  private pollingInterval: NodeJS.Timeout | null = null;

  // Valores de respaldo realistas en caso de API no configurada o error de red
  private readonly STATIC_FALLBACK = {
    brentPrice: 74.35,
    brentPrevPrice: 73.70,
    date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] // 2 días de retraso estándar
  };

  constructor() {
    // Iniciar polling automático en segundo plano cada 6 horas
    this.initBackgroundPolling();
  }

  /**
   * Inicializa el polling cada 6 horas
   */
  private initBackgroundPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    this.pollingInterval = setInterval(async () => {
      try {
        console.log('[MarketDataService] Ejecutando polling automático de petróleo (EIA)...');
        await this.fetchFromEia(true);
      } catch (err) {
        console.warn('[MarketDataService] Error en polling programado:', err);
      }
    }, this.CACHE_TTL_MS);
  }

  /**
   * Obtiene los precios consolidados del petróleo Brent y Merey 16
   */
  public async getOilPrices(forceRefresh: boolean = false): Promise<OilMarketResponse> {
    const now = Date.now();

    if (!forceRefresh && this.cache && (now - this.lastFetched < this.CACHE_TTL_MS)) {
      return this.cache;
    }

    try {
      const liveData = await this.fetchFromEia(forceRefresh);
      if (liveData) {
        this.cache = liveData;
        this.lastFetched = now;
        return liveData;
      }
    } catch (error) {
      console.warn('[MarketDataService] Advertencia al consultar API EIA, activando datos de respaldo:', error);
    }

    // Retornar fallback o cache previo
    if (this.cache) {
      return this.cache;
    }

    const fallbackData = this.generateFallbackResponse();
    this.cache = fallbackData;
    this.lastFetched = now;
    return fallbackData;
  }

  /**
   * Consulta la API v2 oficial de la EIA para el precio Spot de Brent
   */
  private async fetchFromEia(forceRefresh: boolean = false): Promise<OilMarketResponse | null> {
    const apiKey = config.market.eiaApiKey;

    // Si no hay API key o es la clave de ejemplo por defecto, usar fallback
    if (!apiKey || apiKey === 'tu_clave_gratuita_aqui' || apiKey.startsWith('tu_')) {
      return null;
    }

    // Endpoint EIA v2 - Petroleum Spot Price (Europe Brent, Daily)
    // Series RBRTE = Europe Brent Spot Price FOB (Dollars per Barrel)
    const url = `https://api.eia.gov/v2/petroleum/pri/spt/data/?api_key=${apiKey}&frequency=daily&data[0]=value&facets[series][]=RBRTE&sort[0][column]=period&sort[0][direction]=desc&length=5`;

    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const dataRows = response.data?.response?.data;
    if (!Array.isArray(dataRows) || dataRows.length === 0) {
      return null;
    }

    // Obtener última cotización disponible y cotización anterior para calcular variación
    const latestRow = dataRows[0];
    const prevRow = dataRows.length > 1 ? dataRows[1] : null;

    const brentPrice = parseFloat(latestRow.value);
    const brentPrevPrice = prevRow ? parseFloat(prevRow.value) : brentPrice;
    const date = latestRow.period || new Date().toISOString().split('T')[0];

    return this.buildConsolidatedResponse(brentPrice, brentPrevPrice, date, 'eia_api');
  }

  /**
   * Construye el JSON consolidado con el cálculo del crudo Merey 16 (Brent - Descuento)
   */
  private buildConsolidatedResponse(
    brentPrice: number, 
    brentPrevPrice: number, 
    date: string, 
    dataSource: 'eia_api' | 'fallback'
  ): OilMarketResponse {
    const discount = config.market.mereyDiscount;

    // Cálculo Brent
    const brentDiff = Number((brentPrice - brentPrevPrice).toFixed(2));
    const brentPct = brentPrevPrice > 0 ? Number(((brentDiff / brentPrevPrice) * 100).toFixed(2)) : 0;
    const brentDirection: 'up' | 'down' | 'same' = brentDiff > 0 ? 'up' : (brentDiff < 0 ? 'down' : 'same');

    const brentItem: OilPriceItem = {
      name: 'Petróleo Brent (Referencia)',
      code: 'BRENT',
      price: Number(brentPrice.toFixed(2)),
      previousPrice: Number(brentPrevPrice.toFixed(2)),
      change: brentDiff > 0 ? `+${brentDiff.toFixed(2)}` : `${brentDiff.toFixed(2)}`,
      changeAmount: brentDiff,
      changePercentage: brentPct > 0 ? `+${brentPct.toFixed(2)}%` : `${brentPct.toFixed(2)}%`,
      direction: brentDirection,
      isPositive: brentDiff >= 0,
      unit: 'USD/barril',
      date: date,
      source: 'U.S. Energy Information Administration (EIA)'
    };

    // Cálculo Merey 16: Brent - Descuento configurable (ej: $14.00)
    const mereyPrice = Math.max(0, Number((brentPrice - discount).toFixed(2)));
    const mereyPrevPrice = Math.max(0, Number((brentPrevPrice - discount).toFixed(2)));
    const mereyDiff = Number((mereyPrice - mereyPrevPrice).toFixed(2));
    const mereyPct = mereyPrevPrice > 0 ? Number(((mereyDiff / mereyPrevPrice) * 100).toFixed(2)) : 0;
    const mereyDirection: 'up' | 'down' | 'same' = mereyDiff > 0 ? 'up' : (mereyDiff < 0 ? 'down' : 'same');

    const mereyItem: OilPriceItem = {
      name: 'Crudo Merey 16 (Venezuela)',
      code: 'MEREY16',
      price: mereyPrice,
      previousPrice: mereyPrevPrice,
      discount: discount,
      formula: `Brent - Descuento ($${discount.toFixed(2)})`,
      change: mereyDiff > 0 ? `+${mereyDiff.toFixed(2)}` : `${mereyDiff.toFixed(2)}`,
      changeAmount: mereyDiff,
      changePercentage: mereyPct > 0 ? `+${mereyPct.toFixed(2)}%` : `${mereyPct.toFixed(2)}%`,
      direction: mereyDirection,
      isPositive: mereyDiff >= 0,
      unit: 'USD/barril',
      date: date,
      source: `Estimación Venfidata (Brent - Descuento OPEP $${discount.toFixed(2)})`
    };

    // Registrar precios diarios en commodity_history en segundo plano (1 por día)
    this.recordCommodityPrice('oil_brent', brentItem.price, date).catch(() => {});
    this.recordCommodityPrice('oil_merey', mereyItem.price, date).catch(() => {});

    return {
      brent: brentItem,
      merey: mereyItem,
      meta: {
        mereyDiscount: discount,
        dataDelayNotice: 'Los precios del crudo spot reportados por la EIA se publican con un retraso habitual de 1 a 2 días hábiles respecto al mercado en vivo.',
        lastUpdated: new Date().toISOString(),
        dataSource,
        ttlHours: 6
      }
    };
  }

  /**
   * Genera respuesta de respaldo si no hay API externa configurada
   */
  private generateFallbackResponse(): OilMarketResponse {
    return this.buildConsolidatedResponse(
      this.STATIC_FALLBACK.brentPrice,
      this.STATIC_FALLBACK.brentPrevPrice,
      this.STATIC_FALLBACK.date,
      'fallback'
    );
  }

  /**
   * Guarda o actualiza el precio diario en la tabla commodity_history (límite de 1 por día)
   */
  public async recordCommodityPrice(
    commodityType: 'gold' | 'oil_brent' | 'oil_merey', 
    price: number,
    dateStr?: string
  ): Promise<void> {
    if (!price || isNaN(price) || price <= 0) return;
    const roundedPrice = Number(price.toFixed(2));
    const targetDate = dateStr || new Date().toISOString().split('T')[0];

    try {
      if (db.isPostgresActive) {
        await db.query(
          `INSERT INTO commodity_history (commodity_type, price_usd, recorded_at)
           VALUES ($1, $2, $3)
           ON CONFLICT (commodity_type, recorded_at)
           DO UPDATE SET price_usd = EXCLUDED.price_usd, created_at = CURRENT_TIMESTAMP`,
          [commodityType, roundedPrice, targetDate]
        );
      } else {
        const store = db.getInMemoryStore();
        if (!store.commodity_history) store.commodity_history = [];
        const existingIdx = store.commodity_history.findIndex(
          (c: any) => c.commodity_type === commodityType && c.recorded_at === targetDate
        );
        if (existingIdx >= 0) {
          store.commodity_history[existingIdx].price_usd = roundedPrice;
          store.commodity_history[existingIdx].created_at = new Date().toISOString();
        } else {
          store.commodity_history.push({
            id: store.commodity_history.length + 1,
            commodity_type: commodityType,
            price_usd: roundedPrice,
            recorded_at: targetDate,
            created_at: new Date().toISOString()
          });
        }
      }
    } catch (err: any) {
      console.warn(`[MarketDataService] Error al registrar historial para ${commodityType}:`, err.message);
    }
  }

  /**
   * Normaliza el tipo de commodity
   */
  public normalizeCommodityType(type: string): 'gold' | 'oil_brent' | 'oil_merey' | null {
    const t = (type || '').toLowerCase().trim();
    if (['gold', 'oro', 'xau', 'xau_usd'].includes(t)) return 'gold';
    if (['oil_brent', 'brent', 'crude_brent', 'petroleo_brent'].includes(t)) return 'oil_brent';
    if (['oil_merey', 'merey', 'merey16', 'merey_16', 'crudo_merey', 'petroleo_merey'].includes(t)) return 'oil_merey';
    return null;
  }

  /**
   * Obtiene el historial de cotizaciones de los últimos N días
   */
  public async getCommodityHistory(rawType: string, daysParam: number = 7) {
    const commodityType = this.normalizeCommodityType(rawType);
    if (!commodityType) {
      throw new Error(`Tipo de commodity no válido: '${rawType}'. Opciones válidas: 'gold', 'oil_brent', 'oil_merey'.`);
    }

    const days = Math.min(Math.max(Number(daysParam) || 7, 2), 90);
    let rows: { recorded_at: string; price_usd: number }[] = [];

    try {
      if (db.isPostgresActive) {
        const res = await db.query(
          `SELECT recorded_at::text as recorded_at, price_usd 
           FROM commodity_history 
           WHERE commodity_type = $1 
           ORDER BY recorded_at DESC 
           LIMIT $2`,
          [commodityType, days]
        );
        rows = res.rows.map((r: any) => ({
          recorded_at: typeof r.recorded_at === 'string' ? r.recorded_at.split('T')[0] : new Date(r.recorded_at).toISOString().split('T')[0],
          price_usd: Number(r.price_usd)
        }));
      } else {
        const store = db.getInMemoryStore();
        const records = (store.commodity_history || [])
          .filter((c: any) => c.commodity_type === commodityType)
          .sort((a: any, b: any) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
          .slice(0, days);

        rows = records.map((r: any) => ({
          recorded_at: r.recorded_at,
          price_usd: Number(r.price_usd)
        }));
      }
    } catch (err: any) {
      console.warn(`[MarketDataService] Error al consultar commodity_history (${commodityType}):`, err.message);
    }

    // Si hay menos de 2 registros en la base de datos, generar datos de respaldo realistas para la ventana solicitada
    if (rows.length < 2) {
      rows = this.generateFallbackHistory(commodityType, days);
    }

    // Invertir para orden cronológico (de más antiguo a más reciente) para graficar
    const sortedChronological = [...rows].reverse();

    const oldest = sortedChronological[0].price_usd;
    const latest = sortedChronological[sortedChronological.length - 1].price_usd;
    const changeAmount = Number((latest - oldest).toFixed(2));
    const changePercentage = oldest > 0 ? Number(((changeAmount / oldest) * 100).toFixed(2)) : 0;
    const direction: 'up' | 'down' | 'same' = changeAmount > 0 ? 'up' : (changeAmount < 0 ? 'down' : 'same');

    return {
      commodity_type: commodityType,
      days,
      currentPrice: latest,
      previousPrice: oldest,
      changeAmount,
      changePercentage,
      direction,
      history: sortedChronological.map(item => ({
        date: item.recorded_at,
        price: item.price_usd
      }))
    };
  }

  /**
   * Genera datos de respaldo simulados y calibrados si la BD no cuenta con suficientes días
   */
  private generateFallbackHistory(commodityType: 'gold' | 'oil_brent' | 'oil_merey', days: number) {
    const list = [];
    const basePrices: Record<string, number> = {
      gold: 2650.00,
      oil_brent: 74.35,
      oil_merey: 60.35
    };
    const base = basePrices[commodityType] || 100;

    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (i * 86400000));
      const dateStr = d.toISOString().split('T')[0];
      const noise = commodityType === 'gold' 
        ? Math.sin(i * 0.7) * 9.5 - (i * 0.4) 
        : Math.cos(i * 0.8) * 1.2 - (i * 0.05);
      const price = Number((base + noise).toFixed(2));
      list.push({ recorded_at: dateStr, price_usd: price });
    }
    return list;
  }
}

export const marketDataService = new MarketDataService();
