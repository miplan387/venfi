import { db } from '../database/db';
import { supabase } from '../database/supabase';

export class RankingService {
  private mapPricingToEmptySlots(normalizedZone: string, pricingRows: any[]) {
    return pricingRows.map((p: any) => ({
      id: `slot_${normalizedZone}_${p.position}`,
      position: Number(p.position),
      user_id: null,
      payment_id: null,
      business_name: 'Espacio Publicitario Disponible ✨',
      target_url: 'https://venfidata.com/#ranking',
      slogan: `¡Sé el primero en posicionar tu marca en ${normalizedZone.toUpperCase()}! Posición #${p.position} disponible por $${Number(p.price_usd).toFixed(2)}.`,
      category: 'Publicidad Local',
      avatar: '🚀',
      tier: p.tier,
      price_usd: Number(p.price_usd),
      duration_hours: Number(p.duration_hours || 24),
      amount_paid: 0.00,
      start_time: new Date().toISOString(),
      end_time: null,
      clicks_received: 0,
      views_received: 0,
      is_active: true,
      zone_key: normalizedZone
    }));
  }

  /**
   * Enriquecer cada slot con la tarifa y duración vigente desde zone_pricing
   */
  private async enrichSlotsWithPricing(normalizedZone: string, rows: any[]): Promise<any[]> {
    try {
      let pricingRows: any[] = [];
      if (supabase) {
        const { data, error } = await supabase
          .from('zone_pricing')
          .select('position, tier, price_usd, duration_hours')
          .eq('zone_key', normalizedZone)
          .eq('is_active', true);
        if (!error && data && data.length > 0) {
          pricingRows = data;
        } else {
          // Fallback a memoria si la tabla está vacía o no existe aún
          const store = db.getInMemoryStore();
          pricingRows = (store.zone_pricing || []).filter((p: any) => p.zone_key === normalizedZone && p.is_active !== false);
        }
      } else if (db.isPostgresActive) {
        const res = await db.query(
          'SELECT position, tier, price_usd, duration_hours FROM zone_pricing WHERE zone_key = $1 AND is_active = TRUE',
          [normalizedZone]
        );
        if (res.rows.length > 0) pricingRows = res.rows;
      } else {
        const store = db.getInMemoryStore();
        pricingRows = (store.zone_pricing || []).filter((p: any) => p.zone_key === normalizedZone && p.is_active !== false);
      }

      return rows.map((r: any) => {
        const p = pricingRows.find((pz: any) => Number(pz.position) === Number(r.position));
        const defaultPrice = Number(r.position) === 1 ? 10.00 : Number(r.position) <= 3 ? 6.00 : 4.00;
        const currentPrice = p && p.price_usd !== undefined && p.price_usd !== null 
          ? Number(p.price_usd) 
          : (r.price_usd !== undefined && r.price_usd !== null ? Number(r.price_usd) : defaultPrice);
        const currentDuration = p && p.duration_hours 
          ? Number(p.duration_hours) 
          : (r.duration_hours ? Number(r.duration_hours) : 24);

        // Si es una tarjeta vacía / espacio disponible, asegurar slogan dinámico con precio y duración
        let slogan = r.slogan;
        const isAvailableSlot = !r.user_id && (!r.amount_paid || Number(r.amount_paid) === 0 || (r.business_name && r.business_name.includes('Espacio Publicitario Disponible')));
        if (isAvailableSlot || (slogan && slogan.includes('disponible por $'))) {
          slogan = `¡Sé el primero en posicionar tu marca en ${normalizedZone.toUpperCase()}! Posición #${r.position} disponible por $${currentPrice.toFixed(2)}.`;
        }

        return {
          ...r,
          position: Number(r.position),
          slogan,
          price_usd: currentPrice,
          duration_hours: currentDuration
        };
      });
    } catch {
      return rows;
    }
  }

