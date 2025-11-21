import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { subscriptionPlanService } from '../services/subscription-plan.service';

const createPlanSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  amount: z.number().positive('Valor deve ser positivo'),
  currencyId: z.string().default('BRL').optional(),
  frequency: z.number().int().positive('Frequência deve ser positiva'),
  frequencyType: z.enum(['days', 'months']),
  repetitions: z.number().int().positive().optional(),
  billingDay: z.number().int().min(1).max(31).optional(),
  billingDayProportional: z.boolean().optional(),
  freeTrial: z
    .object({
      frequency: z.number().int().positive(),
      frequencyType: z.enum(['days', 'months']),
    })
    .optional(),
  backUrl: z.string().url().optional(),
  lateInterestPercent: z.number().min(0).max(100).optional(),
  penaltyPercent: z.number().min(0).max(100).optional(),
});

export class SubscriptionPlanController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createPlanSchema.parse(req.body);

      const plan = await subscriptionPlanService.create({
        name: data.name,
        description: data.description,
        amount: data.amount,
        currencyId: data.currencyId,
        frequency: data.frequency,
        frequencyType: data.frequencyType,
        repetitions: data.repetitions,
        billingDay: data.billingDay,
        billingDayProportional: data.billingDayProportional,
        freeTrialFrequency: data.freeTrial?.frequency,
        freeTrialFrequencyType: data.freeTrial?.frequencyType,
        backUrl: data.backUrl,
        lateInterestPercent: data.lateInterestPercent,
        penaltyPercent: data.penaltyPercent,
      });

      res.status(201).json({
        success: true,
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const plans = await subscriptionPlanService.list(includeInactive);
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const subscriptionPlanController = new SubscriptionPlanController();


