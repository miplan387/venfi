import { db } from '../database/db';

export interface Zone {
  id: number;
  key: string;
  name: string;
  type: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ZonePricing {
  id: number;
  zone_key: string;
  position: number;
  tier: string;
  price_usd: number;
  duration_hours: number;
  is_active: boolean;
}

export class ZonesService {
  /**
   * Obtiene todas las zonas geográficas activas ordenadas
   */
  public async getAllZones(): Promise<Zone[]> {
    if (db.isPostgresActive) {
      const res = await db.query(
        'SELECT * FROM zones WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC'
      );
      return res.rows.map(this.formatZone);
    }

    const store = db.getInMemoryStore();
    return (store.zones || [])
      .filter((z: any) => z.is_active !== false)
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map(this.formatZone);
  }

  /**
   * Obtiene la estructura de precios para una zona específica
   */
  public async getZonePricing(zoneKey: string): Promise<ZonePricing[]> {
    const normalizedKey = (zoneKey || 'nacional').toLowerCase().trim();

    if (db.isPostgresActive) {
      const res = await db.query(
        'SELECT * FROM zone_pricing WHERE zone_key = $1 AND is_active = TRUE ORDER BY position ASC',
        [normalizedKey]
      );
      if (res.rows.length > 0) {
        return res.rows.map(this.formatPricing);
      }
    } else {
      const store = db.getInMemoryStore();
      const pricings = (store.zone_pricing || [])
        .filter((p: any) => p.zone_key === normalizedKey && p.is_active !== false)
        .sort((a: any, b: any) => a.position - b.position);
      if (pricings.length > 0) {
        return pricings.map(this.formatPricing);
      }
    }

    // Fallback a zona nacional si no existe configuración específica
    if (normalizedKey !== 'nacional') {
      return this.getZonePricing('nacional');
    }

    return [];
  }

  /**
   * Obtiene el precio en USD para una posición dentro de una zona
   */
  public async getPriceForPosition(zoneKey: string, position: number): Promise<number> {
    const pos = Math.min(Math.max(1, position), 10);
    const pricings = await this.getZonePricing(zoneKey);
    const item = pricings.find(p => p.position === pos);

    if (item) {
      return Number(item.price_usd);
    }

    // Fallback estandarizado si la posición específica no está definida en la zona
    if (pos === 1) return 10.00;
    if (pos === 2 || pos === 3) return 6.00;
    return 4.00;
  }

  private formatZone(row: any): Zone {
    return {
      id: Number(row.id),
      key: row.key,
      name: row.name,
      type: row.type,
      icon: row.icon || '📍',
      is_active: Boolean(row.is_active),
      sort_order: Number(row.sort_order || 0),
      created_at: row.created_at
    };
  }

  private formatPricing(row: any): ZonePricing {
    return {
      id: Number(row.id),
      zone_key: row.zone_key,
      position: Number(row.position),
      tier: row.tier,
      price_usd: Number(row.price_usd),
      duration_hours: Number(row.duration_hours || 24),
      is_active: Boolean(row.is_active)
    };
  }
}

export const zonesService = new ZonesService();
export const getAllZones = () => zonesService.getAllZones();
export const getZonePricing = (zoneKey: string) => zonesService.getZonePricing(zoneKey);
export const getPriceForPosition = (zoneKey: string, position: number) => zonesService.getPriceForPosition(zoneKey, position);

