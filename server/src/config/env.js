import 'dotenv/config';

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT || 5000),
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@resourcebooking.com'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL must be set');
}

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET must be set');
}
