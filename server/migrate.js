import { pool } from './src/config/database.js';
import fs from 'fs';
import path from 'path';

async function run() {
  const client = await pool.connect();
  try {
    // 1. Create migrations tracking table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 2. Deterministic Legacy Backfill (Checking each migration specifically)
    
    // Check 001: users table
    const check001 = await client.query("SELECT to_regclass('public.users') as regclass");
    if (check001.rows[0].regclass) {
      await client.query("INSERT INTO migrations (name) VALUES ('001_initial_schema.sql') ON CONFLICT (name) DO NOTHING");
    }

    // Check 002: users.status column
    const check002 = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='status'
    `);
    if (check002.rows.length > 0) {
      await client.query("INSERT INTO migrations (name) VALUES ('002_user_status.sql') ON CONFLICT (name) DO NOTHING");
    }

    // Check 003: users.last_login column
    const check003 = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='last_login'
    `);
    if (check003.rows.length > 0) {
      await client.query("INSERT INTO migrations (name) VALUES ('003_last_login.sql') ON CONFLICT (name) DO NOTHING");
    }

    // Check 004: auth_tokens table
    const check004 = await client.query("SELECT to_regclass('public.auth_tokens') as regclass");
    if (check004.rows[0].regclass) {
      await client.query("INSERT INTO migrations (name) VALUES ('004_auth_tokens.sql') ON CONFLICT (name) DO NOTHING");
    }

    // Check 005: organizations table
    const check005 = await client.query("SELECT to_regclass('public.organizations') as regclass");
    if (check005.rows[0].regclass) {
      await client.query("INSERT INTO migrations (name) VALUES ('005_multi_tenant.sql') ON CONFLICT (name) DO NOTHING");
    }

    // Check 006: auth_tokens.organization_id column
    const check006 = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='auth_tokens' AND column_name='organization_id'
    `);
    if (check006.rows.length > 0) {
      await client.query("INSERT INTO migrations (name) VALUES ('006_auth_tokens_org.sql') ON CONFLICT (name) DO NOTHING");
    }

    // 3. Read and sort migration files
    const migrationsDir = path.join(process.cwd(), 'src/db/migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    // 4. Execute pending migrations
    for (const file of files) {
      const isExecuted = await client.query('SELECT id FROM migrations WHERE name = $1', [file]);
      if (isExecuted.rows.length === 0) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
        await client.query('COMMIT');
        
        console.log(`Migration ${file} successful`);
      }
    }
    console.log('All migrations are up to date.');
  } catch(e) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', e);
    process.exitCode = 1;
  } finally {
    client.release();
    pool.end();
  }
}
run();
