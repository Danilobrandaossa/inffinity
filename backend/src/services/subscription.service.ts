import { addDays, addMonths, differenceInCalendarDays, isAfter } from 'date-fns';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

interface CreateSubscriptionInput {
  planId: string;
  userId: string;
  reason?: string;
  targetUserId?: string;
  isAdmin?: boolean;
}

interface ReissuePixPaymentInput {
  subscriptionId: string;
  requesterId?: string;
  isAdmin?: boolean;
  reason?: string;
  amountOverride?: number;
  expiresInMinutes?: number;
  force?: boolean;
  triggeredBy?: string;
}

interface GeneratePixPaymentParams {
  subscription: any;
  user: any;
  amount: number;
  amountOverride?: number;
  reason: string;
  expiresInMinutes?: number;
  triggeredBy?: string;
}

export class SubscriptionService {
  async createSubscription(data: CreateSubscriptionInput) {
    throw new AppError(503, 'Funcionalidade de assinaturas não disponível (Mercado Pago removido)');

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: data.planId },
    });

    if (!plan || plan.status !== 'active') {
      throw new AppError(400, 'Plano indisponível ou inativo');
    }

    const targetUserId =
      data.isAdmin && data.targetUserId ? data.targetUserId : data.userId;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new AppError(404, 'Usuário não encontrado');
    }

    if (!user.isActive) {
      throw new AppError(403, 'Usuário está inativo');
    }

    const subscription = await prisma.subscription.create({
      data: {
        planId: plan.id,
        userId: user.id,
        payerEmail: user.email,
        status: 'pending',
        reason: data.reason || plan.name,
      },
      include: { plan: true, user: true },
    });

    const result = await this.generatePixPayment({
      subscription,
      user,
      amount: plan.amount,
      reason: data.reason || plan.name,
      expiresInMinutes: 60,
      triggeredBy: 'initial',
    });

    logger.info('Assinatura criada com pagamento PIX', {
      subscriptionId: result.subscription.id,
      providerPaymentId: result.subscription.providerPaymentId,
    });

    return result;
  }

  async listSubscriptions(userId?: string) {
    return prisma.subscription.findMany({
      where: userId ? { userId } : undefined,
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { plan: true, user: true },
    });

    if (!subscription) {
      throw new AppError(404, 'Assinatura não encontrada');
    }

    return subscription;
  }

  async markPixPaymentAsPaid(providerPaymentId: string) {
    const subscription = await prisma.subscription.findFirst({
      where: { providerPaymentId },
      include: { plan: true },
    });

    if (!subscription) {
      logger.warn('Nenhuma assinatura encontrada para o pagamento PIX', {
        providerPaymentId,
      });
      return;
    }

    // Mercado Pago removido - funcionalidade desabilitada
    logger.warn('Funcionalidade de pagamentos desabilitada (Mercado Pago removido)', {
      providerPaymentId,
    });
    return;

    const paidAt = payment.date_approved ? new Date(payment.date_approved) : new Date();

    const nextChargeDate =
      subscription.plan.frequencyType === 'months'
        ? addMonths(paidAt, subscription.plan.frequency)
        : addDays(paidAt, subscription.plan.frequency);

    const providerStatus = payment.status || subscription.providerStatus || 'pending';

    let statusToApply = subscription.status;
    switch (providerStatus) {
      case 'approved':
        statusToApply = 'authorized';
        break;
      case 'pending':
        statusToApply = 'pending';
        break;
      case 'in_process':
        statusToApply = 'in_process';
        break;
      case 'cancelled':
        statusToApply = 'cancelled';
        break;
      case 'rejected':
        statusToApply = 'rejected';
        break;
      default:
        statusToApply = subscription.status;
    }

    const existingMetadata = (subscription.metadata as Record<string, any>) || {};
    const existingProviderMetadata =
      (subscription.providerMetadata as Record<string, any>) || {};
    const currentCharge = existingMetadata.currentCharge;
    const chargeHistory = Array.isArray(existingMetadata.chargeHistory)
      ? [...existingMetadata.chargeHistory]
      : [];

    const shouldArchiveCharge = currentCharge && ['approved', 'cancelled', 'rejected'].includes(providerStatus);

    if (shouldArchiveCharge && currentCharge) {
      chargeHistory.push({
        ...currentCharge,
        paidAt: providerStatus === 'approved' ? paidAt.toISOString() : undefined,
        providerPaymentId: payment.id,
        providerStatus,
      });
    }

    const updatedCurrentCharge =
      currentCharge && !shouldArchiveCharge
        ? {
            ...currentCharge,
            providerStatus,
            lastStatusUpdateAt: new Date().toISOString(),
          }
        : shouldArchiveCharge
        ? null
        : currentCharge;

    const updatedMetadata: Record<string, any> = {
      ...existingMetadata,
      lastPayment: payment,
      currentCharge: updatedCurrentCharge,
      chargeHistory: chargeHistory.slice(-50),
    };

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: statusToApply,
        providerStatus,
        providerMetadata: {
          ...existingProviderMetadata,
          statusDetail: payment.status_detail,
          paymentMethod: payment.payment_method?.id,
          lastSyncedAt: new Date().toISOString(),
        },
        lastChargedAt: providerStatus === 'approved' ? paidAt : subscription.lastChargedAt,
        nextChargeDate: providerStatus === 'approved' ? nextChargeDate : subscription.nextChargeDate,
        metadata: updatedMetadata,
      },
    });

    logger.info('Assinatura atualizada após pagamento PIX', {
      subscriptionId: subscription.id,
      providerPaymentId,
      status: providerStatus,
    });
  }

  async reissuePixPayment({
    subscriptionId,
    requesterId,
    isAdmin,
    reason,
    amountOverride,
    expiresInMinutes,
    force,
    triggeredBy,
  }: ReissuePixPaymentInput) {
    throw new AppError(503, 'Funcionalidade de assinaturas não disponível (Mercado Pago removido)');

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: true },
    });

    if (!subscription) {
      throw new AppError(404, 'Assinatura não encontrada');
    }

    if (!isAdmin && subscription.userId !== requesterId) {
      throw new AppError(403, 'Você não tem permissão para reemitir esta assinatura');
    }

    if (subscription.plan.status !== 'active') {
      throw new AppError(400, 'Plano inativo. Reative o plano antes de gerar uma nova cobrança.');
    }

    if (['cancelled', 'paused', 'finished', 'expired'].includes(subscription.status)) {
      throw new AppError(400, 'Assinatura não está ativa para reemissão de cobrança.');
    }

    const existingMetadata = (subscription.metadata as Record<string, any>) || {};
    const existingPayment = existingMetadata.payment;
    const hasPendingPayment =
      subscription.providerStatus &&
      ['pending', 'in_process'].includes(subscription.providerStatus);
    const expiration = existingPayment?.dateOfExpiration
      ? new Date(existingPayment.dateOfExpiration)
      : undefined;

    if (!force && hasPendingPayment && expiration && isAfter(expiration, new Date())) {
      throw new AppError(409, 'Já existe um pagamento PIX pendente e válido para esta assinatura.');
    }

    const result = await this.generatePixPayment({
      subscription,
      user: subscription.user,
      amount: subscription.plan.amount,
      amountOverride,
      reason: reason || subscription.reason || subscription.plan.name,
      expiresInMinutes,
      triggeredBy: triggeredBy || (isAdmin ? 'admin' : 'user'),
    });

    logger.info('Nova cobrança PIX emitida para assinatura', {
      subscriptionId: subscription.id,
      providerPaymentId: result.subscription.providerPaymentId,
      triggeredBy: triggeredBy || (isAdmin ? 'admin' : 'user'),
    });

    return result;
  }

  async processDueSubscriptions() {
    logger.debug('Funcionalidade de assinaturas desabilitada (Mercado Pago removido) - pulando processDueSubscriptions');
    return { processed: 0, skipped: 0, errors: 0, total: 0 };

    const now = new Date();

    const dueSubscriptions = await prisma.subscription.findMany({
      where: {
        nextChargeDate: { lte: now },
        status: { in: ['authorized', 'pending', 'in_process'] },
        plan: {
          status: 'active',
        },
      },
      include: { plan: true, user: true },
    });

    let processed = 0;
    let skipped = 0;
    let errors = 0;

    for (const subscription of dueSubscriptions) {
      try {
        const metadata = (subscription.metadata as Record<string, any>) || {};
        const existingPayment = metadata.payment;
        const expiration = existingPayment?.dateOfExpiration
          ? new Date(existingPayment.dateOfExpiration)
          : undefined;

        const hasPendingPayment =
          subscription.providerStatus &&
          ['pending', 'in_process'].includes(subscription.providerStatus);

        if (hasPendingPayment && expiration && isAfter(expiration, now)) {
          skipped += 1;
          continue;
        }

        await this.generatePixPayment({
          subscription,
          user: subscription.user,
          amount: subscription.plan.amount,
          reason: subscription.reason || subscription.plan.name,
          expiresInMinutes: 60,
          triggeredBy: 'cron',
        });

        processed += 1;
      } catch (error) {
        errors += 1;
        logger.error('Erro ao reemitir cobrança PIX da assinatura', {
          subscriptionId: subscription.id,
          error,
        });
      }
    }

    return {
      processed,
      skipped,
      errors,
      total: dueSubscriptions.length,
    };
  }

  async syncFromProvider(preapprovalId: string) {
    logger.info('Sincronização via preapproval ignorada (PIX adotado)', {
      preapprovalId,
    });
  }

  private async generatePixPayment({
    subscription,
    user,
    amount,
    amountOverride,
    reason,
    expiresInMinutes,
    triggeredBy,
  }: GeneratePixPaymentParams) {
    const generationDate = new Date();
    const chargeAmount = this.calculateChargeAmount(subscription, amount, {
      generatedAt: generationDate,
      amountOverride,
    });

    // Mercado Pago removido - funcionalidade desabilitada
    throw new AppError(503, 'Funcionalidade de pagamentos PIX não disponível (Mercado Pago removido)');

    const expiresAt = pixPayment.date_of_expiration
      ? new Date(pixPayment.date_of_expiration).toISOString()
      : undefined;
    const existingMetadata = (subscription.metadata as Record<string, unknown>) || {};
    const existingProviderMetadata =
      (subscription.providerMetadata as Record<string, unknown>) || {};

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'pending',
        providerPaymentId: pixPayment.id?.toString(),
        providerStatus: pixPayment.status || 'pending',
        providerMetadata: {
          ...existingProviderMetadata,
          statusDetail: pixPayment.status_detail,
          lastGeneratedAt: new Date().toISOString(),
          charge: chargeAmount.breakdown,
        },
        metadata: {
          ...existingMetadata,
          pix: pixPayment.point_of_interaction?.transaction_data,
          payment: {
            id: pixPayment.id,
            status: pixPayment.status,
            dateOfExpiration: pixPayment.date_of_expiration,
          },
          currentCharge: {
            ...chargeAmount.breakdown,
            totalAmount: chargeAmount.totalAmount,
            triggeredBy: triggeredBy || 'system',
            expiresAt,
            providerStatus: pixPayment.status || 'pending',
          },
        },
      },
      include: { plan: true },
    });

    return {
      subscription: updatedSubscription,
      pix: pixPayment.point_of_interaction?.transaction_data,
      payment: {
        id: pixPayment.id,
        status: pixPayment.status,
        date_of_expiration: pixPayment.date_of_expiration,
        amount: chargeAmount.totalAmount,
        breakdown: chargeAmount.breakdown,
      },
    };
  }

  private calculateChargeAmount(
    subscription: any,
    baseAmount: number,
    options?: { generatedAt?: Date; amountOverride?: number },
  ) {
    const generatedAt = options?.generatedAt ?? new Date();
    const base = this.roundAmount(baseAmount);

    if (options?.amountOverride !== undefined) {
      const total = this.roundAmount(options.amountOverride);
      return {
        totalAmount: total,
        breakdown: {
          baseAmount: total,
          penaltyPercent: 0,
          penaltyAmount: 0,
          interestPercentPerDay: 0,
          interestAmount: 0,
          daysLate: 0,
          isOverdue: false,
          dueDate: subscription.nextChargeDate
            ? new Date(subscription.nextChargeDate).toISOString()
            : undefined,
          generatedAt: generatedAt.toISOString(),
          overrideApplied: true,
        },
      };
    }

    const penaltyPercent = Number(subscription.plan?.penaltyPercent || 0);
    const interestPercent = Number(subscription.plan?.lateInterestPercent || 0);
    const dueDate = subscription.nextChargeDate
      ? new Date(subscription.nextChargeDate)
      : undefined;
    const isOverdue = dueDate ? isAfter(generatedAt, dueDate) : false;
    const daysLate =
      isOverdue && dueDate ? Math.max(0, differenceInCalendarDays(generatedAt, dueDate)) : 0;

    const penaltyAmount =
      isOverdue && penaltyPercent > 0 ? this.roundAmount((base * penaltyPercent) / 100) : 0;
    const interestAmount =
      isOverdue && interestPercent > 0
        ? this.roundAmount((base * interestPercent * daysLate) / 100)
        : 0;

    const totalAmount = this.roundAmount(base + penaltyAmount + interestAmount);

    return {
      totalAmount,
      breakdown: {
        baseAmount: base,
        penaltyPercent,
        penaltyAmount,
        interestPercentPerDay: interestPercent,
        interestAmount,
        daysLate,
        isOverdue,
        dueDate: dueDate?.toISOString(),
        generatedAt: generatedAt.toISOString(),
        overrideApplied: false,
      },
    };
  }

  private roundAmount(amount: number) {
    return Math.round(Number(amount || 0) * 100) / 100;
  }
}

export const subscriptionService = new SubscriptionService();
