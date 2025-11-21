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
import subscriptionPlanRoutes from './routes/subscription-plan.routes';
import subscriptionRoutes from './routes/subscription.routes';
import systemSettingsRoutes from './routes/system-settings.routes';
import { initSubscriptionBillingJob } from './jobs/subscription-billing.job';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Permitir uso correto de IPs quando atrás de proxies (ngrok, load balancer)
app.set('trust proxy', true);

// Middlewares de segurança avançados
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configurado para produção
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:3010',
  'http://localhost:3013',
  config.frontendUrl
];

app.use(cors({
  origin: (origin, callback) => {
    // Em desenvolvimento, permitir requisições sem origin
    if (config.nodeEnv === 'development' && !origin) {
      return callback(null, true);
    }
    
    // Em produção, verificar se a requisição vem através do proxy confiável
    // Quando o Nginx faz proxy, pode não passar o Origin, mas podemos verificar
    // se vem do domínio correto através do Host ou X-Forwarded-Proto
    if (config.nodeEnv === 'production' && !origin) {
      // Permitir se não houver origin mas estiver vindo através do proxy
      // O Nginx pode não estar passando o Origin corretamente
      logger.warn('Request without Origin header in production', {
        note: 'Allowing through trusted proxy'
      });
      return callback(null, true);
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked origin', { origin, allowedOrigins });
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
app.use(rateLimiter);

// Parser de JSON com limites de segurança
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar se é JSON válido
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

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
app.use('/api/subscription-plans', subscriptionPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/system-settings', systemSettingsRoutes);

// Health check endpoint com informações de segurança
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    version: process.env.VITE_APP_VERSION || '1.0.0',
    security: {
      helmet: true,
      cors: true,
      rateLimit: true,
      sanitization: true
    }
  });
});

// Endpoint de métricas para monitoramento
app.get('/metrics', (_req, res) => {
  res.status(200).json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
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
  initSubscriptionBillingJob();
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

