import { Request, Response } from 'express';
import { z } from 'zod';
import { mercadoPagoService } from '../services/mercado-pago.service';
import { logger } from '../utils/logger';
import { subscriptionService } from '../services/subscription.service';

const checkoutSchema = z.object({
  successUrl: z.string().url().optional(),
  failureUrl: z.string().url().optional(),
  pendingUrl: z.string().url().optional(),
});

const PAYMENT_TYPE_SET = new Set(['installment', 'marina', 'adhoc']);

export class MercadoPagoController {
  async createCheckout(req: Request, res: Response) {
    if (!mercadoPagoService.isEnabled()) {
      return res.status(503).json({
        success: false,
        message: 'Integração com Mercado Pago não configurada',
      });
    }

    const { paymentType, paymentId } = req.params;
    if (!PAYMENT_TYPE_SET.has(paymentType)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de cobrança inválido',
      });
    }

    const validation = checkoutSchema.safeParse(req.body || {});
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: validation.error.flatten(),
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    try {
      const checkout = await mercadoPagoService.createCheckout({
        paymentType: paymentType as 'installment' | 'marina' | 'adhoc',
        paymentId,
        userId: req.user.userId,
        isAdmin: req.user.role === 'ADMIN',
        ...validation.data,
      });

      res.json({
        success: true,
        data: checkout,
      });
    } catch (error) {
      logger.error('Erro ao criar checkout Mercado Pago', {
        paymentType,
        paymentId,
        error,
      });
      if (error instanceof Error && 'statusCode' in error) {
        const statusCode = (error as any).statusCode || 500;
        return res.status(statusCode).json({
          success: false,
          message: error.message,
        });
      }
      res.status(500).json({
        success: false,
        message: 'Erro ao iniciar pagamento',
      });
    }
  }

  async webhook(req: Request, res: Response) {
    if (!mercadoPagoService.isEnabled()) {
      return res.status(204).send();
    }

    try {
      const result = await mercadoPagoService.handleNotification({
        method: req.method,
        headers: req.headers,
        body: req.body,
        query: req.query as Record<string, unknown>,
      });

      if (result?.type === 'preapproval') {
        await subscriptionService.syncFromProvider(result.preapprovalId);
      } else if (result?.type === 'payment') {
        await subscriptionService.markPixPaymentAsPaid(result.paymentId);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Erro ao processar webhook do Mercado Pago', { error });
      res.status(500).json({
        success: false,
        message: 'Erro ao processar webhook',
      });
    }
  }
}

export const mercadoPagoController = new MercadoPagoController();

