import 'dotenv/config';

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT || 5000)
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL must be set');
}

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET must be set');
}
