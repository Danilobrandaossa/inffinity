import {
  MercadoPagoConfig,
  Preference,
  Payment,
  PreApproval,
  PreApprovalPlan,
} from 'mercadopago';
import { config } from '../config';
import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import { FinancialService } from './financial.service';

type PaymentType = 'installment' | 'marina' | 'adhoc';

interface CheckoutRequest {
  paymentType: PaymentType;
  paymentId: string;
  userId: string;
  isAdmin: boolean;
  successUrl?: string;
  failureUrl?: string;
  pendingUrl?: string;
}

interface WebhookPayload {
  method: string;
  headers: Record<string, unknown>;
  body: any;
  query: Record<string, unknown>;
}

const PROVIDER_NAME = 'MERCADO_PAGO';

const financialService = new FinancialService();

export type MercadoPagoWebhookResult =
  | {
      type: 'preapproval';
      preapprovalId: string;
    }
  | {
      type: 'payment';
      paymentId: string;
    }
  | undefined;

export class MercadoPagoService {
  private readonly enabled: boolean;
  private readonly preferenceClient?: Preference;
  private readonly paymentClient?: Payment;
  private readonly preapprovalPlanClient?: PreApprovalPlan;
  private readonly preapprovalClient?: PreApproval;

  constructor() {
    this.enabled = config.mercadoPago.enabled && Boolean(config.mercadoPago.accessToken);

    if (this.enabled) {
      const clientOptions: ConstructorParameters<typeof MercadoPagoConfig>[0] = {
        accessToken: config.mercadoPago.accessToken,
      };

      if (config.mercadoPago.integratorId) {
        clientOptions.options = { integratorId: config.mercadoPago.integratorId };
      }

      const client = new MercadoPagoConfig(clientOptions);
      this.preferenceClient = new Preference(client);
      this.paymentClient = new Payment(client);
      this.preapprovalPlanClient = new PreApprovalPlan(client);
      this.preapprovalClient = new PreApproval(client);
    }
  }

  isEnabled() {
    return this.enabled;
  }

  async createCheckout(request: CheckoutRequest) {
    this.ensureEnabled();

    const { paymentType, paymentId, userId, isAdmin } = request;

    if (!['installment', 'marina', 'adhoc'].includes(paymentType)) {
      throw new AppError(400, 'Tipo de cobrança inválido para checkout Mercado Pago');
    }

    const paymentRecord = await this.getPaymentRecord(paymentType as PaymentType, paymentId);

    if (!paymentRecord) {
      throw new AppError(404, 'Cobrança não encontrada');
    }

    if (!isAdmin && paymentRecord.userVessel.userId !== userId) {
      throw new AppError(403, 'Você não tem permissão para pagar esta cobrança');
    }

    if (paymentRecord.status === 'PAID') {
      throw new AppError(400, 'Esta cobrança já foi paga');
    }

    const existingInProcess = this.getExistingCheckout(paymentRecord);
    if (existingInProcess) {
      return existingInProcess;
    }

    const item = this.buildItem(paymentType as PaymentType, paymentRecord);
    const backUrls = {
      success: request.successUrl || config.mercadoPago.backUrls.success,
      pending: request.pendingUrl || config.mercadoPago.backUrls.pending,
      failure: request.failureUrl || config.mercadoPago.backUrls.failure,
    };

    const externalReference = `${paymentType}:${paymentId}`;

    const preferenceResponse = await this.preferenceClient!.create({
      body: {
        items: [item],
        payer: {
          name: paymentRecord.userVessel.user.name,
          email: paymentRecord.userVessel.user.email,
        },
        back_urls: backUrls,
        auto_return: 'approved',
        notification_url: config.mercadoPago.webhookUrl,
        statement_descriptor: config.mercadoPago.statementDescriptor,
        external_reference: externalReference,
        metadata: {
          paymentType,
          paymentId,
          userVesselId: paymentRecord.userVesselId,
          vesselName: paymentRecord.userVessel.vessel?.name,
        },
      },
    });

    const checkoutData = {
      preferenceId: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
      providerStatus: 'pending',
      amount: item.unit_price,
    };

    await this.updateProviderFields(paymentType as PaymentType, paymentId, {
      paymentProvider: PROVIDER_NAME,
      providerPreferenceId: preferenceResponse.id,
      providerInitPoint: preferenceResponse.init_point,
      providerSandboxInitPoint: preferenceResponse.sandbox_init_point,
      providerStatus: 'pending',
      providerMetadata: {
        backUrls,
        createdAt: new Date().toISOString(),
      },
    });

    logger.info('Mercado Pago checkout criado', {
      paymentType,
      paymentId,
      preferenceId: preferenceResponse.id,
    });

    return checkoutData;
  }