  public async getTop10(zoneKey: string = 'nacional') {
    const normalizedZone = (zoneKey || 'nacional').toLowerCase().trim();

    // 1. Prioridad: API REST de Supabase (HTTPS / Puerto 443)
    if (supabase) {
      try {
        const { data: rankingRows, error: rankingError } = await supabase
          .from('ranking')
          .select('id, position, user_id, payment_id, business_name, target_url, slogan, category, avatar, tier, amount_paid, start_time, end_time, clicks_received, views_received, is_active, zone_key')
          .eq('zone_key', normalizedZone)
          .order('position', { ascending: true })
          .limit(10);

        if (rankingError) {
          console.warn('⚠️ Error al leer ranking desde Supabase:', rankingError.message);
        } else if (rankingRows && rankingRows.length > 0) {
          return await this.enrichSlotsWithPricing(normalizedZone, rankingRows);
        } else {
          // Si la zona aún no tiene anuncios pautados, consultar tarifas en zone_pricing vía Supabase
          const { data: pricingRows, error: pricingError } = await supabase
            .from('zone_pricing')
            .select('position, tier, price_usd, duration_hours')
            .eq('zone_key', normalizedZone)
            .eq('is_active', true)
            .order('position', { ascending: true });

          if (!pricingError && pricingRows && pricingRows.length > 0) {
            return this.mapPricingToEmptySlots(normalizedZone, pricingRows);
          }

          if (!pricingError) {
            return [];
          }
        }
      } catch (err: any) {
        console.warn('⚠️ Excepción al leer ranking desde Supabase, usando respaldo:', err.message);
      }
    }

    // 2. Respaldo local: Pool PostgreSQL directo
    if (db.isPostgresActive) {
      const res = await db.query(
        `SELECT id, position, user_id, payment_id, business_name, target_url, slogan, category, avatar, tier, amount_paid, start_time, end_time, clicks_received, views_received, is_active, zone_key
         FROM ranking
         WHERE zone_key = $1
         ORDER BY position ASC
         LIMIT 10`,
        [normalizedZone]
      );
      if (res.rows.length > 0) {
        return await this.enrichSlotsWithPricing(normalizedZone, res.rows);
      }

      // Si la zona aún no tiene anuncios pautados, generar slots disponibles según sus tarifas
      const pricingRes = await db.query(
        `SELECT position, tier, price_usd, duration_hours FROM zone_pricing WHERE zone_key = $1 AND is_active = TRUE ORDER BY position ASC`,
        [normalizedZone]
      );

      if (pricingRes.rows.length > 0) {
        return this.mapPricingToEmptySlots(normalizedZone, pricingRes.rows);
      }

      return [];
    }

    // 3. Fallback en memoria
    const store = db.getInMemoryStore();
    const zoneAds = (store.ranking || []).filter((r: any) => (r.zone_key || 'nacional') === normalizedZone);
    if (zoneAds.length > 0) {
      const sorted = [...zoneAds].sort((a, b) => a.position - b.position);
      return await this.enrichSlotsWithPricing(normalizedZone, sorted);
    }

    const pricings = (store.zone_pricing || []).filter((p: any) => p.zone_key === normalizedZone);
    if (pricings.length > 0) {
      const sorted = [...pricings].sort((a: any, b: any) => a.position - b.position);
      return this.mapPricingToEmptySlots(normalizedZone, sorted);
    }

    return [];
  }

