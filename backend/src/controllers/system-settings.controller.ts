import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SystemSettingsService } from '../services/system-settings.service';

const systemSettingsService = new SystemSettingsService();

const updateSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: z.string().optional(),
});

const updateOneSignalSchema = z.object({
  appId: z.string().min(1, 'App ID é obrigatório'),
  restApiKey: z.string().min(1, 'REST API Key é obrigatória'),
});

export class SystemSettingsController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await systemSettingsService.getAll();
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  async getByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const settings = await systemSettingsService.getByCategory(category);
      res.json(settings);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const { key } = req.params;
      const value = await systemSettingsService.get(key);
      if (value === null) {
        return res.status(404).json({ error: 'Configuração não encontrada' });
      }
      res.json({ key, value });
    } catch (error) {
      next(error);
    }
  }

  async set(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSettingSchema.parse(req.body);
      await systemSettingsService.set(data.key, data.value, data.category);
      res.json({ message: 'Configuração atualizada com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async getOneSignalConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const config = await systemSettingsService.getOneSignalConfig();
      res.json(config);
    } catch (error) {
      next(error);
    }
  }

  async setOneSignalConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateOneSignalSchema.parse(req.body);
      await systemSettingsService.setOneSignalConfig(data.appId, data.restApiKey);
      res.json({ message: 'Configurações do OneSignal atualizadas com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async testOneSignalNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { oneSignalService } = await import('../services/onesignal.service');
      const userId = req.user!.userId;

      // Enviar notificação de teste para o usuário atual
      await oneSignalService.sendNotification({
        title: '🔔 Teste de Notificação Push',
        message: 'Esta é uma notificação de teste do OneSignal! Se você recebeu isso, as notificações push estão funcionando corretamente.',
        userIds: [userId],
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings`,
        data: {
          type: 'TEST_NOTIFICATION',
          timestamp: new Date().toISOString(),
        },
      });

      res.json({ message: 'Notificação de teste enviada com sucesso! Verifique seu dispositivo.' });
    } catch (error) {
      next(error);
    }
  }
}

