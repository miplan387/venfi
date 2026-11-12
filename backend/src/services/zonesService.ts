import { db } from '../database/db';
import { supabase } from '../database/supabase';

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
    if (supabase) {
      console.log('[ZONES] Usando Supabase REST (getAllZones)');
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });
      if (error) {
        console.warn('⚠️ [ZONES] Error en Supabase REST (tabla zones):', error.message);
        console.log('[ZONES] Fallback de memoria activado');
        const store = db.getInMemoryStore();
        return (store.zones || [])
          .filter((z: any) => z.is_active !== false)
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map(this.formatZone);
      }
      return (data || []).map(this.formatZone);
    }

    if (db.isPostgresActive) {
      const res = await db.query(
        'SELECT * FROM zones WHERE is_active = TRUE ORDER BY sort_order ASC, id ASC'
      );
      return res.rows.map(this.formatZone);
    }

    console.log('[ZONES] Fallback de memoria');
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

    if (supabase) {
      console.log(`[PRICING] Usando Supabase REST (getZonePricing: ${normalizedKey})`);
      const { data, error } = await supabase
        .from('zone_pricing')
        .select('*')
        .eq('zone_key', normalizedKey)
        .eq('is_active', true)
        .order('position', { ascending: true });
      if (error) {
        console.warn(`⚠️ [PRICING] Error en Supabase REST para zona ${normalizedKey}:`, error.message);
        console.log('[PRICING] Fallback de memoria activado');
        const store = db.getInMemoryStore();
        const pricings = (store.zone_pricing || [])
          .filter((p: any) => p.zone_key === normalizedKey && p.is_active !== false)
          .sort((a: any, b: any) => a.position - b.position);
        if (pricings.length > 0) {
          return pricings.map(this.formatPricing);
        }
      } else if (data && data.length > 0) {
        return data.map(this.formatPricing);
      }
    } else if (db.isPostgresActive) {
      const res = await db.query(
        'SELECT * FROM zone_pricing WHERE zone_key = $1 AND is_active = TRUE ORDER BY position ASC',
        [normalizedKey]
      );
      if (res.rows.length > 0) {
        return res.rows.map(this.formatPricing);
      }
    } else {
      console.log(`[PRICING] Fallback de memoria (getZonePricing: ${normalizedKey})`);
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
    const info = await this.getPricingForPosition(zoneKey, position);
    return info.price_usd;
  }

  /**
   * Obtiene el precio y duración configurados para una posición dentro de una zona
   */
  public async getPricingForPosition(zoneKey: string, position: number): Promise<{ price_usd: number; duration_hours: number }> {
    const pos = Math.min(Math.max(1, position), 10);
    const pricings = await this.getZonePricing(zoneKey);
    const item = pricings.find(p => p.position === pos);

    if (item) {
      return {
        price_usd: Number(item.price_usd),
        duration_hours: Number(item.duration_hours || 24)
      };
    }

    // Fallback estandarizado si la posición específica no está definida en la zona
    if (pos === 1) return { price_usd: 10.00, duration_hours: 24 };
    if (pos === 2 || pos === 3) return { price_usd: 6.00, duration_hours: 24 };
    return { price_usd: 4.00, duration_hours: 24 };
  }

  /**
   * Obtiene TODOS los registros de zone_pricing (para el Centro de Control Admin)
   */
  public async getAllPricing(): Promise<ZonePricing[]> {
    if (supabase) {
      console.log('[PRICING] Usando Supabase REST (getAllPricing)');
      const { data, error } = await supabase
        .from('zone_pricing')
        .select('*')
        .order('zone_key', { ascending: true })
        .order('position', { ascending: true });
      if (error) {
        console.error('⚠️ [PRICING Error] Supabase REST falló:', error.message);
        console.log('[PRICING] Fallback de memoria activado');
        const store = db.getInMemoryStore();
        return [...(store.zone_pricing || [])]
          .sort((a: any, b: any) => a.zone_key.localeCompare(b.zone_key) || a.position - b.position)
          .map(this.formatPricing);
      }
      if (!data || data.length === 0) {
        console.warn('⚠️ [PRICING] Tabla zone_pricing existe pero está VACÍA en Supabase. Usando fallback de memoria.');
        const store = db.getInMemoryStore();
        return [...(store.zone_pricing || [])]
          .sort((a: any, b: any) => a.zone_key.localeCompare(b.zone_key) || a.position - b.position)
          .map(this.formatPricing);
      }
      return (data || []).map(this.formatPricing);
    }

    if (db.isPostgresActive) {
      const res = await db.query(
        'SELECT * FROM zone_pricing ORDER BY zone_key ASC, position ASC'
      );
      return res.rows.map(this.formatPricing);
    }

    console.log('[PRICING] Fallback de memoria (getAllPricing)');
    const store = db.getInMemoryStore();
    return [...(store.zone_pricing || [])]
      .sort((a: any, b: any) => a.zone_key.localeCompare(b.zone_key) || a.position - b.position)
      .map(this.formatPricing);
  }

  /**
   * Actualiza precio, duración, tier, posición, zona o estado de un puesto específico en zone_pricing
   */
  public async updatePricing(
    id: number | string,
    payload: {
      zone_key?: string;
      position?: number;
      tier?: string;
      price_usd?: number;
      duration_hours?: number;
      is_active?: boolean;
    }
  ): Promise<ZonePricing> {
    const idNum = Number(id);
    if (!idNum || isNaN(idNum)) {
      throw new Error('ID de tarifa inválido');
    }

    console.log('[PRICING] updatePricing recibido:', {
      id: idNum,
      zone_key: payload.zone_key,
      position: payload.position,
      price_usd: payload.price_usd,
      duration_hours: payload.duration_hours,
      is_active: payload.is_active
    });

    const updateData: Record<string, any> = {};
    if (payload.zone_key !== undefined) {
      updateData.zone_key = String(payload.zone_key).toLowerCase().trim();
    }
    if (payload.position !== undefined) {
      const pos = Number(payload.position);
      if (isNaN(pos) || pos < 1 || pos > 10) throw new Error('La posición debe ser un número entre 1 y 10');
      updateData.position = pos;
    }
    if (payload.tier !== undefined) {
      const tierClean = String(payload.tier).toLowerCase().trim();
      updateData.tier = tierClean;
    }
    if (payload.price_usd !== undefined) {
      const price = Number(payload.price_usd);
      if (isNaN(price) || price < 0) throw new Error('El precio debe ser un número válido >= 0');
      updateData.price_usd = price;
    }
    if (payload.duration_hours !== undefined) {
      const duration = Math.round(Number(payload.duration_hours));
      if (isNaN(duration) || duration < 1 || duration > 720) {
        throw new Error('La duración debe estar entre 1 y 720 horas');
      }
      updateData.duration_hours = duration;
    }
    if (payload.is_active !== undefined) {
      updateData.is_active = Boolean(payload.is_active);
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No se proporcionaron campos válidos para actualizar');
    }

    if (supabase) {
      console.log('[PRICING] Actualizando en Supabase REST...');
      let { data, error } = await supabase
        .from('zone_pricing')
        .update(updateData)
        .eq('id', idNum)
        .select()
        .maybeSingle();

      // Si por alguna razón de ID no coincide en Supabase, intentar por zona y posición
      if (!data && payload.zone_key && payload.position) {
        const fallback = await supabase
          .from('zone_pricing')
          .update(updateData)
          .eq('zone_key', String(payload.zone_key).toLowerCase().trim())
          .eq('position', Number(payload.position))
          .select()
          .maybeSingle();
        if (!fallback.error && fallback.data) {
          data = fallback.data;
          error = null;
        }
      }

      if (error) {
        console.error('❌ [Supabase Error updatePricing]:', error.message);
        // Sincronizar en memoria para no romper al administrador
        const store = db.getInMemoryStore();
        let item = (store.zone_pricing || []).find((p: any) => Number(p.id) === idNum);
        if (item) Object.assign(item, updateData);
        throw new Error(`Error en Supabase: ${error.message}. Verifica que la tabla public.zone_pricing exista.`);
      }
      if (!data) {
        // Si no está en Supabase, actualizar en memoria
        const store = db.getInMemoryStore();
        let item = (store.zone_pricing || []).find((p: any) => Number(p.id) === idNum);
        if (!item && payload.zone_key && payload.position) {
          item = (store.zone_pricing || []).find(
            (p: any) => p.zone_key === String(payload.zone_key).toLowerCase().trim() && Number(p.position) === Number(payload.position)
          );
        }
        if (item) {
          Object.assign(item, updateData);
          return this.formatPricing(item);
        }
        throw new Error(`Tarifa con ID ${id} no encontrada en la base de datos de Supabase`);
      }
      return this.formatPricing(data);
    }

    if (db.isPostgresActive) {
      const setClauses: string[] = [];
      const values: any[] = [];
      let idx = 1;
      for (const [k, v] of Object.entries(updateData)) {
        setClauses.push(`${k} = $${idx}`);
        values.push(v);
        idx++;
      }
      values.push(idNum);
      const res = await db.query(
        `UPDATE zone_pricing SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
        values
      );
      if (res.rows.length === 0) {
        // Fallback si el ID no coincide exactamente pero tenemos zona y posición
        if (payload.zone_key && payload.position) {
          const fbClauses = Object.keys(updateData).map((k, i) => `${k} = $${i + 1}`);
          const fbValues = [...Object.values(updateData), String(payload.zone_key).toLowerCase().trim(), Number(payload.position)];
          const fbRes = await db.query(
            `UPDATE zone_pricing SET ${fbClauses.join(', ')} WHERE zone_key = $${fbValues.length - 1} AND position = $${fbValues.length} RETURNING *`,
            fbValues
          );
          if (fbRes.rows.length > 0) return this.formatPricing(fbRes.rows[0]);
        }
        throw new Error(`Tarifa con ID ${id} no encontrada`);
      }
      return this.formatPricing(res.rows[0]);
    }

    console.log('[PRICING] Actualizando en memoria temporal (updatePricing)');
    const store = db.getInMemoryStore();
    let item = (store.zone_pricing || []).find((p: any) => Number(p.id) === idNum);
    if (!item && payload.zone_key && payload.position) {
      item = (store.zone_pricing || []).find(
        (p: any) => p.zone_key === String(payload.zone_key).toLowerCase().trim() && Number(p.position) === Number(payload.position)
      );
    }
    if (!item) throw new Error(`Tarifa con ID ${id} no encontrada`);
    Object.assign(item, updateData);
    return this.formatPricing(item);
  }

  /**
   * Crea una nueva tarifa en zone_pricing
   */
  public async createPricing(payload: {
    zone_key: string;
    position: number;
    tier?: string;
    price_usd: number;
    duration_hours?: number;
    is_active?: boolean;
  }): Promise<ZonePricing> {
    if (!payload.zone_key) throw new Error('La zona es obligatoria');
    const zoneKey = String(payload.zone_key).toLowerCase().trim();
    const position = Number(payload.position);
    if (isNaN(position) || position < 1 || position > 10) {
      throw new Error('La posición debe ser un número entre 1 y 10');
    }
    const priceUsd = Number(payload.price_usd);
    if (isNaN(priceUsd) || priceUsd < 0) {
      throw new Error('El precio debe ser un número válido >= 0');
    }
    const durationHours = Math.round(Number(payload.duration_hours || 24));
    if (durationHours < 1 || durationHours > 720) {
      throw new Error('La duración debe estar entre 1 y 720 horas');
    }
    const tier = payload.tier
      ? String(payload.tier).toLowerCase().trim()
      : position === 1 ? 'gold' : position <= 3 ? 'silver' : 'dark';
    const isActive = payload.is_active !== undefined ? Boolean(payload.is_active) : true;

    console.log('[PRICING] createPricing recibido:', {
      zone_key: zoneKey,
      position,
      tier,
      price_usd: priceUsd,
      duration_hours: durationHours,
      is_active: isActive
    });

    if (supabase) {
      console.log('[PRICING] Guardando en Supabase REST (createPricing)...');
      // 1. Verificar si ya existe para esta zona y posición
      const { data: existing, error: selectErr } = await supabase
        .from('zone_pricing')
        .select('id')
        .eq('zone_key', zoneKey)
        .eq('position', position)
        .maybeSingle();

      if (selectErr) {
        console.error('❌ [Supabase Error select existing in createPricing]:', selectErr.message);
        // Guardar en memoria para que la sesión de admin funcione
        const store = db.getInMemoryStore();
        if (!store.zone_pricing) store.zone_pricing = [];
        const existingIdx = store.zone_pricing.findIndex(
          (p: any) => p.zone_key === zoneKey && Number(p.position) === position
        );
        const memItem = {
          id: existingIdx >= 0 ? store.zone_pricing[existingIdx].id : Date.now(),
          zone_key: zoneKey,
          position,
          tier,
          price_usd: priceUsd,
          duration_hours: durationHours,
          is_active: isActive
        };
        if (existingIdx >= 0) store.zone_pricing[existingIdx] = memItem;
        else store.zone_pricing.push(memItem);

        throw new Error(`Error en Supabase: ${selectErr.message}. Verifica que la tabla public.zone_pricing exista.`);
      }

      if (existing && existing.id) {
        const { data: updated, error: updateError } = await supabase
          .from('zone_pricing')
          .update({
            tier,
            price_usd: priceUsd,
            duration_hours: durationHours,
            is_active: isActive
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (updateError) {
          console.error('❌ [Supabase Error update existing in createPricing]:', updateError.message);
          throw new Error(`Error en Supabase: ${updateError.message}`);
        }
        return this.formatPricing(updated);
      }

      // 2. Si no existe, insertar
      const { data, error } = await supabase
        .from('zone_pricing')
        .insert([{
          zone_key: zoneKey,
          position,
          tier,
          price_usd: priceUsd,
          duration_hours: durationHours,
          is_active: isActive
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [Supabase Error createPricing]:', error.message);
        throw new Error(`Error en Supabase: ${error.message}`);
      }
      return this.formatPricing(data);
    }

    if (db.isPostgresActive) {
      const res = await db.query(
        `INSERT INTO zone_pricing (zone_key, position, tier, price_usd, duration_hours, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (zone_key, position)
         DO UPDATE SET
           tier = EXCLUDED.tier,
           price_usd = EXCLUDED.price_usd,
           duration_hours = EXCLUDED.duration_hours,
           is_active = EXCLUDED.is_active
         RETURNING *`,
        [zoneKey, position, tier, priceUsd, durationHours, isActive]
      );
      return this.formatPricing(res.rows[0]);
    }

    const store = db.getInMemoryStore();
    if (!store.zone_pricing) store.zone_pricing = [];
    const existingIndex = store.zone_pricing.findIndex(
      (p: any) => p.zone_key === zoneKey && Number(p.position) === position
    );
    if (existingIndex >= 0) {
      store.zone_pricing[existingIndex] = {
        ...store.zone_pricing[existingIndex],
        tier,
        price_usd: priceUsd,
        duration_hours: durationHours,
        is_active: isActive
      };
      return this.formatPricing(store.zone_pricing[existingIndex]);
    }
    const newId = store.zone_pricing.length > 0
      ? Math.max(...store.zone_pricing.map((p: any) => Number(p.id) || 0)) + 1
      : 1;
    const newItem = {
      id: newId,
      zone_key: zoneKey,
      position,
      tier,
      price_usd: priceUsd,
      duration_hours: durationHours,
      is_active: isActive
    };
    store.zone_pricing.push(newItem);
    return this.formatPricing(newItem);
  }

  /**
   * Elimina una tarifa de zone_pricing validando que no tenga una pauta activa protegida
   */
  public async deletePricing(id: number | string): Promise<{ id: number; message: string }> {
    const idNum = Number(id);
    if (!idNum || isNaN(idNum)) {
      throw new Error('ID de tarifa inválido');
    }

    // 1. Obtener la tarifa a eliminar para saber su zona y puesto
    let pricingItem: ZonePricing | null = null;
    if (supabase) {
      const { data } = await supabase
        .from('zone_pricing')
        .select('*')
        .eq('id', idNum)
        .maybeSingle();
      if (data) pricingItem = this.formatPricing(data);
    } else if (db.isPostgresActive) {
      const res = await db.query('SELECT * FROM zone_pricing WHERE id = $1', [idNum]);
      if (res.rows.length > 0) pricingItem = this.formatPricing(res.rows[0]);
    } else {
      const store = db.getInMemoryStore();
      const found = (store.zone_pricing || []).find((p: any) => Number(p.id) === idNum);
      if (found) pricingItem = this.formatPricing(found);
    }

    if (!pricingItem) {
      throw new Error(`Tarifa con ID ${id} no encontrada`);
    }

    // 2. Comprobar si existe un anuncio activo real en ese puesto
    if (supabase) {
      const { data: activeAd } = await supabase
        .from('ranking')
        .select('id, business_name, is_active, payment_id')
        .eq('zone_key', pricingItem.zone_key)
        .eq('position', pricingItem.position)
        .eq('is_active', true)
        .not('payment_id', 'is', null)
        .maybeSingle();

      if (activeAd) {
        throw new Error(
          `No se puede eliminar la tarifa del puesto #${pricingItem.position} (${pricingItem.zone_key.toUpperCase()}) porque tiene un anuncio activo pagado: "${activeAd.business_name}". Desactiva o reasigna la pauta primero.`
        );
      }

      const { error } = await supabase
        .from('zone_pricing')
        .delete()
        .eq('id', idNum);
      if (error) throw new Error(error.message);

      return { id: idNum, message: `Tarifa #${pricingItem.position} (${pricingItem.zone_key}) eliminada exitosamente.` };
    }

    if (db.isPostgresActive) {
      const activeAdRes = await db.query(
        `SELECT id, business_name FROM ranking 
         WHERE zone_key = $1 AND position = $2 AND is_active = TRUE AND payment_id IS NOT NULL`,
        [pricingItem.zone_key, pricingItem.position]
      );
      if (activeAdRes.rows.length > 0) {
        throw new Error(
          `No se puede eliminar la tarifa del puesto #${pricingItem.position} (${pricingItem.zone_key.toUpperCase()}) porque tiene un anuncio activo pagado: "${activeAdRes.rows[0].business_name}".`
        );
      }

      await db.query('DELETE FROM zone_pricing WHERE id = $1', [idNum]);
      return { id: idNum, message: `Tarifa #${pricingItem.position} (${pricingItem.zone_key}) eliminada exitosamente.` };
    }

    const store = db.getInMemoryStore();
    const idx = (store.zone_pricing || []).findIndex((p: any) => Number(p.id) === idNum);
    if (idx !== -1) {
      store.zone_pricing.splice(idx, 1);
    }
    return { id: idNum, message: `Tarifa #${pricingItem.position} (${pricingItem.zone_key}) eliminada exitosamente.` };
  }

  /**
   * Semilla inicial automática en Supabase REST si la tabla existe pero no tiene datos
   */
  public async seedZonePricingIfNeeded(): Promise<void> {
    const defaultPricings = [
      { zone_key: 'nacional', position: 1, tier: 'top1', price_usd: 10.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 2, tier: 'top2', price_usd: 6.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 3, tier: 'top3', price_usd: 6.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 4, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 5, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 6, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 7, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 8, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 9, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'nacional', position: 10, tier: 'top4_10', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'caracas', position: 1, tier: 'top1', price_usd: 10.00, duration_hours: 24, is_active: true },
      { zone_key: 'caracas', position: 2, tier: 'top2', price_usd: 6.00, duration_hours: 24, is_active: true },
      { zone_key: 'caracas', position: 3, tier: 'top3', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'maracaibo', position: 1, tier: 'top1', price_usd: 10.00, duration_hours: 24, is_active: true },
      { zone_key: 'maracaibo', position: 2, tier: 'top2', price_usd: 6.00, duration_hours: 24, is_active: true },
      { zone_key: 'maracaibo', position: 3, tier: 'top3', price_usd: 4.00, duration_hours: 24, is_active: true },
      { zone_key: 'valencia', position: 1, tier: 'top1', price_usd: 10.00, duration_hours: 24, is_active: true },
      { zone_key: 'valencia', position: 2, tier: 'top2', price_usd: 6.00, duration_hours: 24, is_active: true },
      { zone_key: 'valencia', position: 3, tier: 'top3', price_usd: 4.00, duration_hours: 24, is_active: true }
    ];

    if (supabase) {
      try {
        const { count, error } = await supabase
          .from('zone_pricing')
          .select('id', { count: 'exact', head: true });

        if (error) {
          if (error.message.includes('schema cache')) {
            console.error('🚨 [PRICING SEED] La tabla public.zone_pricing NO EXISTE en Supabase. Debe ejecutarse crear_tablas_faltantes_supabase.sql en el SQL Editor de Supabase.');
          } else {
            console.warn('[PRICING SEED] Error al verificar registros en Supabase:', error.message);
          }
          return;
        }

        if (count === 0) {
          console.log('🌱 [PRICING SEED] Tabla zone_pricing existe pero está VACÍA en Supabase. Insertando 19 tarifas iniciales...');
          const { error: insertErr } = await supabase
            .from('zone_pricing')
            .insert(defaultPricings);
          if (insertErr) {
            console.error('❌ [PRICING SEED] Error al insertar seed en Supabase:', insertErr.message);
          } else {
            console.log('✅ [PRICING SEED] 19 tarifas iniciales insertadas con éxito en Supabase zone_pricing.');
          }
        } else {
          console.log(`ℹ️ [PRICING SEED] Tabla zone_pricing ya contiene ${count} tarifas en Supabase.`);
        }
      } catch (e: any) {
        console.error('[PRICING SEED Exception]:', e.message);
      }
    }
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
export const getAllPricing = () => zonesService.getAllPricing();
export const updatePricing = (id: number | string, payload: any) => zonesService.updatePricing(id, payload);
export const createPricing = (payload: any) => zonesService.createPricing(payload);
export const deletePricing = (id: number | string) => zonesService.deletePricing(id);