  public async trackClick(position: number, clientData: { ip?: string; referrer?: string; userAgent?: string; userId?: string }, zoneKey: string = 'nacional') {
    const normalizedZone = (zoneKey || 'nacional').toLowerCase().trim();

    if (supabase) {
      const { data: current, error: fetchErr } = await supabase
        .from('ranking')
        .select('id, clicks_received')
        .eq('position', position)
        .eq('zone_key', normalizedZone)
        .maybeSingle();
      if (fetchErr) throw new Error(fetchErr.message);

      const newClicks = (current?.clicks_received || 0) + 1;
      if (current) {
        const { error: updateErr } = await supabase
          .from('ranking')
          .update({ clicks_received: newClicks })
          .eq('id', current.id);
        if (updateErr) throw new Error(updateErr.message);
      }

      const { error: logErr } = await supabase
        .from('clicks_log')
        .insert([{
          user_id: clientData.userId || null,
          ranking_position: position,
          ip_address: clientData.ip || '127.0.0.1',
          country: 'Venezuela',
          city: normalizedZone,
          referrer: clientData.referrer || null,
          user_agent: clientData.userAgent || null
        }]);
      if (logErr) throw new Error(logErr.message);

      return { position, zone: normalizedZone, clicks: current ? newClicks : 0 };
    }

    if (db.isPostgresActive) {
      // 1. Incrementar contador en ranking
      await db.query(
        'UPDATE ranking SET clicks_received = clicks_received + 1 WHERE position = $1 AND zone_key = $2',
        [position, normalizedZone]
      );

      // 2. Registrar en clicks_log
      await db.query(
        `INSERT INTO clicks_log (user_id, ranking_position, ip_address, country, city, referrer, user_agent)
         VALUES ($1, $2, $3, 'Venezuela', $4, $5, $6)`,
        [clientData.userId || null, position, clientData.ip || '127.0.0.1', normalizedZone, clientData.referrer || null, clientData.userAgent || null]
      );

      const updated = await db.query('SELECT clicks_received FROM ranking WHERE position = $1 AND zone_key = $2', [position, normalizedZone]);
      return { position, zone: normalizedZone, clicks: updated.rows[0]?.clicks_received || 0 };
    }

    const store = db.getInMemoryStore();
    const slot = store.ranking.find(s => s.position === position && (s.zone_key || 'nacional') === normalizedZone);
    if (slot) {
      slot.clicks_received = (slot.clicks_received || 0) + 1;
    }

    store.clicks_log.push({
      id: `clk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      user_id: clientData.userId || null,
      ranking_position: position,
      timestamp: new Date().toISOString(),
      ip_address: clientData.ip || '127.0.0.1',
      country: 'Venezuela',
      city: normalizedZone,
      referrer: clientData.referrer || 'direct',
      user_agent: clientData.userAgent || 'web'
    });

    return { position, zone: normalizedZone, clicks: slot ? slot.clicks_received : 0 };
  }

  public async placeAdInRanking(ad: {
    userId?: string;
    paymentId?: string;
    position: number;
    businessName: string;
    targetUrl: string;
    slogan: string;
    category: string;
    avatar: string;
    amountPaid: number;
    durationHours?: number;
    zoneKey?: string;
  }) {
    const zoneKey = (ad.zoneKey || 'nacional').toLowerCase().trim();
    const tier = ad.position === 1 ? 'gold' : (ad.position <= 3 ? 'silver' : 'dark');
    const duration = ad.durationHours || 24;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 3600 * 1000);

    if (supabase) {
      if (ad.position === 1) {
        await supabase
          .from('ranking')
          .delete()
          .eq('zone_key', zoneKey)
          .gte('position', 10);

        const { data: existing, error: existingErr } = await supabase
          .from('ranking')
          .select('id, position')
          .eq('zone_key', zoneKey)
          .gte('position', 1)
          .lt('position', 10)
          .order('position', { ascending: false });
        if (existingErr) throw new Error(existingErr.message);

        for (const row of existing || []) {
          const newPos = row.position + 1;
          const newTier = newPos <= 3 ? 'silver' : 'dark';
          const { error: shiftErr } = await supabase
            .from('ranking')
            .update({ position: newPos, tier: newTier })
            .eq('id', row.id);
          if (shiftErr) throw new Error(shiftErr.message);
        }
      }

      const { error: upsertErr } = await supabase
        .from('ranking')
        .upsert(
          {
            position: ad.position,
            user_id: ad.userId || null,
            payment_id: ad.paymentId || null,
            business_name: ad.businessName,
            target_url: ad.targetUrl,
            slogan: ad.slogan,
            category: ad.category,
            avatar: ad.avatar,
            tier,
            amount_paid: ad.amountPaid,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            clicks_received: 1,
            views_received: 10,
            is_active: true,
            zone_key: zoneKey
          },
          { onConflict: 'zone_key,position' }
        );
      if (upsertErr) throw new Error(upsertErr.message);

      return this.getTop10(zoneKey);
    }

    if (db.isPostgresActive) {
      // Si entra en puesto 1, desplazar los puestos existentes en orden descendente dentro de la misma zona
      if (ad.position === 1) {
        await db.query('DELETE FROM ranking WHERE zone_key = $1 AND position >= 10', [zoneKey]);
        const existing = await db.query('SELECT id, position FROM ranking WHERE zone_key = $1 AND position >= 1 AND position < 10 ORDER BY position DESC', [zoneKey]);
        for (const row of existing.rows) {
          const newPos = row.position + 1;
          const newTier = newPos <= 3 ? 'silver' : 'dark';
          await db.query('UPDATE ranking SET position = $1, tier = $2 WHERE id = $3', [newPos, newTier, row.id]);
        }
      }

      await db.query(`
        INSERT INTO ranking (position, user_id, payment_id, business_name, target_url, slogan, category, avatar, tier, amount_paid, start_time, end_time, clicks_received, views_received, is_active, zone_key)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, 10, TRUE, $13)
        ON CONFLICT (zone_key, position) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          payment_id = EXCLUDED.payment_id,
          business_name = EXCLUDED.business_name,
          target_url = EXCLUDED.target_url,
          slogan = EXCLUDED.slogan,
          category = EXCLUDED.category,
          avatar = EXCLUDED.avatar,
          tier = EXCLUDED.tier,
          amount_paid = EXCLUDED.amount_paid,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time;
      `, [ad.position, ad.userId || null, ad.paymentId || null, ad.businessName, ad.targetUrl, ad.slogan, ad.category, ad.avatar, tier, ad.amountPaid, startTime, endTime, zoneKey]);

      return this.getTop10(zoneKey);
    }

    // Modo Memoria
    const store = db.getInMemoryStore();

    if (ad.position === 1) {
      store.ranking.forEach(s => {
        if ((s.zone_key || 'nacional') === zoneKey && s.position < 10) {
          s.position += 1;
          s.tier = s.position <= 3 ? 'silver' : 'dark';
        }
      });
    }

    // Remover el que esté en esa posición si existe y agregar el nuevo
    store.ranking = store.ranking.filter(s => !((s.zone_key || 'nacional') === zoneKey && s.position === ad.position) && s.position <= 10);
    store.ranking.push({
      id: Date.now(),
      position: ad.position,
      user_id: ad.userId || null,
      payment_id: ad.paymentId || null,
      business_name: ad.businessName,
      target_url: ad.targetUrl,
      slogan: ad.slogan,
      category: ad.category,
      avatar: ad.avatar,
      tier,
      amount_paid: ad.amountPaid,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      clicks_received: 1,
      views_received: 10,
      is_active: true,
      zone_key: zoneKey
    });

    store.ranking.sort((a, b) => a.position - b.position);
    return this.getTop10(zoneKey);
  }
}

export const rankingService = new RankingService();
