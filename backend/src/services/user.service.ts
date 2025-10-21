import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { UserRole } from '@prisma/client';
import { FinancialService } from './financial.service';

export class UserService {
  private financialService = new FinancialService();
  async create(data: {
    email: string;
    password?: string;
    cpf?: string; // CPF será usado como senha se fornecido
    name: string;
    phone?: string;
    role?: UserRole;
    vesselIds?: string[];
    // Campos adicionais
    birthDate?: string;
    licenseType?: string;
    registrationNumber?: string;
    licenseExpiry?: string;
    billingDueDay?: number;
    // Dados de endereço
    address?: string;
    zipCode?: string;
    addressNumber?: string;
    state?: string;
    neighborhood?: string;
    city?: string;
    complement?: string;
  }, createdBy: string) {
    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(409, 'Email já está em uso');
    }

    // Se CPF for fornecido, usar como senha. Senão, usar senha fornecida
    const passwordToUse = data.cpf || data.password || '123456'; // fallback para senha padrão
    const hashedPassword = await bcrypt.hash(passwordToUse, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role || UserRole.USER,
        // Campos adicionais
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        licenseType: data.licenseType,
        registrationNumber: data.registrationNumber,
        licenseExpiry: data.licenseExpiry ? new Date(data.licenseExpiry) : null,
        billingDueDay: data.billingDueDay,
        // Dados de endereço
        address: data.address,
        zipCode: data.zipCode,
        addressNumber: data.addressNumber,
        state: data.state,
        neighborhood: data.neighborhood,
        city: data.city,
        complement: data.complement,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Vincular embarcações com dados financeiros
    if (data.vesselFinancials && data.vesselFinancials.length > 0) {
      for (const vesselFinancial of data.vesselFinancials) {
        // Criar ou atualizar UserVessel com dados financeiros
        const userVessel = await prisma.userVessel.upsert({
          where: {
            userId_vesselId: {
              userId: user.id,
              vesselId: vesselFinancial.vesselId,
            },
          },
          update: {
            totalValue: vesselFinancial.totalValue || 0,
            downPayment: vesselFinancial.downPayment || 0,
            remainingAmount: (vesselFinancial.totalValue || 0) - (vesselFinancial.downPayment || 0),
            totalInstallments: vesselFinancial.totalInstallments || 0,
            marinaMonthlyFee: vesselFinancial.marinaMonthlyFee || 0,
            marinaDueDay: vesselFinancial.marinaDueDay || 5,
          },
          create: {
            userId: user.id,
            vesselId: vesselFinancial.vesselId,
            totalValue: vesselFinancial.totalValue || 0,
            downPayment: vesselFinancial.downPayment || 0,
            remainingAmount: (vesselFinancial.totalValue || 0) - (vesselFinancial.downPayment || 0),
            totalInstallments: vesselFinancial.totalInstallments || 0,
            marinaMonthlyFee: vesselFinancial.marinaMonthlyFee || 0,
            marinaDueDay: vesselFinancial.marinaDueDay || 5,
          },
        });

        // Gerar parcelas e pagamentos da marina se necessário
        if (vesselFinancial.totalValue && vesselFinancial.totalValue > 0) {
          await this.financialService.updateVesselFinancials(userVessel.id, {
            totalValue: vesselFinancial.totalValue || 0,
            downPayment: vesselFinancial.downPayment || 0,
            totalInstallments: vesselFinancial.totalInstallments || 0,
            marinaMonthlyFee: vesselFinancial.marinaMonthlyFee || 0,
            marinaDueDay: vesselFinancial.marinaDueDay || 5,
          });
        }
      }
    } else if (data.vesselIds && data.vesselIds.length > 0) {
      // Fallback para o método antigo (sem dados financeiros)
      await prisma.userVessel.createMany({
        data: data.vesselIds.map((vesselId) => ({
          userId: user.id,
          vesselId,
        })),
      });
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: createdBy,
        action: 'USER_CREATED',
        entityType: 'user',
        entityId: user.id,
        details: { name: user.name, email: user.email },
      },
    });

    return user;
  }

  async findAll(filters?: { role?: UserRole; isActive?: boolean }) {
    return prisma.user.findMany({
      where: {
        ...(filters?.role && { role: filters.role }),
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
        vessels: {
          include: {
            vessel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        // Campos adicionais
        birthDate: true,
        licenseType: true,
        registrationNumber: true,
        licenseExpiry: true,
        billingDueDay: true,
        // Dados de endereço
        address: true,
        zipCode: true,
        addressNumber: true,
        state: true,
        neighborhood: true,
        city: true,
        complement: true,
        vessels: {
          include: {
            vessel: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    return user;
  }

  async update(
    id: string,
    data: {
      name?: string;
      phone?: string;
      isActive?: boolean;
      status?: 'ACTIVE' | 'OVERDUE' | 'OVERDUE_PAYMENT' | 'BLOCKED';
      vesselIds?: string[];
      vesselFinancials?: Array<{
        vesselId: string;
        totalValue?: number;
        downPayment?: number;
        totalInstallments?: number;
        marinaMonthlyFee?: number;
        marinaDueDay?: number;
      }>;
    },
    updatedBy: string
  ) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.status && { status: data.status }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        isActive: true,
      },
    });

    // Atualizar embarcações vinculadas com dados financeiros
    if (data.vesselFinancials && data.vesselFinancials.length > 0) {
      // Deletar todas as vinculações existentes
      await prisma.userVessel.deleteMany({
        where: { userId: id },
      });

      // Criar novas vinculações com dados financeiros
      for (const vesselFinancial of data.vesselFinancials) {
        const userVessel = await prisma.userVessel.create({
          data: {
            userId: id,
            vesselId: vesselFinancial.vesselId,
            totalValue: vesselFinancial.totalValue || 0,
            downPayment: vesselFinancial.downPayment || 0,
            remainingAmount: (vesselFinancial.totalValue || 0) - (vesselFinancial.downPayment || 0),
            totalInstallments: vesselFinancial.totalInstallments || 0,
            marinaMonthlyFee: vesselFinancial.marinaMonthlyFee || 0,
            marinaDueDay: vesselFinancial.marinaDueDay || 5,
          },
        });

        // Gerar parcelas e pagamentos da marina se necessário
        if (vesselFinancial.totalValue && vesselFinancial.totalValue > 0) {
          await this.financialService.updateVesselFinancials(userVessel.id, {
            totalValue: vesselFinancial.totalValue || 0,
            downPayment: vesselFinancial.downPayment || 0,
            totalInstallments: vesselFinancial.totalInstallments || 0,
            marinaMonthlyFee: vesselFinancial.marinaMonthlyFee || 0,
            marinaDueDay: vesselFinancial.marinaDueDay || 5,
          });
        }
      }
    } else if (data.vesselIds !== undefined) {
      // Fallback para o método antigo (sem dados financeiros)
      await prisma.userVessel.deleteMany({
        where: { userId: id },
      });

      if (data.vesselIds.length > 0) {
        await prisma.userVessel.createMany({
          data: data.vesselIds.map((vesselId) => ({
            userId: id,
            vesselId,
          })),
        });
      }
    }

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'USER_UPDATED',
        entityType: 'user',
        entityId: id,
        details: data,
      },
    });

    return user;
  }

  async delete(id: string, deletedBy: string) {
    await prisma.user.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: deletedBy,
        action: 'USER_DELETED',
        entityType: 'user',
        entityId: id,
      },
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Senha atual incorreta');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}

