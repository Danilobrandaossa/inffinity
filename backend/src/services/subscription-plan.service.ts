import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { mercadoPagoService } from './mercado-pago.service';
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
    if (!mercadoPagoService.isEnabled()) {
      throw new AppError(503, 'Integração Mercado Pago não disponível');
    }

    if (data.frequency <= 0) {
      throw new AppError(400, 'Frequência deve ser maior que zero');
    }

    if (data.amount <= 0) {
      throw new AppError(400, 'Valor deve ser maior que zero');
    }

    const planResponse = await mercadoPagoService.createPreapprovalPlan({
      reason: data.name,
      autoRecurring: {
        frequency: data.frequency,
        frequencyType: data.frequencyType,
        repetitions: data.repetitions,
        billingDay: data.billingDay,
        billingDayProportional: data.billingDayProportional,
        freeTrialFrequency: data.freeTrialFrequency,
        freeTrialFrequencyType: data.freeTrialFrequencyType,
        transactionAmount: data.amount,
        currencyId: data.currencyId || 'BRL',
      },
      backUrl: data.backUrl && data.backUrl.startsWith('https') ? data.backUrl : undefined,
    });

    const plan = await prisma.subscriptionPlan.create({
      data: {
        mercadoPagoPlanId: planResponse.id!,
        name: data.name,
        description: data.description,
        amount: data.amount,
        currencyId: data.currencyId || 'BRL',
        frequency: data.frequency,
        frequencyType: data.frequencyType,
        repetitions: data.repetitions,
        billingDay: data.billingDay,
        billingDayProportional: data.billingDayProportional ?? false,
        freeTrialFrequency: data.freeTrialFrequency,
        freeTrialFrequencyType: data.freeTrialFrequencyType,
        backUrl: data.backUrl || planResponse.back_url || undefined,
        status: planResponse.status || 'active',
        lateInterestPercent: data.lateInterestPercent ?? 0,
        penaltyPercent: data.penaltyPercent ?? 0,
      },
    });

    logger.info('Plano de assinatura criado', {
      planId: plan.id,
      mercadoPagoPlanId: plan.mercadoPagoPlanId,
    });

    return plan;
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


