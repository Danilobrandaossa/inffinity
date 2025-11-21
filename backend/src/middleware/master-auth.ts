import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from './error-handler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        type?: string;
        tenantId?: string;
        impersonationId?: string;
      };
    }
  }
}

export const authenticateMaster = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Token de acesso necessário');
    }

    const token = authHeader.substring(7);

    // Verificar se é token de impersonate
    if (token.includes('impersonate')) {
      return authenticateImpersonate(req, res, next, token);
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Verificar se a sessão existe e é válida
    const session = await prisma.masterSession.findFirst({
      where: {
        token,
        masterUserId: decoded.masterUserId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        masterUser: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true
          }
        }
      }
    });

    if (!session || !session.masterUser.isActive) {
      throw new AppError(401, 'Sessão inválida ou expirada');
    }

    // Adicionar usuário ao request
    req.user = {
      id: session.masterUser.id,
      email: session.masterUser.email,
      role: session.masterUser.role,
      type: 'master'
    };

    next();
  } catch (error) {
    logger.error('Erro na autenticação master:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(401, 'Token inválido');
  }
};

export const authenticateImpersonate = async (req: Request, res: Response, next: NextFunction, token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.type !== 'impersonate') {
      throw new AppError(401, 'Token de impersonate inválido');
    }

    // Verificar se o impersonate ainda está ativo
    const impersonation = await prisma.impersonation.findUnique({
      where: {
        id: decoded.impersonationId
      },
      include: {
        masterUser: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true
          }
        },
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true
          }
        }
      }
    });

    if (!impersonation || impersonation.endedAt) {
      throw new AppError(401, 'Impersonate não encontrado ou finalizado');
    }

    if (!impersonation.masterUser.isActive) {
      throw new AppError(401, 'Usuário master inativo');
    }

    if (impersonation.tenant.status === 'SUSPENDED') {
      throw new AppError(403, 'Tenant suspenso');
    }

    // Adicionar usuário ao request
    req.user = {
      id: impersonation.masterUser.id,
      email: impersonation.masterUser.email,
      role: impersonation.masterUser.role,
      type: 'impersonate',
      tenantId: impersonation.tenantId,
      impersonationId: impersonation.id
    };

    next();
  } catch (error) {
    logger.error('Erro na autenticação de impersonate:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(401, 'Token de impersonate inválido');
  }
};

export const requireMasterRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, 'Não autenticado');
    }

    if (req.user.type !== 'master') {
      throw new AppError(403, 'Acesso apenas para usuários master');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(403, 'Sem permissão para acessar este recurso');
    }

    next();
  };
};

export const requireImpersonatePermission = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError(401, 'Não autenticado');
  }

  if (req.user.type !== 'master') {
    throw new AppError(403, 'Acesso apenas para usuários master');
  }

  if (!['MASTER_OWNER', 'MASTER_SUPPORT'].includes(req.user.role)) {
    throw new AppError(403, 'Sem permissão para impersonate');
  }

  next();
};

export const requireTenantContext = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    throw new AppError(401, 'Não autenticado');
  }

  if (req.user.type === 'impersonate' && !req.user.tenantId) {
    throw new AppError(400, 'Contexto de tenant necessário');
  }

  next();
};








