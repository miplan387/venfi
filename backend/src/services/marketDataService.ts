import axios from 'axios';
import { config } from '../config/env';

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
      source: `Estimación Venfi (Brent - Descuento OPEP $${discount.toFixed(2)})`
    };

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
}

export const marketDataService = new MarketDataService();
