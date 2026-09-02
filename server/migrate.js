import { pool } from './src/config/database.js';
import fs from 'fs';
import path from 'path';

async function run() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), 'src/db/migrations/003_last_login.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Migration successful');
  } catch(e) {
    if (e.message.includes('already exists')) {
      console.log('Migration already applied');
    } else {
      console.error('Migration failed:', e);
    }
  } finally {
    pool.end();
  }
}
run();
