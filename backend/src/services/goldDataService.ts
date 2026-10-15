import axios from 'axios';
import { env } from '../config/env';

// Constantes oficiales de conversión métrica
export const GRAMS_PER_TROY_OUNCE = 31.1035; // 1 onza troy = 31.1035 gramos
export const GRAMS_PER_KILOGRAM = 1000;      // 1 kilogramo = 1000 gramos

// Cache en memoria (6 horas)
let cache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

/**
 * Obtiene el precio del oro (XAU/USD) desde la API de Omkar Cloud
 * Endpoint: https://gold-price-api.omkar.cloud/price
 */
export const fetchGoldPrice = async () => {
  const apiKey = env.GOLD_API_KEY;

  // Si no hay API key o es el placeholder por defecto, usar fallback directo
  if (!apiKey || apiKey === 'tu_clave_aqui' || apiKey.startsWith('tu_')) {
    return {
      price: 2650.00,
      updated_at: new Date().toISOString(),
      currency: 'USD',
      unit: 'onza troy',
      fallback: true,
    };
  }

  try {
    const response = await axios.get('https://gold-price-api.omkar.cloud/price', {
      headers: { 'API-Key': apiKey },
      timeout: 10000,
    });

    const { price_usd, updated_at } = response.data;

    return {
      price: typeof price_usd === 'number' ? price_usd : parseFloat(price_usd || '2650.00'),
      updated_at: updated_at || new Date().toISOString(),
      currency: 'USD',
      unit: 'onza troy',
      fallback: false,
    };
  } catch (error) {
    console.error('Error fetching gold price from Omkar Cloud:', error);
    // Fallback: valor estático calibrado
    return {
      price: 2650.00,
      updated_at: new Date().toISOString(),
      currency: 'USD',
      unit: 'onza troy',
      fallback: true,
    };
  }
};

/**
 * Obtiene los datos consolidados del oro en 3 unidades:
 * 1. Onza troy (estándar internacional)
 * 2. Gramo (joyería y comercio local)
 * 3. Kilogramo (lingotes y transacciones de mayor volumen)
 */
export const getGoldMarketData = async (forceRefresh: boolean = false) => {
  // Verificar caché si no se solicita refresco forzado
  if (!forceRefresh && cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  const goldData = await fetchGoldPrice();
  const rawPrice = goldData.price || 2650.00;

  // Cálculos de conversión oficiales
  const troyOuncePrice = Number(rawPrice.toFixed(2));
  const gramPrice = Number((rawPrice / GRAMS_PER_TROY_OUNCE).toFixed(2));
  const kilogramPrice = Number(((rawPrice / GRAMS_PER_TROY_OUNCE) * GRAMS_PER_KILOGRAM).toFixed(2));

  const troyOunceUnit = {
    name: 'Onza Troy',
    code: 'XAU/USD',
    symbol: 'oz t',
    icon: '🪙',
    price: troyOuncePrice,
    currency: 'USD',
    unit: 'onza troy',
    description: 'Estándar internacional de los mercados financieros (CME / LBMA)'
  };

  const gramUnit = {
    name: 'Gramo',
    code: 'XAU/G',
    symbol: 'g',
    icon: '💍',
    price: gramPrice,
    currency: 'USD',
    unit: 'gramo',
    description: 'Común en joyería, orfebrería y comercio local'
  };

  const kilogramUnit = {
    name: 'Kilogramo',
    code: 'XAU/KG',
    symbol: 'kg',
    icon: '🧱',
    price: kilogramPrice,
    currency: 'USD',
    unit: 'kilogramo',
    description: 'Lingotes de inversión y transacciones mayoristas'
  };

  const data = {
    gold: {
      price: troyOuncePrice, // Compatibilidad con clientes anteriores
      currency: goldData.currency,
      unit: goldData.unit,
      updated_at: goldData.updated_at,
      troy_ounce: troyOunceUnit,
      gram: gramUnit,
      kilogram: kilogramUnit,
      units: {
        troy_ounce: troyOunceUnit,
        gram: gramUnit,
        kilogram: kilogramUnit
      }
    },
    conversion_factors: {
      grams_per_troy_ounce: GRAMS_PER_TROY_OUNCE,
      grams_per_kilogram: GRAMS_PER_KILOGRAM,
      formula: '1 onza troy = 31.1035 g | 1 kg = 1,000 g'
    },
    last_updated: new Date().toISOString(),
    data_source: 'Omkar Cloud (CME Gold Futures)',
    data_delay_warning: 'Precio referencial del oro (XAU/USD). Datos con posible retraso de minutos.',
    is_fallback: goldData.fallback || false,
  };

  // Actualizar caché
  cache = { data, timestamp: Date.now() };

  return data;
};
