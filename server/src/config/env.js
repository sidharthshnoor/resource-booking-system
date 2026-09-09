import 'dotenv/config';

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT || 5000),
  email: {
    apiKey: process.env.RESEND_API_KEY,
    from: process.env.EMAIL_FROM || 'onboarding@resend.dev'
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};

if (!env.databaseUrl) {
  throw new Error('DATABASE_URL must be set');
}

if (!env.jwtSecret) {
  throw new Error('JWT_SECRET must be set');
}
