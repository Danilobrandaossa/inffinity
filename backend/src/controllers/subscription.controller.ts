import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { subscriptionService } from '../services/subscription.service';

const createSubscriptionSchema = z.object({
  planId: z.string().uuid('Plano inválido'),
  reason: z.string().optional(),
  userId: z.string().uuid().optional(),
});

const reissueSubscriptionSchema = z.object({
  reason: z.string().optional(),
  amount: z.number().positive().optional(),
  expiresInMinutes: z.number().int().min(5).max(2880).optional(),
  force: z.boolean().optional(),
});

export class SubscriptionController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSubscriptionSchema.parse(req.body);

      const result = await subscriptionService.createSubscription({
        planId: data.planId,
        userId: req.user!.userId,
        reason: data.reason,
        targetUserId: data.userId,
        isAdmin: req.user?.role === 'ADMIN',
      });

      res.status(201).json({
        success: true,
        data: result.subscription,
        pix: result.pix,
        payment: result.payment,
      });
    } catch (error) {
      next(error);
    }
  }

  async listMine(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await subscriptionService.listSubscriptions(req.user!.userId);
      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await subscriptionService.listSubscriptions();
      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  async reissue(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = reissueSubscriptionSchema.parse(req.body ?? {});
      const { id } = req.params;

      const result = await subscriptionService.reissuePixPayment({
        subscriptionId: id,
        requesterId: req.user!.userId,
        isAdmin: req.user?.role === 'ADMIN',
        reason: payload.reason,
        amountOverride: payload.amount,
        expiresInMinutes: payload.expiresInMinutes,
        force: payload.force,
        triggeredBy: req.user?.role === 'ADMIN' ? 'admin' : 'user',
      });

      res.json({
        success: true,
        data: result.subscription,
        pix: result.pix,
        payment: result.payment,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionController = new SubscriptionController();


