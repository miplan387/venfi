import { db, pool } from '../database/db';

export interface PaymentMethodItem {
  id?: number;
  key: string;
  name: string;
  icon?: string;
  description?: string;
  fields?: Record<string, any>;
  is_active?: boolean;
  requires_approval?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export const getAll = async (): Promise<PaymentMethodItem[]> => {
  if (db.isPostgresActive) {
    const result = await pool.query(
      'SELECT * FROM payment_methods ORDER BY sort_order ASC, id ASC'
    );
    return result.rows;
  }

  const store = db.getInMemoryStore();
  return [...store.payment_methods].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};

export const getActive = async (): Promise<PaymentMethodItem[]> => {
  if (db.isPostgresActive) {
    const result = await pool.query(
      'SELECT * FROM payment_methods WHERE is_active = true ORDER BY sort_order ASC, id ASC'
    );
    return result.rows;
  }

  const store = db.getInMemoryStore();
  return store.payment_methods
    .filter(m => m.is_active)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
};

export const getByKey = async (key: string): Promise<PaymentMethodItem | null> => {
  if (db.isPostgresActive) {
    const result = await pool.query(
      'SELECT * FROM payment_methods WHERE key = $1',
      [key]
    );
    return result.rows[0] || null;
  }

  const store = db.getInMemoryStore();
  return store.payment_methods.find(m => m.key === key) || null;
};

export const create = async (data: {
  key: string;
  name: string;
  icon?: string;
  description?: string;
  fields?: any;
  is_active?: boolean;
  requires_approval?: boolean;
  sort_order?: number;
}): Promise<PaymentMethodItem> => {
  if (db.isPostgresActive) {
    const result = await pool.query(
      `INSERT INTO payment_methods (key, name, icon, description, fields, is_active, requires_approval, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.key,
        data.name,
        data.icon || '💳',
        data.description || '',
        data.fields ? JSON.stringify(data.fields) : '{}',
        data.is_active !== undefined ? data.is_active : true,
        data.requires_approval !== undefined ? data.requires_approval : false,
        data.sort_order || 0
      ]
    );
    return result.rows[0];
  }

  const store = db.getInMemoryStore();
  const newItem: PaymentMethodItem = {
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

export const update = async (
  key: string,
  data: Partial<{
    name: string;
    icon: string;
    description: string;
    fields: any;
    is_active: boolean;
    requires_approval: boolean;
    sort_order: number;
  }>
): Promise<PaymentMethodItem | null> => {
  if (db.isPostgresActive) {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const allowedFields = ['name', 'icon', 'description', 'fields', 'is_active', 'requires_approval', 'sort_order'];
    for (const field of allowedFields) {
      if ((data as any)[field] !== undefined) {
        updates.push(`${field} = $${idx}`);
        const val = field === 'fields' && typeof (data as any)[field] === 'object'
          ? JSON.stringify((data as any)[field])
          : (data as any)[field];
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
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  const store = db.getInMemoryStore();
  const idx = store.payment_methods.findIndex(m => m.key === key);
  if (idx === -1) return null;

  store.payment_methods[idx] = {
    ...store.payment_methods[idx],
    ...data,
    updated_at: new Date().toISOString()
  };
  return store.payment_methods[idx];
};

export const toggleActive = async (key: string): Promise<PaymentMethodItem | null> => {
  const current = await getByKey(key);
  if (!current) throw new Error('Método no encontrado');
  const newStatus = !current.is_active;

  if (db.isPostgresActive) {
    const result = await pool.query(
      'UPDATE payment_methods SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2 RETURNING *',
      [newStatus, key]
    );
    return result.rows[0] || null;
  }

  const store = db.getInMemoryStore();
  const item = store.payment_methods.find(m => m.key === key);
  if (item) {
    item.is_active = newStatus;
    item.updated_at = new Date().toISOString();
  }
  return item || null;
};

export const deleteMethod = async (key: string): Promise<{ key: string } | null> => {
  if (db.isPostgresActive) {
    const result = await pool.query(
      'DELETE FROM payment_methods WHERE key = $1 RETURNING key',
      [key]
    );
    return result.rows[0] || null;
  }

  const store = db.getInMemoryStore();
  const idx = store.payment_methods.findIndex(m => m.key === key);
  if (idx !== -1) {
    store.payment_methods.splice(idx, 1);
    return { key };
  }
  return null;
};

export const paymentMethodsService = {
  getAll,
  getActive,
  getByKey,
  create,
  update,
  toggleActive,
  deleteMethod
};
