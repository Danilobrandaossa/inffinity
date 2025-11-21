import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import mainSystemService from '../services/main-system.service';

const prisma = new PrismaClient();

export class MasterDashboardController {
  async getDashboardStats(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;

      // Obter estatísticas do Master Panel
      const masterStats = await this.getMasterStats();
      
      // Obter estatísticas do sistema principal
      let mainSystemStats = null;
      try {
        mainSystemStats = await mainSystemService.getSystemStats();
      } catch (error) {
        logger.warn('Sistema principal não disponível:', error);
      }

      // Combinar estatísticas
      const combinedStats = {
        master: masterStats,
        mainSystem: mainSystemStats,
        timestamp: new Date().toISOString()
      };

      res.json({
        success: true,
        data: combinedStats
      });
    } catch (error) {
      logger.error('Erro ao obter estatísticas do dashboard:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getSystemOverview(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;

      // Obter visão geral dos sistemas
      const overview = await Promise.allSettled([
        this.getMasterOverview(),
        this.getMainSystemOverview()
      ]);

      const [masterOverview, mainSystemOverview] = overview;

      res.json({
        success: true,
        data: {
          master: masterOverview.status === 'fulfilled' ? masterOverview.value : null,
          mainSystem: mainSystemOverview.status === 'fulfilled' ? mainSystemOverview.value : null,
          systemsStatus: {
            master: masterOverview.status === 'fulfilled',
            mainSystem: mainSystemOverview.status === 'fulfilled'
          }
        }
      });
    } catch (error) {
      logger.error('Erro ao obter visão geral:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getRecentActivity(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { limit = 50 } = req.query;

      // Obter atividades recentes do Master Panel
      const masterActivity = await prisma.masterAuditLog.findMany({
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          masterUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      });

      // Obter atividades recentes do sistema principal
      let mainSystemActivity = [];
      try {
        const mainActivity = await mainSystemService.getAuditLogs({ limit });
        mainSystemActivity = mainActivity.data || [];
      } catch (error) {
        logger.warn('Não foi possível obter atividades do sistema principal:', error);
      }

      // Combinar e ordenar atividades
      const allActivities = [
        ...masterActivity.map(activity => ({
          ...activity,
          source: 'master',
          timestamp: activity.createdAt
        })),
        ...mainSystemActivity.map(activity => ({
          ...activity,
          source: 'mainSystem',
          timestamp: new Date(activity.createdAt)
        }))
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
       .slice(0, Number(limit));

      res.json({
        success: true,
        data: allActivities
      });
    } catch (error) {
      logger.error('Erro ao obter atividades recentes:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getSystemHealth(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;

      // Verificar saúde do Master Panel
      const masterHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          database: await this.checkDatabaseHealth(),
          api: 'healthy'
        }
      };

      // Verificar saúde do sistema principal
      let mainSystemHealth = null;
      try {
        mainSystemHealth = await mainSystemService.healthCheck();
      } catch (error) {
        mainSystemHealth = {
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }

      res.json({
        success: true,
        data: {
          master: masterHealth,
          mainSystem: mainSystemHealth,
          overall: mainSystemHealth?.status === 'healthy' ? 'healthy' : 'degraded'
        }
      });
    } catch (error) {
      logger.error('Erro ao verificar saúde dos sistemas:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  // Métodos auxiliares
  private async getMasterStats() {
    const [
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalMasterUsers,
      totalAuditLogs
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: 'ACTIVE' } }),
      prisma.tenant.count({ where: { status: 'SUSPENDED' } }),
      prisma.masterUser.count({ where: { isActive: true } }),
      prisma.masterAuditLog.count()
    ]);

    return {
      totalTenants,
      activeTenants,
      suspendedTenants,
      totalMasterUsers,
      totalAuditLogs,
      tenantStatusDistribution: {
        active: activeTenants,
        suspended: suspendedTenants,
        pending: totalTenants - activeTenants - suspendedTenants
      }
    };
  }

  private async getMasterOverview() {
    const tenants = await prisma.tenant.findMany({
      include: {
        plan: true,
        _count: {
          select: {
            users: true,
            metrics: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      recentTenants: tenants,
      totalTenants: await prisma.tenant.count(),
      activeTenants: await prisma.tenant.count({ where: { status: 'ACTIVE' } })
    };
  }

  private async getMainSystemOverview() {
    try {
      const [users, vessels, bookings] = await Promise.all([
        mainSystemService.getUsers(),
        mainSystemService.getVessels(),
        mainSystemService.getBookings()
      ]);

      return {
        totalUsers: users.data?.length || 0,
        totalVessels: vessels.data?.length || 0,
        totalBookings: bookings.data?.length || 0,
        recentUsers: users.data?.slice(0, 5) || [],
        recentVessels: vessels.data?.slice(0, 5) || [],
        recentBookings: bookings.data?.slice(0, 5) || []
      };
    } catch (error) {
      throw error;
    }
  }

  private async checkDatabaseHealth() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return 'healthy';
    } catch (error) {
      return 'unhealthy';
    }
  }
}





