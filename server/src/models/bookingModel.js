import { pool } from '../config/database.js';

const bookingFields = `
  b.id, b.user_id, b.resource_id, b.start_time, b.end_time, b.purpose,
  b.status, b.created_at, b.updated_at,
  r.name AS resource_name, r.type AS resource_type, r.location AS resource_location
`;

export async function findBookingsByUserId(userId) {
  const result = await pool.query(
    `SELECT ${bookingFields}
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     WHERE b.user_id = $1
     ORDER BY b.start_time ASC, b.id ASC`,
    [userId]
  );
  return result.rows;
}

export async function findAllBookings(status) {
  const values = [];
  const condition = status ? 'WHERE b.status = $1::booking_status' : '';
  if (status) values.push(status);

  const result = await pool.query(
    `SELECT ${bookingFields}, u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     JOIN users u ON u.id = b.user_id
     ${condition}
     ORDER BY b.start_time ASC, b.id ASC`,
    values
  );
  return result.rows;
}

export async function findBookingById(id) {
  const result = await pool.query(
    `SELECT ${bookingFields}
     FROM bookings b
     JOIN resources r ON r.id = b.resource_id
     WHERE b.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function findActiveResourceById(resourceId) {
  const result = await pool.query(
    'SELECT id, status FROM resources WHERE id = $1',
    [resourceId]
  );
  return result.rows[0] || null;
}

export async function createBooking({ userId, resourceId, startTime, endTime, purpose }) {
  const result = await pool.query(
    `INSERT INTO bookings (user_id, resource_id, start_time, end_time, purpose)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, resource_id, start_time, end_time, purpose, status, created_at, updated_at`,
    [userId, resourceId, startTime, endTime, purpose]
  );
  return result.rows[0];
}

export async function cancelBooking(id, userId) {
  const result = await pool.query(
    `UPDATE bookings
     SET status = 'CANCELLED'
    WHERE id = $1 AND user_id = $2 AND status IN ('PENDING', 'APPROVED')
     RETURNING id, user_id, resource_id, start_time, end_time, purpose, status, created_at, updated_at`,
    [id, userId]
  );
  return result.rows[0] || null;
}

export async function updateBookingStatus(id, status) {
  const result = await pool.query(
    `UPDATE bookings
     SET status = $2::booking_status
     WHERE id = $1 AND status = 'PENDING'
     RETURNING id, user_id, resource_id, start_time, end_time, purpose, status, created_at, updated_at`,
    [id, status]
  );
  return result.rows[0] || null;
}
