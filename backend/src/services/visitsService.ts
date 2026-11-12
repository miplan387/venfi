import { db } from '../database/db';
import { supabase } from '../database/supabase';

export interface VisitStats {
  totalVisits: number;
  activeUsers: number;
  lastUpdated: string;
}

export class VisitsService {
  // Mapa en memoria para rastrear actividad en ventana deslizante de 5 minutos (300,000 ms)
  private activeSessions = new Map<string, number>();
  private readonly ACTIVE_WINDOW_MS = 5 * 60 * 1000; // 5 minutos

  // Caché local en memoria de respaldo sincronizada con la base de datos
  private fallbackStats: VisitStats = {
    totalVisits: 0,
    activeUsers: 1,
    lastUpdated: new Date().toISOString()
  };

  /**
   * Limpia sesiones inactivas (> 5 minutos) y calcula usuarios activos actuales en memoria
   */
  private getActiveUsersCount(): number {
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
  private syncStats(totalVisits: number, activeCount: number, lastUpdated?: string | Date | null): VisitStats {
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
  public async getVisitsStats(): Promise<VisitStats> {
    const activeCount = this.getActiveUsersCount();
    const nowIso = new Date().toISOString();

    try {
      // 1. Prioridad: API REST de Supabase (HTTPS / Puerto 443)
      if (supabase) {
        console.log('[VISITS] Usando Supabase REST para leer estadísticas');
        const { data: row, error: selectError } = await supabase
          .from('visits')
          .select('total_visits, active_users, last_updated')
          .eq('id', 1)
          .maybeSingle();

        if (selectError) {
          console.error('[VISITS] Error en consulta Supabase:', selectError.message);
          throw new Error(selectError.message);
        }

        if (!row) {
          console.log('[VISITS] Registro id=1 no encontrado en Supabase, inicializando...');
          const { data: inserted, error: insertError } = await supabase
            .from('visits')
            .upsert({ id: 1, total_visits: 0, active_users: activeCount, last_updated: nowIso }, { onConflict: 'id' })
            .select('total_visits, active_users, last_updated')
            .single();

          if (insertError) {
            console.error('[VISITS] Error al inicializar en Supabase:', insertError.message);
            throw new Error(insertError.message);
          }

          return this.syncStats(Number(inserted?.total_visits || 0), activeCount, inserted?.last_updated || nowIso);
        }

        const totalVisits = Number(row.total_visits || 0);

        const { error: updateError } = await supabase
          .from('visits')
          .update({ active_users: activeCount, last_updated: nowIso })
          .eq('id', 1);

        if (updateError) {
          console.warn('⚠️ [VISITS] Error al actualizar active_users en Supabase:', updateError.message);
        }

        return this.syncStats(totalVisits, activeCount, row.last_updated || nowIso);
      }

      // 2. Respaldo local: Pool PostgreSQL directo
      if (db.isPostgresActive) {
        console.log('[VISITS] Usando PostgreSQL Pool directo para leer estadísticas');
        await db.query(`
          INSERT INTO visits (id, total_visits, active_users, last_updated)
          VALUES (1, 0, $1, NOW())
          ON CONFLICT (id) DO NOTHING
        `, [activeCount]);

        const res = await db.query('SELECT total_visits, active_users, last_updated FROM visits WHERE id = 1');

        if (res.rows.length > 0) {
          const row = res.rows[0];
          const totalVisits = Number(row.total_visits || 0);

          await db.query(
            'UPDATE visits SET active_users = $1, last_updated = NOW() WHERE id = 1',
            [activeCount]
          );

          return this.syncStats(totalVisits, activeCount, row.last_updated);
        }
      }
    } catch (err: any) {
      console.warn('⚠️ [VISITS] Error al consultar tabla visits en DB:', err.message);
    }

    // 3. Fallback en memoria si la BD no está disponible
    console.log('[VISITS] Usando Fallback de Memoria para estadísticas (total:', this.fallbackStats.totalVisits, ')');
    return this.syncStats(this.fallbackStats.totalVisits, activeCount, nowIso);
  }

  /**
   * Incrementa de manera acumulativa y persistente el total de visitas
   * @param visitorId Identificador único del visitante (cookie, session o IP)
   */
  public async incrementTotalVisits(visitorId: string = 'anon'): Promise<VisitStats> {
    this.activeSessions.set(visitorId, Date.now());
    const activeCount = this.getActiveUsersCount();
    const nowIso = new Date().toISOString();

    try {
      // 1. Prioridad: API REST de Supabase (HTTPS / Puerto 443)
      if (supabase) {
        console.log('[VISITS] Usando Supabase REST para incrementar visitas');
        const { data: currentRow, error: selectError } = await supabase
          .from('visits')
          .select('total_visits')
          .eq('id', 1)
          .maybeSingle();

        if (selectError) {
          console.error('[VISITS] Error al leer total_visits en Supabase:', selectError.message);
          throw new Error(selectError.message);
        }

        if (!currentRow) {
          console.log('[VISITS] Registro id=1 no encontrado en Supabase, inicializando en 1...');
          const { data: created, error: insertError } = await supabase
            .from('visits')
            .upsert({ id: 1, total_visits: 1, active_users: activeCount, last_updated: nowIso }, { onConflict: 'id' })
            .select('total_visits, active_users, last_updated')
            .single();

          if (insertError) {
            console.error('[VISITS] Error al insertar registro inicial en Supabase:', insertError.message);
            throw new Error(insertError.message);
          }

          return this.syncStats(Number(created?.total_visits || 1), activeCount, created?.last_updated || nowIso);
        }

        const nextTotal = Number(currentRow.total_visits || 0) + 1;

        const { data: updated, error: updateError } = await supabase
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
          console.error('[VISITS] Error al actualizar total_visits en Supabase:', updateError.message);
          throw new Error(updateError.message);
        }

        return this.syncStats(Number(updated?.total_visits ?? nextTotal), activeCount, updated?.last_updated || nowIso);
      }

      // 2. Respaldo local: Pool PostgreSQL directo
      if (db.isPostgresActive) {
        console.log('[VISITS] Usando PostgreSQL Pool directo para incrementar visitas');
        await db.query(`
          INSERT INTO visits (id, total_visits, active_users, last_updated)
          VALUES (1, 0, $1, NOW())
          ON CONFLICT (id) DO NOTHING
        `, [activeCount]);

        const updateRes = await db.query(`
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
    } catch (err: any) {
      console.warn('⚠️ [VISITS] Error al incrementar visits en DB:', err.message);
    }

    // 3. Fallback en memoria si la base de datos está offline
    console.log('[VISITS] Usando Fallback de Memoria para incremento (total:', this.fallbackStats.totalVisits + 1, ')');
    return this.syncStats(this.fallbackStats.totalVisits + 1, activeCount, nowIso);
  }

  /**
   * Alias de compatibilidad para endpoints existentes
   */
  public async trackVisit(visitorId: string = 'anon'): Promise<VisitStats> {
    return this.incrementTotalVisits(visitorId);
  }

  /**
   * Heartbeat para mantener activo a un usuario en la ventana deslizante de 5 minutos
   */
  public async heartbeat(visitorId: string): Promise<{ activeUsers: number }> {
    this.activeSessions.set(visitorId, Date.now());
    const activeCount = this.getActiveUsersCount();

    try {
      if (supabase) {
        await supabase
          .from('visits')
          .update({ active_users: activeCount, last_updated: new Date().toISOString() })
          .eq('id', 1);
      } else if (db.isPostgresActive) {
        await db.query('UPDATE visits SET active_users = $1, last_updated = NOW() WHERE id = 1', [activeCount]);
      }
    } catch (err) {
      // Silencioso para no saturar logs en heartbeats frecuentes
    }

    return { activeUsers: activeCount };
  }
}

export const visitsService = new VisitsService();
