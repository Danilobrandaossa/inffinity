import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from './error-handler';
import { logger } from '../utils/logger';

// Rate limiting mais rigoroso por usuário
export const userRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests por janela
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Key generator baseado no IP e User-Agent
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    return `${ip}-${userAgent}`;
  },
  // Handler customizado para logging
  handler: (req: Request, res: Response) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: 'Muitas requisições. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000)
    });
  }
});

// Rate limiting específico para login (mais restritivo)
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas de login por IP
  message: {
    success: false,
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Não contar logins bem-sucedidos
  keyGenerator: (req: Request) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `login-${ip}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Login rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      email: req.body?.email || 'unknown',
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      retryAfter: 900
    });
  }
});

// Rate limiting para APIs sensíveis (admin, financial, etc.)
export const sensitiveRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // 20 requests por 5 minutos
  message: {
    success: false,
    error: 'Muitas requisições em área sensível. Tente novamente em alguns minutos.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).user?.userId || 'anonymous';
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `sensitive-${userId}-${ip}`;
  },
  handler: (req: Request, res: Response) => {
    logger.warn('Sensitive API rate limit exceeded', {
      ip: req.ip,
      userId: (req as any).user?.userId || 'anonymous',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: 'Muitas requisições em área sensível. Tente novamente em alguns minutos.',
      retryAfter: 300
    });
  }
});

// Rate limiting global para prevenir DDoS
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests por minuto
  message: {
    success: false,
    error: 'Sistema sobrecarregado. Tente novamente em alguns segundos.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (req: Request, res: Response) => {
    logger.error('Global rate limit exceeded - possible DDoS', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      success: false,
      error: 'Sistema sobrecarregado. Tente novamente em alguns segundos.',
      retryAfter: 60
    });
  }
});

// Middleware para validação de IP (whitelist/blacklist)
export const ipValidation = (req: Request, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  const blockedCountries = process.env.BLOCKED_COUNTRIES?.split(',') || [];
  
  // Em desenvolvimento, permitir todos os IPs
  if (process.env.NODE_ENV === 'development') {
    return next();
  }
  
  // Verificar IPs bloqueados (implementação básica)
  if (blockedCountries.length > 0) {
    // Aqui você pode integrar com um serviço de geolocalização
    // Por enquanto, apenas log
    logger.info('IP validation check', {
      ip: clientIp,
      allowedIPs,
      blockedCountries,
      timestamp: new Date().toISOString()
    });
  }
  
  // Se há IPs permitidos definidos, verificar
  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIp)) {
    logger.warn('IP not in whitelist', {
      ip: clientIp,
      allowedIPs,
      timestamp: new Date().toISOString()
    });
    
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: IP não autorizado'
    });
  }
  
  next();
};

// Middleware para sanitização de entrada
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitizar strings para prevenir XSS
  const sanitizeString = (str: string): string => {
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  };
  
  // Sanitizar body
  if (req.body && typeof req.body === 'object') {
    const sanitizeObject = (obj: any): any => {
      if (typeof obj === 'string') {
        return sanitizeString(obj);
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      if (obj && typeof obj === 'object') {
        const sanitized: any = {};
        for (const key in obj) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
        return sanitized;
      }
      return obj;
    };
    
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitizar query parameters
  if (req.query && typeof req.query === 'object') {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    }
  }
  
  next();
};

// Middleware para logging de segurança
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log da requisição
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Interceptar resposta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    // Log da resposta
    logger.info('Response sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
    
    // Log de erros de segurança
    if (res.statusCode >= 400) {
      logger.warn('Security event', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};