  async handleNotification(payload: WebhookPayload): Promise<MercadoPagoWebhookResult> {
    this.ensureEnabled();

    const event = payload.body && Object.keys(payload.body).length ? payload.body : payload.query;
    if (!event) {
      logger.warn('Webhook Mercado Pago recebido sem payload');
      return undefined;
    }

    const type = (event.type || event.topic) as string | undefined;
    const action = event.action as string | undefined;

    // Mercado Pago envia notificações com type/topic = payment
    if (type === 'payment' || action?.startsWith('payment')) {
      const paymentId =
        event.data?.id ||
        event['data.id'] ||
        event.id ||
        payload.query['data.id'] ||
        payload.query.id;

      if (paymentId) {
        const result = await this.syncPaymentStatus(paymentId.toString());
        if (result === 'subscription') {
          return {
            type: 'payment',
            paymentId: paymentId.toString(),
          };
        }
      } else {
        logger.warn('Webhook Mercado Pago sem paymentId', { event });
      }
      return undefined;
    }

    if (type === 'preapproval' || action?.startsWith('preapproval')) {
      const preapprovalId =
        event.data?.id ||
        event['data.id'] ||
        event.id ||
        payload.query['data.id'] ||
        payload.query.id;

      if (preapprovalId) {
        return {
          type: 'preapproval',
          preapprovalId: preapprovalId.toString(),
        };
      }

      logger.warn('Webhook Mercado Pago sem preapprovalId', { event });
      return undefined;
    }

    logger.info('Webhook Mercado Pago ignorado', { type, action });
    return undefined;
  }

  private ensureEnabled() {
    if (!this.enabled || !this.preferenceClient || !this.paymentClient) {
      throw new AppError(503, 'Integração com Mercado Pago não está configurada');
    }
  }

  private async syncPaymentStatus(paymentId: string): Promise<'subscription' | undefined> {
    try {
      const paymentResponse = await this.paymentClient!.get({ id: paymentId });
      const externalReference = paymentResponse.external_reference;

      if (!externalReference) {
        logger.warn('Pagamento Mercado Pago sem external_reference', { paymentId });
        return undefined;
      }

      if (externalReference.startsWith('subscription_payment:')) {
        return 'subscription';
      }

      const [paymentType, internalId] = externalReference.split(':');

      if (!paymentType || !internalId) {
        logger.warn('external_reference inválido recebido do Mercado Pago', {
          paymentId,
          externalReference,
        });
        return undefined;
      }

      if (!['installment', 'marina', 'adhoc'].includes(paymentType)) {
        logger.warn('Tipo de pagamento desconhecido no external_reference', {
          paymentType,
          externalReference,
        });
        return undefined;
      }

      const providerStatus = paymentResponse.status || 'unknown';
      const paidAt = paymentResponse.date_approved
        ? new Date(paymentResponse.date_approved)
        : undefined;

      await this.updateProviderFields(paymentType as PaymentType, internalId, {
        paymentProvider: PROVIDER_NAME,
        providerPaymentId: paymentResponse.id?.toString(),
        providerStatus,
        providerMetadata: {
          statusDetail: paymentResponse.status_detail,
          paymentMethod: paymentResponse.payment_method?.id,
          lastUpdated: new Date().toISOString(),
        },
      });

      await financialService.applyProviderStatus({
        paymentType: paymentType as PaymentType,
        paymentId: internalId,
        providerPaymentId: paymentResponse.id?.toString(),
        providerStatus,
        providerStatusDetail: paymentResponse.status_detail,
        paidAt,
        metadata: paymentResponse,
      });
      return undefined;
    } catch (error) {
      logger.error('Erro ao sincronizar pagamento com Mercado Pago', {
        paymentId,
        error,
      });
      throw error;
    }
  }

