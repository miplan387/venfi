"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingService = exports.RankingService = void 0;
const db_1 = require("../database/db");
class RankingService {
    async getTop10() {
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query(`SELECT id, position, user_id, payment_id, business_name, target_url, slogan, category, avatar, tier, amount_paid, start_time, end_time, clicks_received, views_received, is_active
         FROM ranking
         ORDER BY position ASC
         LIMIT 10`);
            if (res.rows.length >= 10) {
                return res.rows;
            }
        }
        const store = db_1.db.getInMemoryStore();
        return [...store.ranking].sort((a, b) => a.position - b.position);
    }
    async trackClick(position, clientData) {
        if (db_1.db.isPostgresActive) {
            // 1. Incrementar contador en ranking
            await db_1.db.query('UPDATE ranking SET clicks_received = clicks_received + 1 WHERE position = $1', [position]);
            // 2. Registrar en clicks_log
            await db_1.db.query(`INSERT INTO clicks_log (user_id, ranking_position, ip_address, country, city, referrer, user_agent)
         VALUES ($1, $2, $3, 'Venezuela', 'Caracas', $4, $5)`, [clientData.userId || null, position, clientData.ip || '127.0.0.1', clientData.referrer || null, clientData.userAgent || null]);
            const updated = await db_1.db.query('SELECT clicks_received FROM ranking WHERE position = $1', [position]);
            return { position, clicks: updated.rows[0]?.clicks_received || 0 };
        }
        const store = db_1.db.getInMemoryStore();
        const slot = store.ranking.find(s => s.position === position);
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
            city: 'Caracas',
            referrer: clientData.referrer || 'direct',
            user_agent: clientData.userAgent || 'web'
        });
        return { position, clicks: slot ? slot.clicks_received : 0 };
    }
    async placeAdInRanking(ad) {
        const tier = ad.position === 1 ? 'gold' : (ad.position <= 3 ? 'silver' : 'dark');
        const duration = ad.durationHours || 24;
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 3600 * 1000);
        if (db_1.db.isPostgresActive) {
            // Si entra en puesto 1, desplazar los puestos existentes en orden descendente para evitar colisiones
            if (ad.position === 1) {
                await db_1.db.query('DELETE FROM ranking WHERE position >= 10');
                const existing = await db_1.db.query('SELECT id, position FROM ranking WHERE position >= 1 AND position < 10 ORDER BY position DESC');
                for (const row of existing.rows) {
                    const newPos = row.position + 1;
                    const newTier = newPos <= 3 ? 'silver' : 'dark';
                    await db_1.db.query('UPDATE ranking SET position = $1, tier = $2 WHERE id = $3', [newPos, newTier, row.id]);
                }
            }
            await db_1.db.query(`
        INSERT INTO ranking (position, user_id, payment_id, business_name, target_url, slogan, category, avatar, tier, amount_paid, start_time, end_time, clicks_received, views_received, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1, 10, TRUE)
        ON CONFLICT (position) DO UPDATE SET
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
      `, [ad.position, ad.userId || null, ad.paymentId || null, ad.businessName, ad.targetUrl, ad.slogan, ad.category, ad.avatar, tier, ad.amountPaid, startTime, endTime]);
            return this.getTop10();
        }
        // Modo Memoria
        const store = db_1.db.getInMemoryStore();
        if (ad.position === 1) {
            store.ranking.forEach(s => {
                if (s.position < 10) {
                    s.position += 1;
                    s.tier = s.position <= 3 ? 'silver' : 'dark';
                }
            });
        }
        // Remover el que esté en esa posición si existe y agregar el nuevo
        store.ranking = store.ranking.filter(s => s.position !== ad.position && s.position <= 10);
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
            is_active: true
        });
        store.ranking.sort((a, b) => a.position - b.position);
        return store.ranking;
    }
}
exports.RankingService = RankingService;
exports.rankingService = new RankingService();
//# sourceMappingURL=rankingService.js.map