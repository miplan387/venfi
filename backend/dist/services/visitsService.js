"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitsService = exports.VisitsService = void 0;
const db_1 = require("../database/db");
class VisitsService {
    // Mapa en memoria para rastrear actividad en ventana deslizante de 5 minutos (300,000 ms)
    activeSessions = new Map();
    ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
    // Caché local en memoria de respaldo
    fallbackStats = {
        totalVisits: 1,
        activeUsers: 1,
        lastUpdated: new Date().toISOString()
    };
    /**
     * Limpia sesiones inactivas (> 5 minutos) y calcula usuarios activos actuales
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
     * Obtiene las estadísticas actuales de visitas y usuarios activos
     */
    async getVisitsStats() {
        const activeCount = this.getActiveUsersCount();
        try {
            if (db_1.db.isPostgresActive) {
                // Consultar el registro principal en PostgreSQL
                const res = await db_1.db.query('SELECT total_visits, active_users, last_updated FROM visits WHERE id = 1');
                if (res.rows.length > 0) {
                    const row = res.rows[0];
                    const totalVisits = Number(row.total_visits || 0);
                    // Actualizar active_users en PostgreSQL con el conteo en tiempo real
                    await db_1.db.query('UPDATE visits SET active_users = $1, last_updated = CURRENT_TIMESTAMP WHERE id = 1', [activeCount]);
                    return {
                        totalVisits,
                        activeUsers: activeCount,
                        lastUpdated: new Date().toISOString()
                    };
                }
            }
        }
        catch (err) {
            console.warn('⚠️ Error al consultar tabla visits en DB, usando respaldo en memoria:', err.message);
        }
        // Fallback en memoria
        this.fallbackStats.activeUsers = activeCount;
        this.fallbackStats.lastUpdated = new Date().toISOString();
        return this.fallbackStats;
    }
    /**
     * Registra una visita nueva e interactiva y renueva la actividad del usuario
     * @param visitorId Identificador único del visitante (cookie, session o IP)
     */
    async trackVisit(visitorId = 'anon') {
        // 1. Registrar o actualizar la sesión del visitante con el timestamp actual
        this.activeSessions.set(visitorId, Date.now());
        const activeCount = this.getActiveUsersCount();
        try {
            if (db_1.db.isPostgresActive) {
                // Asegurar que exista la fila id=1 e incrementar total_visits
                const updateRes = await db_1.db.query(`
          INSERT INTO visits (id, total_visits, active_users, last_updated)
          VALUES (1, 1, $1, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE 
          SET total_visits = visits.total_visits + 1,
              active_users = $1,
              last_updated = CURRENT_TIMESTAMP
          RETURNING total_visits, active_users, last_updated
        `, [activeCount]);
                if (updateRes.rows.length > 0) {
                    const row = updateRes.rows[0];
                    return {
                        totalVisits: Number(row.total_visits),
                        activeUsers: activeCount,
                        lastUpdated: row.last_updated
                    };
                }
            }
        }
        catch (err) {
            console.warn('⚠️ Error al incrementar visits en DB:', err.message);
        }
        // Fallback en memoria
        this.fallbackStats.totalVisits += 1;
        this.fallbackStats.activeUsers = activeCount;
        this.fallbackStats.lastUpdated = new Date().toISOString();
        return this.fallbackStats;
    }
    /**
     * Heartbeat para mantener activo a un usuario en la ventana de 5 minutos
     */
    async heartbeat(visitorId) {
        this.activeSessions.set(visitorId, Date.now());
        const activeCount = this.getActiveUsersCount();
        try {
            if (db_1.db.isPostgresActive) {
                await db_1.db.query('UPDATE visits SET active_users = $1, last_updated = CURRENT_TIMESTAMP WHERE id = 1', [activeCount]);
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