  private getExistingCheckout(paymentRecord: any) {
    if (
      paymentRecord.paymentProvider === PROVIDER_NAME &&
      paymentRecord.providerPreferenceId &&
      paymentRecord.providerInitPoint &&
      (paymentRecord.providerStatus === 'pending' ||
        paymentRecord.providerStatus === 'in_process')
    ) {
      return {
        preferenceId: paymentRecord.providerPreferenceId,
        initPoint: paymentRecord.providerInitPoint,
        sandboxInitPoint: paymentRecord.providerSandboxInitPoint,
        providerStatus: paymentRecord.providerStatus,
        amount: paymentRecord.amount ?? paymentRecord.value ?? 0,
        existing: true,
      };
    }
    return null;
  }

  private async getPaymentRecord(paymentType: PaymentType, paymentId: string) {
    switch (paymentType) {
      case 'installment':
        return prisma.installment.findUnique({
          where: { id: paymentId },
          include: {
            userVessel: {
              include: {
                user: true,
                vessel: true,
              },
            },
          },
        });
      case 'marina':
        return prisma.marinaPayment.findUnique({
          where: { id: paymentId },
          include: {
            userVessel: {
              include: {
                user: true,
                vessel: true,
              },
            },
          },
        });
      case 'adhoc':
        return prisma.adHocCharge.findUnique({
          where: { id: paymentId },
          include: {
            userVessel: {
              include: {
                user: true,
                vessel: true,
              },
            },
          },
        });
      default:
        return null;
    }
  }

  private buildItem(paymentType: PaymentType, record: any) {
    switch (paymentType) {
      case 'installment': {
        const installmentNumber = record.installmentNumber || 0;
        const totalInstallments = record.userVessel.totalInstallments || 0;
        const title = `Parcela ${installmentNumber}/${totalInstallments} - ${record.userVessel.vessel?.name || 'Embarcação'}`;

        return {
          id: record.id,
          title,
          quantity: 1,
          unit_price: Number(record.amount || 0),
        };
      }
      case 'marina': {
        const title = `Mensalidade Marina - ${record.userVessel.vessel?.name || 'Embarcação'}`;
        return {
          id: record.id,
          title,
          quantity: 1,
          unit_price: Number(record.amount || 0),
        };
      }
      case 'adhoc': {
        const title = record.title || `Cobrança - ${record.userVessel.vessel?.name || 'Embarcação'}`;
        return {
          id: record.id,
          title,
          description: record.description || undefined,
          quantity: 1,
          unit_price: Number(record.amount || 0),
        };
      }
      default:
        throw new AppError(400, 'Tipo de item inválido');
    }
  }

  private async updateProviderFields(
    paymentType: PaymentType,
    paymentId: string,
    data: Record<string, unknown>,
  ) {
    const updateData = this.sanitizeData({
      ...data,
    });

    switch (paymentType) {
      case 'installment':
        await prisma.installment.update({
          where: { id: paymentId },
          data: updateData,
        });
        break;
      case 'marina':
        await prisma.marinaPayment.update({
          where: { id: paymentId },
          data: updateData,
        });
        break;
      case 'adhoc':
        await prisma.adHocCharge.update({
          where: { id: paymentId },
          data: updateData,
        });
        break;
      default:
        break;
    }
  }

