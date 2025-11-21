import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export class MasterTenantsController {
  async getTenants(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, status, search, planId } = req.query;
      const masterUserId = req.user?.id;

      const skip = (Number(page) - 1) * Number(limit);

      // Construir filtros
      const where: any = {};
      
      if (status) {
        where.status = status;
      }
      
      if (planId) {
        where.planId = planId;
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
          { slug: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [tenants, total] = await Promise.all([
        prisma.tenant.findMany({
          where,
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                type: true,
                price: true
              }
            },
            users: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
              }
            },
            _count: {
              select: {
                users: true,
                metrics: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit)
        }),
        prisma.tenant.count({ where })
      ]);

      res.json({
        success: true,
        data: tenants,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Erro ao buscar tenants:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getTenantById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const masterUserId = req.user?.id;

      const tenant = await prisma.tenant.findUnique({
        where: { id },
        include: {
          plan: true,
          users: {
            orderBy: { createdAt: 'desc' }
          },
          metrics: {
            orderBy: { date: 'desc' },
            take: 30
          },
          auditLogs: {
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
              masterUser: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      if (!tenant) {
        throw new AppError(404, 'Tenant não encontrado');
      }

      res.json({
        success: true,
        data: tenant
      });
    } catch (error) {
      logger.error('Erro ao buscar tenant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async createTenant(req: Request, res: Response) {
    try {
      const tenantData = req.body;
      const masterUserId = req.user?.id;

      // Gerar schema name único
      const schemaName = `tenant_${tenantData.slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      const tenant = await prisma.tenant.create({
        data: {
          ...tenantData,
          schemaName,
          status: 'TRIAL',
          trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
        },
        include: {
          plan: true
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          tenantId: tenant.id,
          action: 'TENANT_CREATED',
          entityType: 'Tenant',
          entityId: tenant.id,
          details: {
            tenantName: tenant.name,
            slug: tenant.slug,
            plan: tenant.plan?.name
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.status(201).json({
        success: true,
        data: tenant,
        message: 'Tenant criado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao criar tenant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async updateTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const masterUserId = req.user?.id;

      const tenant = await prisma.tenant.update({
        where: { id },
        data: updateData,
        include: {
          plan: true
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          tenantId: tenant.id,
          action: 'TENANT_UPDATED',
          entityType: 'Tenant',
          entityId: tenant.id,
          details: {
            tenantName: tenant.name,
            changes: updateData
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: tenant,
        message: 'Tenant atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar tenant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async deleteTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const masterUserId = req.user?.id;

      const tenant = await prisma.tenant.findUnique({
        where: { id }
      });

      if (!tenant) {
        throw new AppError(404, 'Tenant não encontrado');
      }

      await prisma.tenant.delete({
        where: { id }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: 'TENANT_DELETED',
          entityType: 'Tenant',
          entityId: id,
          details: {
            tenantName: tenant.name,
            slug: tenant.slug
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Tenant excluído com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao excluir tenant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async suspendTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const masterUserId = req.user?.id;

      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          status: 'SUSPENDED',
          settings: {
            suspensionReason: reason,
            suspendedAt: new Date().toISOString()
          }
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          tenantId: tenant.id,
          action: 'TENANT_SUSPENDED',
          entityType: 'Tenant',
          entityId: tenant.id,
          details: {
            tenantName: tenant.name,
            reason
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: tenant,
        message: 'Tenant suspenso com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao suspender tenant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async activateTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const masterUserId = req.user?.id;

      const tenant = await prisma.tenant.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          settings: {
            suspensionReason: null,
            suspendedAt: null
          }
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          tenantId: tenant.id,
          action: 'TENANT_ACTIVATED',
          entityType: 'Tenant',
          entityId: tenant.id,
          details: {
            tenantName: tenant.name
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: tenant,
        message: 'Tenant ativado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao ativar tenant:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async impersonateTenant(req: Request, res: Response) {
    try {
      const { tenantId } = req.params;
      const { targetUserId } = req.body;
      const masterUserId = req.user?.id;

      // Verificar se o usuário tem permissão para impersonate
      const masterUser = await prisma.masterUser.findUnique({
        where: { id: masterUserId }
      });

      if (!masterUser || !['MASTER_OWNER', 'MASTER_SUPPORT'].includes(masterUser.role)) {
        throw new AppError(403, 'Sem permissão para impersonate');
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId }
      });

      if (!tenant) {
        throw new AppError(404, 'Tenant não encontrado');
      }

      // Criar sessão de impersonate
      const impersonation = await prisma.impersonation.create({
        data: {
          masterUserId,
          tenantId,
          targetUserId,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      // Gerar token de impersonate
      const impersonateToken = jwt.sign(
        {
          masterUserId,
          tenantId,
          targetUserId,
          impersonationId: impersonation.id,
          type: 'impersonate'
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          tenantId,
          action: 'IMPERSONATE_STARTED',
          entityType: 'Impersonation',
          entityId: impersonation.id,
          details: {
            tenantName: tenant.name,
            targetUserId
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: {
          impersonateToken,
          tenant: {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            domain: tenant.domain
          }
        },
        message: 'Impersonate iniciado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao iniciar impersonate:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async stopImpersonate(req: Request, res: Response) {
    try {
      const { impersonationId } = req.params;
      const masterUserId = req.user?.id;

      const impersonation = await prisma.impersonation.findUnique({
        where: { id: impersonationId },
        include: {
          tenant: true
        }
      });

      if (!impersonation || impersonation.masterUserId !== masterUserId) {
        throw new AppError(404, 'Impersonate não encontrado');
      }

      // Finalizar impersonate
      await prisma.impersonation.update({
        where: { id: impersonationId },
        data: {
          endedAt: new Date()
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          tenantId: impersonation.tenantId,
          action: 'IMPERSONATE_ENDED',
          entityType: 'Impersonation',
          entityId: impersonationId,
          details: {
            tenantName: impersonation.tenant.name,
            duration: Date.now() - impersonation.startedAt.getTime()
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Impersonate finalizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao finalizar impersonate:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }
}








