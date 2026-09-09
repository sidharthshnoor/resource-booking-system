import { pool } from './src/config/database.js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

async function run() {
  const client = await pool.connect();
  let inTransaction = false;
  try {
    // A database with application objects but no migration ledger cannot be
    // safely reconstructed from individual tables/columns.  In particular, a
    // partially applied multi-statement migration can look deceptively done.
    const ledgerExists = await client.query(
      "SELECT to_regclass('public.migrations') IS NOT NULL AS exists"
    );
    const applicationSchemaExists = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM pg_catalog.pg_tables
        WHERE schemaname = 'public'
          AND tablename IN ('users', 'resources', 'bookings', 'auth_tokens', 'organizations')
      ) AS exists
    `);

    if (!ledgerExists.rows[0].exists && applicationSchemaExists.rows[0].exists) {
      throw new Error(
        'Migration tracking is missing on a non-empty application database. ' +
        'Refusing to infer completed migrations from schema objects; establish ' +
        'a reviewed migration ledger before running this command.'
      );
    }

    // The ledger, not structural heuristics, is the source of truth.
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        checksum CHAR(64),
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await client.query('ALTER TABLE migrations ADD COLUMN IF NOT EXISTS checksum CHAR(64)');
    await client.query('SELECT pg_advisory_lock(hashtext($1))', ['resource-booking-system:migrations']);

    // Read and sort migration files.
    const migrationsDir = path.join(process.cwd(), 'src/db/migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    // Execute pending migrations.  SQL files must not manage transactions;
    // this makes applying the SQL and recording it one atomic operation on
    // the same PostgreSQL client.
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      const executed = await client.query('SELECT id, checksum FROM migrations WHERE name = $1', [file]);

      if (executed.rows.length > 0) {
        const recordedChecksum = executed.rows[0].checksum;
        if (recordedChecksum && recordedChecksum !== checksum) {
          throw new Error(`Migration file was modified after execution: ${file}`);
        }
      } else {
        console.log(`Running migration: ${file}`);
        await client.query('BEGIN');
        inTransaction = true;
        await client.query(sql);
        await client.query('INSERT INTO migrations (name, checksum) VALUES ($1, $2)', [file, checksum]);
        await client.query('COMMIT');
        inTransaction = false;
        
        console.log(`Migration ${file} successful`);
      }
    }
    console.log('All migrations are up to date.');
  } catch(e) {
    if (inTransaction) await client.query('ROLLBACK');
    console.error('Migration failed:', e);
    process.exitCode = 1;
  } finally {
    await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['resource-booking-system:migrations']).catch(() => {});
    client.release();
    pool.end();
  }
}
run();
