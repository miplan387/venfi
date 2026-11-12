"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitsService = exports.VisitsService = void 0;
const db_1 = require("../database/db");
const supabase_1 = require("../database/supabase");
class VisitsService {
    // Mapa en memoria para rastrear actividad en ventana deslizante de 5 minutos (300,000 ms)
    activeSessions = new Map();
    ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
    // Caché local en memoria de respaldo sincronizada con la base de datos
    fallbackStats = {
        totalVisits: 0,
        activeUsers: 1,
        lastUpdated: new Date().toISOString()
    };
    /**
     * Limpia sesiones inactivas (> 5 minutos) y calcula usuarios activos actuales en memoria
     */
    getActiveUsersCount() {
        const now = Date.now();
        for (const [id, timestamp] of this.activeSessions.entries()) {
            if (now - timestamp > this.ACTIVE_WINDOW_MS) {
                this.activeSessions.delete(id);
            }
        }
        // Al menos 1 usuario activo si el servidor está recibiendo consultas
        return Math.max(this.activeSessions.size, 1);
    }
    /**
     * Sincroniza la caché de respaldo y construye la respuesta uniforme VisitStats
     */
    syncStats(totalVisits, activeCount, lastUpdated) {
        const isoDate = lastUpdated ? new Date(lastUpdated).toISOString() : new Date().toISOString();
        this.fallbackStats = {
            totalVisits,
            activeUsers: activeCount,
            lastUpdated: isoDate
        };
        return this.fallbackStats;
    }
    /**
     * Obtiene las estadísticas actuales de visitas y usuarios activos
     */
    async getVisitsStats() {
        const activeCount = this.getActiveUsersCount();
        const nowIso = new Date().toISOString();
        try {
            // 1. Prioridad: API REST de Supabase (HTTPS / Puerto 443)
            if (supabase_1.supabase) {
                const { data: row, error: selectError } = await supabase_1.supabase
                    .from('visits')
                    .select('total_visits, active_users, last_updated')
                    .eq('id', 1)
                    .maybeSingle();
                if (selectError) {
                    throw new Error(selectError.message);
                }
                if (!row) {
                    const { data: inserted, error: insertError } = await supabase_1.supabase
                        .from('visits')
                        .upsert({ id: 1, total_visits: 0, active_users: activeCount, last_updated: nowIso }, { onConflict: 'id' })
                        .select('total_visits, active_users, last_updated')
                        .single();
                    if (insertError) {
                        throw new Error(insertError.message);
                    }
                    return this.syncStats(Number(inserted?.total_visits || 0), activeCount, inserted?.last_updated || nowIso);
                }
                const totalVisits = Number(row.total_visits || 0);
                const { error: updateError } = await supabase_1.supabase
                    .from('visits')
                    .update({ active_users: activeCount, last_updated: nowIso })
                    .eq('id', 1);
                if (updateError) {
                    console.warn('⚠️ Error al actualizar active_users en Supabase:', updateError.message);
                }
                return this.syncStats(totalVisits, activeCount, row.last_updated || nowIso);
            }
            // 2. Respaldo local: Pool PostgreSQL directo
            if (db_1.db.isPostgresActive) {
                await db_1.db.query(`
          INSERT INTO visits (id, total_visits, active_users, last_updated)
          VALUES (1, 0, $1, NOW())
          ON CONFLICT (id) DO NOTHING
        `, [activeCount]);
                const res = await db_1.db.query('SELECT total_visits, active_users, last_updated FROM visits WHERE id = 1');
                if (res.rows.length > 0) {
                    const row = res.rows[0];
                    const totalVisits = Number(row.total_visits || 0);
                    await db_1.db.query('UPDATE visits SET active_users = $1, last_updated = NOW() WHERE id = 1', [activeCount]);
                    return this.syncStats(totalVisits, activeCount, row.last_updated);
                }
            }
        }
        catch (err) {
            console.warn('⚠️ Error al consultar tabla visits en DB, usando respaldo en memoria:', err.message);
        }
        // 3. Fallback en memoria si la BD no está disponible
        return this.syncStats(this.fallbackStats.totalVisits, activeCount, nowIso);
    }
    /**
     * Incrementa de manera acumulativa y persistente el total de visitas
     * @param visitorId Identificador único del visitante (cookie, session o IP)
     */
    async incrementTotalVisits(visitorId = 'anon') {
        this.activeSessions.set(visitorId, Date.now());
        const activeCount = this.getActiveUsersCount();
        const nowIso = new Date().toISOString();
        try {
            // 1. Prioridad: API REST de Supabase (HTTPS / Puerto 443)
            if (supabase_1.supabase) {
                const { data: currentRow, error: selectError } = await supabase_1.supabase
                    .from('visits')
                    .select('total_visits')
                    .eq('id', 1)
                    .maybeSingle();
                if (selectError) {
                    throw new Error(selectError.message);
                }
                if (!currentRow) {
                    const { data: created, error: insertError } = await supabase_1.supabase
                        .from('visits')
                        .upsert({ id: 1, total_visits: 1, active_users: activeCount, last_updated: nowIso }, { onConflict: 'id' })
                        .select('total_visits, active_users, last_updated')
                        .single();
                    if (insertError) {
                        throw new Error(insertError.message);
                    }
                    return this.syncStats(Number(created?.total_visits || 1), activeCount, created?.last_updated || nowIso);
                }
                const nextTotal = Number(currentRow.total_visits || 0) + 1;
                const { data: updated, error: updateError } = await supabase_1.supabase
                    .from('visits')
                    .update({
                    total_visits: nextTotal,
                    active_users: activeCount,
                    last_updated: nowIso
                })
                    .eq('id', 1)
                    .select('total_visits, active_users, last_updated')
                    .single();
                if (updateError) {
                    throw new Error(updateError.message);
                }
                return this.syncStats(Number(updated?.total_visits ?? nextTotal), activeCount, updated?.last_updated || nowIso);
            }
            // 2. Respaldo local: Pool PostgreSQL directo
            if (db_1.db.isPostgresActive) {
                await db_1.db.query(`
          INSERT INTO visits (id, total_visits, active_users, last_updated)
          VALUES (1, 0, $1, NOW())
          ON CONFLICT (id) DO NOTHING
        `, [activeCount]);
                const updateRes = await db_1.db.query(`
          UPDATE visits 
          SET total_visits = total_visits + 1,
              active_users = $1,
              last_updated = NOW()
          WHERE id = 1
          RETURNING total_visits, active_users, last_updated
        `, [activeCount]);
                if (updateRes.rows.length > 0) {
                    const row = updateRes.rows[0];
                    return this.syncStats(Number(row.total_visits), activeCount, row.last_updated);
                }
            }
        }
        catch (err) {
            console.warn('⚠️ Error al incrementar visits en DB:', err.message);
        }
        // 3. Fallback en memoria si la base de datos está offline
        return this.syncStats(this.fallbackStats.totalVisits + 1, activeCount, nowIso);
    }
    /**
     * Alias de compatibilidad para endpoints existentes
     */
    async trackVisit(visitorId = 'anon') {
        return this.incrementTotalVisits(visitorId);
    }
    /**
     * Heartbeat para mantener activo a un usuario en la ventana deslizante de 5 minutos
     */
    async heartbeat(visitorId) {
        this.activeSessions.set(visitorId, Date.now());
        const activeCount = this.getActiveUsersCount();
        try {
            if (supabase_1.supabase) {
                await supabase_1.supabase
                    .from('visits')
                    .update({ active_users: activeCount, last_updated: new Date().toISOString() })
                    .eq('id', 1);
            }
            else if (db_1.db.isPostgresActive) {
                await db_1.db.query('UPDATE visits SET active_users = $1, last_updated = NOW() WHERE id = 1', [activeCount]);
            }
        }
        catch (err) {
            // Silencioso para no saturar logs en heartbeats frecuentes
        }
        return { activeUsers: activeCount };
    }
}
exports.VisitsService = VisitsService;
exports.visitsService = new VisitsService();
//# sourceMappingURL=visitsService.js.map