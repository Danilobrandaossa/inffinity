import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

interface CreateSubscriptionPlanInput {
  name: string;
  description?: string;
  amount: number;
  currencyId?: string;
  frequency: number;
  frequencyType: 'days' | 'months';
  repetitions?: number;
  billingDay?: number;
  billingDayProportional?: boolean;
  freeTrialFrequency?: number;
  freeTrialFrequencyType?: 'days' | 'months';
  backUrl?: string;
  lateInterestPercent?: number;
  penaltyPercent?: number;
}

export class SubscriptionPlanService {
  async create(data: CreateSubscriptionPlanInput) {
    throw new AppError(503, 'Funcionalidade de planos de assinatura não disponível (Mercado Pago removido)');
  }

  async list(includeInactive = false) {
    return prisma.subscriptionPlan.findMany({
      where: includeInactive ? undefined : { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new AppError(404, 'Plano não encontrado');
    }

    return plan;
  }

  async updateStatus(id: string, status: string) {
    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: { status },
    });
    return plan;
  }
}

export const subscriptionPlanService = new SubscriptionPlanService();


