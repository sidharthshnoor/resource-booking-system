import { pool } from './src/config/database.js';
import bcrypt from 'bcrypt';

async function replaceAdmins() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Verify organizations
    const orgRes = await client.query(`SELECT id, name FROM organizations WHERE name IN ('XYZ Company', 'ABC College');`);
    const xyzOrg = orgRes.rows.find(o => o.name === 'XYZ Company');
    const abcOrg = orgRes.rows.find(o => o.name === 'ABC College');

    if (!xyzOrg || !abcOrg) {
      throw new Error('Could not find both XYZ Company and ABC College organizations.');
    }

    // 2. Verify existing admins
    const adminRes = await client.query(`
      SELECT u.id as user_id, u.name, u.email, o.id as org_id, o.name as org_name, u.role
      FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE o.name IN ('XYZ Company', 'ABC College') AND u.role = 'ADMIN';
    `);

    const xyzAdmins = adminRes.rows.filter(u => u.org_id === xyzOrg.id);
    const abcAdmins = adminRes.rows.filter(u => u.org_id === abcOrg.id);

    if (xyzAdmins.length !== 1 || abcAdmins.length !== 1) {
      throw new Error(`Expected exactly 1 admin per organization. Found XYZ: ${xyzAdmins.length}, ABC: ${abcAdmins.length}`);
    }

    // 3. Delete existing Admins
    // Delete auth tokens
    await client.query(`DELETE FROM auth_tokens WHERE user_id IN ($1, $2)`, [xyzAdmins[0].user_id, abcAdmins[0].user_id]);
    // Delete bookings
    await client.query(`DELETE FROM bookings WHERE user_id IN ($1, $2)`, [xyzAdmins[0].user_id, abcAdmins[0].user_id]);
    // Delete users
    await client.query(`DELETE FROM users WHERE id IN ($1, $2)`, [xyzAdmins[0].user_id, abcAdmins[0].user_id]);

    // 4. Create Replacement Admins
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    await client.query(`
      INSERT INTO users (name, email, password_hash, role, organization_id, status)
      VALUES 
      ($1, $2, $3, 'ADMIN', $4, 'ACTIVE'),
      ($5, $6, $7, 'ADMIN', $8, 'ACTIVE')
    `, [
      'XYZ Administrator', 'admin@xyz.com', hashedPassword, xyzOrg.id,
      'ABC Administrator', 'admin@abc.com', hashedPassword, abcOrg.id
    ]);

    // 5. Verify the new accounts
    const verifyRes = await client.query(`
      SELECT u.email, u.role, o.name as organization
      FROM users u
      JOIN organizations o ON u.organization_id = o.id
      WHERE u.email IN ('admin@xyz.com', 'admin@abc.com') AND u.role = 'ADMIN';
    `);

    if (verifyRes.rows.length !== 2) {
      throw new Error(`Failed to verify new accounts. Found ${verifyRes.rows.length} accounts.`);
    }

    console.log("SUCCESS! Created following accounts:");
    console.log(verifyRes.rows);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("TRANSACTION FAILED & ROLLED BACK:", error);
  } finally {
    client.release();
    pool.end();
  }
}

replaceAdmins();
