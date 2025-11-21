import winston from 'winston';
import path from 'path';

// Configurar formato do log
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Configurar transportes
const transports: winston.transport[] = [
  // Console para desenvolvimento
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

// Adicionar arquivo de log em produção
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      format: logFormat
    }),
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      format: logFormat
    })
  );
}

// Criar logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Não sair do processo em caso de erro
  exitOnError: false
});

// Adicionar stream para Morgan (HTTP logging)
export const morganStream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};








