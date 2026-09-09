import { pool } from '../config/database.js';

export async function findUsers({ search, role, organizationId }) {
  const conditions = ["u.organization_id = $1", "u.role <> 'SUPER_ADMIN'"];
  const values = [organizationId];
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(u.name ILIKE $${values.length} OR u.email ILIKE $${values.length})`);
  }
  if (role) {
    values.push(role);
    conditions.push(`u.role = $${values.length}::user_role`);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.status, u.created_at, u.updated_at, u.last_login,
            COUNT(b.id)::int AS booking_count
      FROM users u LEFT JOIN bookings b ON b.user_id = u.id
      AND b.organization_id = u.organization_id
     ${whereClause} GROUP BY u.id ORDER BY u.created_at DESC, u.id DESC`,
    values
  );
  return result.rows;
}

export async function updateLastLogin(userId) {
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
}

export async function createAdmin({ name, email, passwordHash, organizationId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, status, organization_id, must_change_password)
       VALUES ($1, $2, $3, 'ADMIN', 'ACTIVE', $4, true)
       RETURNING id, name, email, role, status, organization_id, must_change_password, created_at, updated_at`,
      [name, email, passwordHash, organizationId]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updatePassword(userId, organizationId, passwordHash) {
  const result = await pool.query(
    `UPDATE users
     SET password_hash = $1, must_change_password = false, updated_at = NOW()
    WHERE id = $2 AND organization_id = $3
     RETURNING id, name, email, role, status, organization_id, must_change_password, created_at, updated_at`,
    [passwordHash, userId, organizationId]
  );
  return result.rows[0];
}

export async function updateUserStatus(id, status, organizationId) {
  const result = await pool.query(
    `UPDATE users SET status = $1, updated_at = NOW()
     WHERE id = $2 AND organization_id = $3 AND role <> 'SUPER_ADMIN'
     RETURNING id, name, email, role, status, created_at, updated_at`,
    [status, id, organizationId]
  );
  return result.rows[0];
}

export async function getUserById(id, organizationId) {
  const result = await pool.query('SELECT id, name, email, role, status, organization_id FROM users WHERE id = $1 AND organization_id = $2', [id, organizationId]);
  return result.rows[0];
}

export async function deleteUserById(id, email, organizationId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Ensure the user actually belongs to the admin's organization before proceeding
    const checkRes = await client.query('SELECT id FROM users WHERE id = $1 AND organization_id = $2', [id, organizationId]);
    if (checkRes.rows.length === 0) {
      throw new Error('User not found or access denied.');
    }

    // Clean up auth tokens associated with this user
    await client.query('DELETE FROM auth_tokens WHERE (user_id = $1 OR LOWER(email) = LOWER($2)) AND organization_id = $3', [id, email, organizationId]);
    
    // Clean up bookings associated with this user
    await client.query('DELETE FROM bookings WHERE user_id = $1 AND organization_id = $2', [id, organizationId]);
    
    // Finally, delete the user
    await client.query('DELETE FROM users WHERE id = $1 AND organization_id = $2', [id, organizationId]);
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}