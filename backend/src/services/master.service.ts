import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class MasterService {
  // ===== GESTÃO DE EMPRESAS =====

  async getCompanies(options: {
    page: number;
    limit: number;
    status?: string;
    search?: string;
  }) {
    const { page, limit, status, search } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        plan: true,
        _count: {
          select: {
            users: true,
            settings: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return companies;
  }

  async getCompanyById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        plan: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true
          }
        },
        settings: true
      }
    });

    return company;
  }

  async createCompany(companyData: any, masterUserId: string) {
    // Verificar se slug já existe
    const existingCompany = await prisma.company.findUnique({
      where: { slug: companyData.slug }
    });

    if (existingCompany) {
      throw new AppError(400, 'Slug já está em uso');
    }

    // Verificar se domínio já existe
    if (companyData.domain) {
      const existingDomain = await prisma.company.findUnique({
        where: { domain: companyData.domain }
      });

      if (existingDomain) {
        throw new AppError(400, 'Domínio já está em uso');
      }
    }

    const company = await prisma.company.create({
      data: {
        ...companyData,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'COMPANY_CREATED', 'Company', company.id, {
      companyName: company.name,
      slug: company.slug
    });

    return company;
  }

  async updateCompany(id: string, updateData: any, masterUserId: string) {
    const existingCompany = await prisma.company.findUnique({
      where: { id }
    });

    if (!existingCompany) {
      throw new AppError(404, 'Empresa não encontrada');
    }

    // Verificar conflitos de slug/domínio
    if (updateData.slug && updateData.slug !== existingCompany.slug) {
      const slugExists = await prisma.company.findUnique({
        where: { slug: updateData.slug }
      });

      if (slugExists) {
        throw new AppError(400, 'Slug já está em uso');
      }
    }

    if (updateData.domain && updateData.domain !== existingCompany.domain) {
      const domainExists = await prisma.company.findUnique({
        where: { domain: updateData.domain }
      });

      if (domainExists) {
        throw new AppError(400, 'Domínio já está em uso');
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        plan: true
      }
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'COMPANY_UPDATED', 'Company', company.id, {
      companyName: company.name,
      changes: updateData
    });

    return company;
  }

  async deleteCompany(id: string, masterUserId: string) {
    const company = await prisma.company.findUnique({
      where: { id }
    });

    if (!company) {
      throw new AppError(404, 'Empresa não encontrada');
    }

    await prisma.company.delete({
      where: { id }
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'COMPANY_DELETED', 'Company', id, {
      companyName: company.name
    });
  }

  async suspendCompany(id: string, reason: string, masterUserId: string) {
    const company = await prisma.company.update({
      where: { id },
      data: { 
        status: 'SUSPENDED',
        settings: {
          suspensionReason: reason,
          suspendedAt: new Date().toISOString()
        }
      },
      include: {
        plan: true
      }
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'COMPANY_SUSPENDED', 'Company', id, {
      companyName: company.name,
      reason
    });

    return company;
  }

  async activateCompany(id: string, masterUserId: string) {
    const company = await prisma.company.update({
      where: { id },
      data: { 
        status: 'ACTIVE',
        settings: {
          suspensionReason: null,
          suspendedAt: null
        }
      },
      include: {
        plan: true
      }
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'COMPANY_ACTIVATED', 'Company', id, {
      companyName: company.name
    });

    return company;
  }

  // ===== CONFIGURAÇÕES CENTRALIZADAS =====

  async getCompanySettings(companyId: string, category?: string) {
    const where: any = { companyId };
    
    if (category) {
      where.category = category;
    }

    const settings = await prisma.companySetting.findMany({
      where,
      orderBy: { category: 'asc' }
    });

    return settings;
  }

  async updateCompanySettings(
    companyId: string, 
    category: string, 
    settings: any, 
    masterUserId: string
  ) {
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) {
      throw new AppError(404, 'Empresa não encontrada');
    }

    const updatedSettings = [];

    for (const [key, value] of Object.entries(settings)) {
      const setting = await prisma.companySetting.upsert({
        where: {
          companyId_category_key: {
            companyId,
            category,
            key
          }
        },
        update: {
          value,
          isMasterOverride: true,
          updatedAt: new Date()
        },
        create: {
          companyId,
          category,
          key,
          value,
          isMasterOverride: true
        }
      });

      updatedSettings.push(setting);
    }

    // Log da ação
    await this.logMasterAction(masterUserId, 'COMPANY_SETTINGS_UPDATED', 'Company', companyId, {
      companyName: company.name,
      category,
      settings
    });

    return updatedSettings;
  }

  // ===== WHITELABEL =====

  async updateWhitelabelConfig(
    companyId: string, 
    whitelabelConfig: any, 
    masterUserId: string
  ) {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        whitelabelConfig
      },
      include: {
        plan: true
      }
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'WHITELABEL_UPDATED', 'Company', companyId, {
      companyName: company.name,
      whitelabelConfig
    });

    return company;
  }

  // ===== AUDITORIA E RELATÓRIOS =====

  async getAuditLogs(options: {
    page: number;
    limit: number;
    companyId?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { page, limit, companyId, action, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const logs = await prisma.masterAuditLog.findMany({
      where,
      include: {
        masterUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });

    return logs;
  }

  async getDashboardStats() {
    const [
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      totalUsers,
      totalPlans,
      recentActivity
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: 'ACTIVE' } }),
      prisma.company.count({ where: { status: 'SUSPENDED' } }),
      prisma.user.count({ where: { role: { not: 'MASTER' } } }),
      prisma.plan.count(),
      prisma.masterAuditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          masterUser: {
            select: { name: true }
          },
          company: {
            select: { name: true }
          }
        }
      })
    ]);

    return {
      companies: {
        total: totalCompanies,
        active: activeCompanies,
        suspended: suspendedCompanies
      },
      users: {
        total: totalUsers
      },
      plans: {
        total: totalPlans
      },
      recentActivity
    };
  }

  // ===== GESTÃO DE PLANOS =====

  async getPlans() {
    const plans = await prisma.plan.findMany({
      include: {
        _count: {
          select: {
            companies: true
          }
        }
      },
      orderBy: { price: 'asc' }
    });

    return plans;
  }

  async createPlan(planData: any, masterUserId: string) {
    const plan = await prisma.plan.create({
      data: planData
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'PLAN_CREATED', 'Plan', plan.id, {
      planName: plan.name
    });

    return plan;
  }

  async updatePlan(id: string, planData: any, masterUserId: string) {
    const plan = await prisma.plan.update({
      where: { id },
      data: planData
    });

    // Log da ação
    await this.logMasterAction(masterUserId, 'PLAN_UPDATED', 'Plan', id, {
      planName: plan.name,
      changes: planData
    });

    return plan;
  }

  // ===== UTILITÁRIOS =====

  private async logMasterAction(
    masterUserId: string,
    action: string,
    entityType: string,
    entityId: string,
    details: any
  ) {
    try {
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action,
          entityType,
          entityId,
          details
        }
      });
    } catch (error) {
      logger.error('Erro ao registrar log de auditoria:', error);
      // Não falhar a operação principal por causa do log
    }
  }
}








