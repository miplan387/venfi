"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentMethodsService = exports.deleteMethod = exports.toggleActive = exports.update = exports.create = exports.getByKey = exports.getActive = exports.getAll = void 0;
const db_1 = require("../database/db");
const getAll = async () => {
    if (db_1.db.isPostgresActive) {
        const result = await db_1.pool.query('SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC');
        return result.rows;
    }
    const store = db_1.db.getInMemoryStore();
    return [...store.payment_methods].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};
exports.getAll = getAll;
const getActive = async () => {
    if (db_1.db.isPostgresActive) {
        const result = await db_1.pool.query('SELECT * FROM payment_methods WHERE is_active = true ORDER BY sort_order ASC, id ASC');
        return result.rows;
    }
    const store = db_1.db.getInMemoryStore();
    return store.payment_methods
        .filter(m => m.is_active)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};
exports.getActive = getActive;
const getByKey = async (key) => {
    if (db_1.db.isPostgresActive) {
        const result = await db_1.pool.query('SELECT * FROM payment_methods WHERE key = $1', [key]);
        return result.rows[0] || null;
    }
    const store = db_1.db.getInMemoryStore();
    return store.payment_methods.find(m => m.key === key) || null;
};
exports.getByKey = getByKey;
const create = async (data) => {
    if (db_1.db.isPostgresActive) {
        const result = await db_1.pool.query(`INSERT INTO payment_methods (key, name, icon, description, fields, is_active, requires_approval, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [
            data.key,
            data.name,
            data.icon || '💳',
            data.description || '',
            data.fields ? JSON.stringify(data.fields) : '{}',
            data.is_active !== undefined ? data.is_active : true,
            data.requires_approval !== undefined ? data.requires_approval : false,
            data.sort_order || 0
        ]);
        return result.rows[0];
    }
    const store = db_1.db.getInMemoryStore();
    const newItem = {
        id: store.payment_methods.length + 1,
        key: data.key,
        name: data.name,
        icon: data.icon || '💳',
        description: data.description || '',
        fields: data.fields || {},
        is_active: data.is_active !== undefined ? data.is_active : true,
        requires_approval: data.requires_approval !== undefined ? data.requires_approval : false,
        sort_order: data.sort_order || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    store.payment_methods.push(newItem);
    return newItem;
};
exports.create = create;
const update = async (key, data) => {
    if (db_1.db.isPostgresActive) {
        const updates = [];
        const values = [];
        let idx = 1;
        const allowedFields = ['name', 'icon', 'description', 'fields', 'is_active', 'requires_approval', 'sort_order'];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updates.push(`${field} = $${idx}`);
                const val = field === 'fields' && typeof data[field] === 'object'
                    ? JSON.stringify(data[field])
                    : data[field];
                values.push(val);
                idx++;
            }
        }
        if (updates.length === 0) {
            throw new Error('No se proporcionaron campos para actualizar');
        }
        updates.push(`updated_at = CURRENT_TIMESTAMP`);
        values.push(key);
        const query = `UPDATE payment_methods SET ${updates.join(', ')} WHERE key = $${idx} RETURNING *`;
        const result = await db_1.pool.query(query, values);
        return result.rows[0] || null;
    }
    const store = db_1.db.getInMemoryStore();
    const idx = store.payment_methods.findIndex(m => m.key === key);
    if (idx === -1)
        return null;
    store.payment_methods[idx] = {
        ...store.payment_methods[idx],
        ...data,
        updated_at: new Date().toISOString()
    };
    return store.payment_methods[idx];
};
exports.update = update;
const toggleActive = async (key) => {
    const current = await (0, exports.getByKey)(key);
    if (!current)
        throw new Error('Método no encontrado');
    const newStatus = !current.is_active;
    if (db_1.db.isPostgresActive) {
        const result = await db_1.pool.query('UPDATE payment_methods SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING *', [newStatus, key]);
        return result.rows[0] || null;
    }
    const store = db_1.db.getInMemoryStore();
    const item = store.payment_methods.find(m => m.key === key);
    if (item) {
        item.is_active = newStatus;
        item.updated_at = new Date().toISOString();
    }
    return item || null;
};
exports.toggleActive = toggleActive;
const deleteMethod = async (key) => {
    if (db_1.db.isPostgresActive) {
        const result = await db_1.pool.query('DELETE FROM payment_methods WHERE key = $1 RETURNING key', [key]);
        return result.rows[0] || null;
    }
    const store = db_1.db.getInMemoryStore();
    const idx = store.payment_methods.findIndex(m => m.key === key);
    if (idx !== -1) {
        store.payment_methods.splice(idx, 1);
        return { key };
    }
    return null;
};
exports.deleteMethod = deleteMethod;
exports.paymentMethodsService = {
    getAll: exports.getAll,
    getActive: exports.getActive,
    getByKey: exports.getByKey,
    create: exports.create,
    update: exports.update,
    toggleActive: exports.toggleActive,
    deleteMethod: exports.deleteMethod
};
//# sourceMappingURL=paymentMethodsService.js.map