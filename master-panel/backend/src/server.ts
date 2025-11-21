import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { logger, morganStream } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';

// Importar rotas
import authRoutes from './routes/auth.routes';
import tenantsRoutes from './routes/tenants.routes';
import dashboardRoutes from './routes/dashboard.routes';
import integrationRoutes from './routes/integration.routes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests por IP
  message: {
    success: false,
    error: 'Muitas tentativas. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requisições HTTP
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    service: 'ReservaPro Master Panel API'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/integration', integrationRoutes);

// Middleware de erro 404
app.use(notFoundHandler);

// Middleware de tratamento de erros
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  logger.info(`🚀 Master Panel API rodando na porta ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Health Check: http://localhost:${PORT}/health`);
  logger.info(`📊 API Docs: http://localhost:${PORT}/api/docs`);
});

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  logger.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promise rejeitada não tratada:', { reason, promise });
  process.exit(1);
});

export default app;



