"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const db_1 = require("../database/db");
class AdminService {
    /**
     * Obtiene todas las tarjetas del ranking con datos del anunciante y pagos
     */
    async getAllCards() {
        const now = new Date();
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query(`SELECT 
          r.id,
          r.position,
          r.business_name,
          r.slogan,
          r.target_url,
          r.category,
          r.avatar,
          r.tier,
          r.amount_paid,
          r.clicks_received,
          r.views_received,
          r.is_active,
          r.start_time,
          r.end_time,
          r.payment_id,
          r.user_id,
          u.email as advertiser_email,
          u.username as advertiser_username,
          p.payment_method,
          p.status as payment_status
         FROM ranking r
         LEFT JOIN users u ON r.user_id = u.id
         LEFT JOIN payments p ON r.payment_id = p.id
         ORDER BY r.position ASC`);
            return res.rows.map((row) => {
                const endTime = row.end_time ? new Date(row.end_time) : null;
                const hoursRemaining = endTime
                    ? Math.max(0, Number(((endTime.getTime() - now.getTime()) / (3600 * 1000)).toFixed(1)))
                    : 0;
                return {
                    id: row.id,
                    position: row.position,
                    businessName: row.business_name,
                    slogan: row.slogan,
                    targetUrl: row.target_url,
                    category: row.category,
                    avatar: row.avatar,
                    tier: row.tier,
                    amountPaid: Number(row.amount_paid || 0),
                    clicksReceived: row.clicks_received || 0,
                    viewsReceived: row.views_received || 0,
                    isActive: row.is_active,
                    startTime: row.start_time,
                    endTime: row.end_time,
                    hoursRemaining,
                    paymentId: row.payment_id,
                    userId: row.user_id,
                    advertiserEmail: row.advertiser_email || 'Sin usuario registrado',
                    advertiserUsername: row.advertiser_username || 'Pauta Directa',
                    paymentMethod: row.payment_method || 'direct',
                    paymentStatus: row.payment_status || 'completed'
                };
            });
        }
        const store = db_1.db.getInMemoryStore();
        return store.ranking.map(r => {
            const user = store.users.find(u => u.id === r.user_id);
            const payment = store.payments.find(p => p.id === r.payment_id);
            const endTime = r.end_time ? new Date(r.end_time) : null;
            const hoursRemaining = endTime
                ? Math.max(0, Number(((endTime.getTime() - now.getTime()) / (3600 * 1000)).toFixed(1)))
                : 0;
            return {
                id: r.id,
                position: r.position,
                businessName: r.business_name,
                slogan: r.slogan,
                targetUrl: r.target_url,
                category: r.category,
                avatar: r.avatar,
                tier: r.tier,
                amountPaid: Number(r.amount_paid || 0),
                clicksReceived: r.clicks_received || 0,
                viewsReceived: r.views_received || 0,
                isActive: r.is_active !== false,
                startTime: r.start_time,
                endTime: r.end_time,
                hoursRemaining,
                paymentId: r.payment_id,
                userId: r.user_id,
                advertiserEmail: user?.email || 'Sin usuario registrado',
                advertiserUsername: user?.username || 'Pauta Directa',
                paymentMethod: payment?.payment_method || 'direct',
                paymentStatus: payment?.status || 'completed'
            };
        }).sort((a, b) => a.position - b.position);
    }
    /**
     * Actualiza los datos de una tarjeta del ranking
     */
    async updateCard(cardId, data) {
        const idNum = Number(cardId);
        if (db_1.db.isPostgresActive) {
            const currentRes = await db_1.db.query('SELECT * FROM ranking WHERE id = $1', [idNum]);
            if (currentRes.rows.length === 0) {
                throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
            }
            const current = currentRes.rows[0];
            const businessName = data.businessName ?? current.business_name;
            const slogan = data.slogan ?? current.slogan;
            const targetUrl = data.targetUrl ?? current.target_url;
            const category = data.category ?? current.category;
            const avatar = data.avatar ?? current.avatar;
            const tier = data.tier ?? current.tier;
            const amountPaid = data.amountPaid ?? current.amount_paid;
            const isActive = data.isActive !== undefined ? data.isActive : current.is_active;
            const updateRes = await db_1.db.query(`UPDATE ranking 
         SET business_name = $1,
             slogan = $2,
             target_url = $3,
             category = $4,
             avatar = $5,
             tier = $6,
             amount_paid = $7,
             is_active = $8
         WHERE id = $9
         RETURNING *`, [businessName, slogan, targetUrl, category, avatar, tier, amountPaid, isActive, idNum]);
            return updateRes.rows[0];
        }
        const store = db_1.db.getInMemoryStore();
        const card = store.ranking.find(r => r.id === idNum);
        if (!card) {
            throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
        }
        if (data.businessName !== undefined)
            card.business_name = data.businessName;
        if (data.slogan !== undefined)
            card.slogan = data.slogan;
        if (data.targetUrl !== undefined)
            card.target_url = data.targetUrl;
        if (data.category !== undefined)
            card.category = data.category;
        if (data.avatar !== undefined)
            card.avatar = data.avatar;
        if (data.tier !== undefined)
            card.tier = data.tier;
        if (data.amountPaid !== undefined)
            card.amount_paid = data.amountPaid;
        if (data.isActive !== undefined)
            card.is_active = data.isActive;
        return card;
    }
    /**
     * Alterna el estado activo / inactivo de una tarjeta
     */
    async toggleCardStatus(cardId) {
        const idNum = Number(cardId);
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query(`UPDATE ranking 
         SET is_active = NOT is_active 
         WHERE id = $1 
         RETURNING id, position, business_name, is_active`, [idNum]);
            if (res.rows.length === 0) {
                throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
            }
            return res.rows[0];
        }
        const store = db_1.db.getInMemoryStore();
        const card = store.ranking.find(r => r.id === idNum);
        if (!card) {
            throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
        }
        card.is_active = !card.is_active;
        return {
            id: card.id,
            position: card.position,
            business_name: card.business_name,
            is_active: card.is_active
        };
    }
    /**
     * Extiende la duración de una tarjeta por N horas (por defecto 24h)
     */
    async renewCard(cardId, durationHours = 24) {
        const idNum = Number(cardId);
        const now = new Date();
        const newEndTime = new Date(now.getTime() + durationHours * 3600 * 1000);
        if (db_1.db.isPostgresActive) {
            const res = await db_1.db.query(`UPDATE ranking 
         SET end_time = $1, is_active = TRUE 
         WHERE id = $2 
         RETURNING *`, [newEndTime, idNum]);
            if (res.rows.length === 0) {
                throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
            }
            return res.rows[0];
        }
        const store = db_1.db.getInMemoryStore();
        const card = store.ranking.find(r => r.id === idNum);
        if (!card) {
            throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
        }
        card.end_time = newEndTime.toISOString();
        card.is_active = true;
        return card;
    }
    /**
     * Elimina o restablece una tarjeta a espacio disponible por defecto
     */
    async deleteCard(cardId) {
        const idNum = Number(cardId);
        if (db_1.db.isPostgresActive) {
            const getRes = await db_1.db.query('SELECT position FROM ranking WHERE id = $1', [idNum]);
            if (getRes.rows.length === 0) {
                throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
            }
            const position = getRes.rows[0].position;
            // Restablecer como espacio libre disponible
            const res = await db_1.db.query(`UPDATE ranking 
         SET business_name = 'Espacio Publicitario Disponible ✨',
             target_url = 'https://venfi.app/#ranking',
             slogan = 'Coloca tu negocio aquí frente a miles de compradores diarios en toda Venezuela por solo $5.',
             category = '¡Tu Marca Aquí!',
             avatar = '🚀',
             tier = 'dark',
             amount_paid = 0.00,
             user_id = NULL,
             payment_id = NULL,
             start_time = CURRENT_TIMESTAMP,
             end_time = NULL,
             clicks_received = 0,
             views_received = 0,
             is_active = TRUE
         WHERE id = $1
         RETURNING *`, [idNum]);
            return {
                success: true,
                message: `Tarjeta del puesto #${position} restablecida como espacio disponible.`,
                data: res.rows[0]
            };
        }
        const store = db_1.db.getInMemoryStore();
        const card = store.ranking.find(r => r.id === idNum);
        if (!card) {
            throw new Error(`Tarjeta con ID ${cardId} no encontrada`);
        }
        card.business_name = 'Espacio Publicitario Disponible ✨';
        card.target_url = 'https://venfi.app/#ranking';
        card.slogan = 'Coloca tu negocio aquí frente a miles de compradores diarios en toda Venezuela por solo $5.';
        card.category = '¡Tu Marca Aquí!';
        card.avatar = '🚀';
        card.tier = 'dark';
        card.amount_paid = 0.00;
        card.user_id = null;
        card.payment_id = null;
        card.clicks_received = 0;
        card.views_received = 0;
        card.is_active = true;
        return {
            success: true,
            message: `Tarjeta del puesto #${card.position} restablecida como espacio disponible.`,
            data: card
        };
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
//# sourceMappingURL=adminService.js.map