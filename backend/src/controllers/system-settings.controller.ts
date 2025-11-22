import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { SystemSettingsService } from '../services/system-settings.service';

const systemSettingsService = new SystemSettingsService();

const updateSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
  category: z.string().optional(),
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
}

