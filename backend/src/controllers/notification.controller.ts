import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { NotificationService } from '../services/notification.service';
import { UserRole } from '@prisma/client';

const notificationService = new NotificationService();

const createNotificationSchema = z.object({
  title: z.string().min(3),
  message: z.string().min(3),
  type: z.string(),
  isGlobal: z.boolean().optional(),
  targetRole: z.nativeEnum(UserRole).optional(),
  vesselId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(), // Para notificação específica a um usuário
  userIds: z.array(z.string().uuid()).optional(), // Para múltiplos usuários específicos
  expiresAt: z.string().datetime().optional(),
});

const updateNotificationSchema = z.object({
  title: z.string().min(3).optional(),
  message: z.string().min(3).optional(),
  isActive: z.boolean().optional(),
  expiresAt: z.string().datetime().optional(),
});

export class NotificationController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createNotificationSchema.parse(req.body);

      const notification = await notificationService.create({
        ...data,
        ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
      });

      res.status(201).json(notification);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive, type } = req.query;

      const notifications = await notificationService.findAll({
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        type: type as string,
      });

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async findByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const notifications = await notificationService.findByUser(userId);

      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      const count = await notificationService.getUnreadCount(userId);

      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const notification = await notificationService.markAsRead(userId, id);

      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;

      await notificationService.markAllAsRead(userId);

      res.json({ message: 'Todas as notificações foram marcadas como lidas' });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateNotificationSchema.parse(req.body);

      const notification = await notificationService.update(id, {
        ...data,
        ...(data.expiresAt && { expiresAt: new Date(data.expiresAt) }),
      });

      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await notificationService.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