  private sanitizeData(data: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );
  }

  private ensurePreapprovalEnabled() {
    if (!this.enabled || !this.preapprovalPlanClient || !this.preapprovalClient) {
      throw new AppError(503, 'Integração de assinaturas com Mercado Pago não está configurada');
    }
  }

  async createPreapprovalPlan(data: {
    reason: string;
    autoRecurring: {
      frequency: number;
      frequencyType: string;
      repetitions?: number;
      billingDay?: number;
      billingDayProportional?: boolean;
      freeTrialFrequency?: number;
      freeTrialFrequencyType?: string;
      transactionAmount: number;
      currencyId: string;
    };
    paymentMethodsAllowed?: {
      paymentTypes?: unknown[];
      paymentMethods?: unknown[];
    };
    backUrl?: string;
  }) {
    this.ensurePreapprovalEnabled();

    const response = await this.preapprovalPlanClient!.create({
      body: {
        reason: data.reason,
        auto_recurring: {
          frequency: data.autoRecurring.frequency,
          frequency_type: data.autoRecurring.frequencyType,
          repetitions: data.autoRecurring.repetitions,
          billing_day: data.autoRecurring.billingDay,
          billing_day_proportional: data.autoRecurring.billingDayProportional,
          transaction_amount: data.autoRecurring.transactionAmount,
          currency_id: data.autoRecurring.currencyId,
          free_trial:
            data.autoRecurring.freeTrialFrequency && data.autoRecurring.freeTrialFrequencyType
              ? {
                  frequency: data.autoRecurring.freeTrialFrequency,
                  frequency_type: data.autoRecurring.freeTrialFrequencyType,
                }
              : undefined,
        },
        payment_methods_allowed: data.paymentMethodsAllowed,
      back_url: data.backUrl && data.backUrl.startsWith('https')
        ? data.backUrl
        : undefined,
      },
    });

    return response;
  }

  async createPreapprovalSubscription(data: {
    preapprovalPlanId: string;
    payerEmail: string;
    cardTokenId: string;
    reason?: string;
    externalReference?: string;
    backUrl?: string;
    status?: 'authorized' | 'paused' | 'cancelled';
  }) {
    this.ensurePreapprovalEnabled();

    const response = await this.preapprovalClient!.create({
      body: {
        preapproval_plan_id: data.preapprovalPlanId,
        payer_email: data.payerEmail,
        card_token_id: data.cardTokenId,
        status: data.status || 'authorized',
        reason: data.reason,
        external_reference: data.externalReference,
        back_url: data.backUrl || config.mercadoPago.backUrls.success,
      },
    });

    return response;
  }

  async getPreapproval(preapprovalId: string) {
    this.ensurePreapprovalEnabled();
    return this.preapprovalClient!.get({ id: preapprovalId });
  }

  async cancelPreapproval(preapprovalId: string) {
    this.ensurePreapprovalEnabled();
    return this.preapprovalClient!.update({
      id: preapprovalId,
      body: {
        status: 'cancelled',
      },
    });
  }

  async createPixPayment(data: {
    amount: number;
    description?: string;
    payer: {
      email: string;
      firstName?: string;
      lastName?: string;
      identification?: { type: string; number: string };
    };
    externalReference?: string;
    expiresInMinutes?: number;
    metadata?: Record<string, unknown>;
  }) {
    this.ensureEnabled();

    if (!data.amount || data.amount <= 0) {
      throw new AppError(400, 'Valor do pagamento inválido');
    }

    const expiration =
      data.expiresInMinutes && data.expiresInMinutes > 0
        ? new Date(Date.now() + data.expiresInMinutes * 60 * 1000).toISOString()
        : undefined;

    const body: Record<string, unknown> = {
      transaction_amount: Number(data.amount.toFixed(2)),
      description: data.description || 'Pagamento PIX',
      payment_method_id: 'pix',
      external_reference: data.externalReference,
      date_of_expiration: expiration,
      payer: {
        email: data.payer.email,
        first_name: data.payer.firstName,
        last_name: data.payer.lastName,
        identification: data.payer.identification,
      },
      metadata: data.metadata,
    };

    if (config.mercadoPago.webhookUrl.startsWith('https://')) {
      body.notification_url = config.mercadoPago.webhookUrl;
    }

    const response = await this.paymentClient!.create({
      body,
    });

    return response;
  }

  async getPayment(paymentId: string) {
    this.ensureEnabled();
    return this.paymentClient!.get({ id: paymentId });
  }
}

export const mercadoPagoService = new MercadoPagoService();

