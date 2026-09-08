import { pool } from '../config/database.js';

const resourceFields = 'id, name, description, type, location, capacity, status, organization_id, created_at, updated_at';

export async function findResources({ search, type, location, status, organizationId }) {
  const conditions = ['organization_id = $1'];
  const values = [organizationId];

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

  const whereClause = ` WHERE ${conditions.join(' AND ')}`;
  const result = await pool.query(
    `SELECT ${resourceFields} FROM resources${whereClause} ORDER BY name ASC, id ASC`,
    values
  );
  return result.rows;
}

export async function findResourceById(id, organizationId) {
  const result = await pool.query(
    `SELECT ${resourceFields} FROM resources WHERE id = $1 AND organization_id = $2`,
    [id, organizationId]
  );
  return result.rows[0] || null;
}

export async function createResource({ name, description, type, location, capacity, status, organizationId }) {
  const result = await pool.query(
    `INSERT INTO resources (name, description, type, location, capacity, status, organization_id)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::resource_status, 'ACTIVE'::resource_status), $7)
     RETURNING ${resourceFields}`,
    [name, description, type, location, capacity, status, organizationId]
  );
  return result.rows[0];
}

export async function updateResource(id, { name, description, type, location, capacity, status, organizationId }) {
  const result = await pool.query(
    `UPDATE resources
      SET name = $1, description = $2, type = $3, location = $4, capacity = $5,
          status = COALESCE($6::resource_status, status), updated_at = NOW()
     WHERE id = $7 AND organization_id = $8
     RETURNING ${resourceFields}`,
    [name, description, type, location, capacity, status, id, organizationId]
  );
  return result.rows[0] || null;
}

export async function deleteResource(id, organizationId) {
  const result = await pool.query(
    'DELETE FROM resources WHERE id = $1 AND organization_id = $2 RETURNING id',
    [id, organizationId]
  );
  return result.rowCount > 0;
}