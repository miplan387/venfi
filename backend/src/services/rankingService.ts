import { db } from '../database/db';

export class RankingService {
  public async getTop10(zoneKey: string = 'nacional') {
    const normalizedZone = (zoneKey || 'nacional').toLowerCase().trim();

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
        return res.rows;
      }

      // Si la zona aún no tiene anuncios pautados, generar slots disponibles según sus tarifas
      const pricingRes = await db.query(
        `SELECT position, tier, price_usd, duration_hours FROM zone_pricing WHERE zone_key = $1 AND is_active = TRUE ORDER BY position ASC`,
        [normalizedZone]
      );

      if (pricingRes.rows.length > 0) {
        return pricingRes.rows.map(p => ({
          id: `slot_${normalizedZone}_${p.position}`,
          position: p.position,
          user_id: null,
          payment_id: null,
          business_name: 'Espacio Publicitario Disponible ✨',
          target_url: 'https://venfidata.com/#ranking',
          slogan: `¡Sé el primero en posicionar tu marca en ${normalizedZone.toUpperCase()}! Posición #${p.position} disponible por $${Number(p.price_usd).toFixed(2)}.`,
          category: 'Publicidad Local',
          avatar: '🚀',
          tier: p.tier,
          amount_paid: 0.00,
          start_time: new Date().toISOString(),
          end_time: null,
          clicks_received: 0,
          views_received: 0,
          is_active: true,
          zone_key: normalizedZone
        }));
      }

      return [];
    }

    const store = db.getInMemoryStore();
    const zoneAds = (store.ranking || []).filter((r: any) => (r.zone_key || 'nacional') === normalizedZone);
    if (zoneAds.length > 0) {
      return [...zoneAds].sort((a, b) => a.position - b.position);
    }

    const pricings = (store.zone_pricing || []).filter((p: any) => p.zone_key === normalizedZone);
    if (pricings.length > 0) {
      return pricings.sort((a: any, b: any) => a.position - b.position).map((p: any) => ({
        id: `slot_${normalizedZone}_${p.position}`,
        position: p.position,
        user_id: null,
        payment_id: null,
        business_name: 'Espacio Publicitario Disponible ✨',
        target_url: 'https://venfidata.com/#ranking',
        slogan: `¡Sé el primero en posicionar tu marca en ${normalizedZone.toUpperCase()}! Posición #${p.position} disponible por $${Number(p.price_usd).toFixed(2)}.`,
        category: 'Publicidad Local',
        avatar: '🚀',
        tier: p.tier,
        amount_paid: 0.00,
        start_time: new Date().toISOString(),
        end_time: null,
        clicks_received: 0,
        views_received: 0,
        is_active: true,
        zone_key: normalizedZone
      }));
    }

    return [];
  }

  public async trackClick(position: number, clientData: { ip?: string; referrer?: string; userAgent?: string; userId?: string }, zoneKey: string = 'nacional') {
    const normalizedZone = (zoneKey || 'nacional').toLowerCase().trim();

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
