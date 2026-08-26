import { pool } from '../config/database.js';

const resourceFields = 'id, name, description, type, location, capacity, status, created_at, updated_at';

export async function findResources({ search, type, location, status }) {
  const conditions = [];
  const values = [];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  if (location) {
    values.push(location);
    conditions.push(`location = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT ${resourceFields} FROM resources${whereClause} ORDER BY name ASC, id ASC`,
    values
  );
  return result.rows;
}

export async function findResourceById(id) {
  const result = await pool.query(
    `SELECT ${resourceFields} FROM resources WHERE id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function createResource({ name, description, type, location, capacity, status }) {
  const result = await pool.query(
    `INSERT INTO resources (name, description, type, location, capacity, status)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::resource_status, 'ACTIVE'::resource_status))
     RETURNING ${resourceFields}`,
    [name, description, type, location, capacity, status]
  );
  return result.rows[0];
}

export async function updateResource(id, { name, description, type, location, capacity, status }) {
  const result = await pool.query(
    `UPDATE resources
      SET name = $1, description = $2, type = $3, location = $4, capacity = $5,
          status = COALESCE($6::resource_status, status)
     WHERE id = $7
     RETURNING ${resourceFields}`,
    [name, description, type, location, capacity, status, id]
  );
  return result.rows[0] || null;
}

export async function deleteResource(id) {
  const result = await pool.query(
    'DELETE FROM resources WHERE id = $1 RETURNING id',
    [id]
  );
  return result.rowCount > 0;
}