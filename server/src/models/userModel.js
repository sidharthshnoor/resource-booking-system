import { pool } from '../config/database.js';

export async function findUsers({ search, role }) {
  const conditions = [];
  const values = [];
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
     ${whereClause} GROUP BY u.id ORDER BY u.created_at DESC, u.id DESC`,
    values
  );
  return result.rows;
}

export async function updateLastLogin(userId) {
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [userId]);
}

export async function updateUserStatus(id, status) {
  const result = await pool.query(
    'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, status, created_at, updated_at',
    [status, id]
  );
  return result.rows[0];
}