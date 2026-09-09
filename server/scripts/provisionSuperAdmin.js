import bcrypt from 'bcrypt';
import { pool } from '../src/config/database.js';

const email = typeof process.env.SUPER_ADMIN_EMAIL === 'string'
  ? process.env.SUPER_ADMIN_EMAIL.trim().toLowerCase()
  : '';
const name = typeof process.env.SUPER_ADMIN_NAME === 'string'
  ? process.env.SUPER_ADMIN_NAME.trim()
  : '';
const password = typeof process.env.SUPER_ADMIN_PASSWORD === 'string'
  ? process.env.SUPER_ADMIN_PASSWORD
  : '';

async function provisionSuperAdmin() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['resource-booking-initial-super-admin']);

    const existingSuperAdmin = await client.query(
      "SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1"
    );

    if (existingSuperAdmin.rows.length > 0) {
      await client.query('COMMIT');
      console.log('Initial Super Admin already exists; no account changes made.');
      return;
    }

    if (!email || !name || !password) {
      throw new Error('SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME, and SUPER_ADMIN_PASSWORD must be set to create the initial Super Admin.');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('SUPER_ADMIN_EMAIL must be a valid email address.');
    }

    if (password.length < 8) {
      throw new Error('SUPER_ADMIN_PASSWORD must be at least 8 characters long.');
    }

    const existingUser = await client.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('The requested Super Admin email already belongs to another account.');
    }

    const organization = await client.query(
      "SELECT id FROM organizations WHERE slug = 'default' LIMIT 1"
    );

    if (organization.rows.length === 0) {
      throw new Error('The default organization is missing; no Super Admin was created.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await client.query(
      `INSERT INTO users (name, email, password_hash, role, organization_id)
       VALUES ($1, $2, $3, 'SUPER_ADMIN', $4)`,
      [name, email, passwordHash, organization.rows[0].id]
    );

    await client.query('COMMIT');
    console.log('Initial Super Admin created.');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

provisionSuperAdmin().catch((error) => {
  console.error(`Initial Super Admin provisioning failed: ${error.message}`);
  process.exitCode = 1;
});