import dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.PORT || '3001', 10);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const apiBaseUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port,
  apiBaseUrl,
  frontendUrl,
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Booking Rules
  booking: {
    minAdvanceHours: 24,
    defaultMaxActiveBookings: 2,
  },

  // Jobs & schedulers
  jobs: {
    subscriptionBilling: {
      enabled: process.env.SUBSCRIPTION_BILLING_ENABLED !== 'false',
      cron: process.env.SUBSCRIPTION_BILLING_CRON || '0 * * * *',
      timezone: process.env.SUBSCRIPTION_BILLING_TZ || 'America/Sao_Paulo',
    },
  },
} as const;

export default config;



