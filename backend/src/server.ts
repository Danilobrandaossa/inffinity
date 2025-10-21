import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './middleware/rate-limiter';

// Rotas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import vesselRoutes from './routes/vessel.routes';
import bookingRoutes from './routes/booking.routes';
import blockedDateRoutes from './routes/blocked-date.routes';
import auditLogRoutes from './routes/audit-log.routes';
import notificationRoutes from './routes/notification.routes';
import financialRoutes from './routes/financial.routes';
import autoNotificationRoutes from './routes/auto-notification.routes';
import adHocChargeRoutes from './routes/ad-hoc-charge.routes';
import weeklyBlockRoutes from './routes/weekly-block.routes';
import twoFactorRoutes from './routes/two-factor.routes';
import analyticsRoutes from './routes/analytics.routes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Middlewares de segurança
app.use(helmet());

// CORS - aceitar múltiplas origens para desenvolvimento
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.15.21:3000',
  config.frontendUrl
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
}));

// Rate limiting
app.use(rateLimiter);

// Parser de JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requisições
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/blocked-dates', blockedDateRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/auto-notifications', autoNotificationRoutes);
app.use('/api/ad-hoc-charges', adHocChargeRoutes);
app.use('/api/weekly-blocks', weeklyBlockRoutes);
app.use('/api/two-factor', twoFactorRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
    path: req.path,
  });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Servidor rodando na porta ${PORT}`);
  logger.info(`🌍 Ambiente: ${config.nodeEnv}`);
  logger.info(`🔗 Frontend: ${config.frontendUrl}`);
  logger.info(`📱 Acesso móvel: http://192.168.15.21:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido, encerrando servidor...');
  process.exit(0);
});

