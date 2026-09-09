import app from './app.js';
import { env } from './config/env.js';
import { pool, verifyDatabaseConnection } from './config/database.js';
import { verifyEmailConfiguration } from './utils/email.js';

try {
  await verifyDatabaseConnection();
  console.log('PostgreSQL connection verified');

  verifyEmailConfiguration();

  const server = app.listen(env.port, () => {
    console.log(`Resource Booking API listening on port ${env.port}`);
  });

  function shutdown() {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  console.error('Unable to connect to PostgreSQL:', error.message);
  await pool.end();
  process.exit(1);
}
