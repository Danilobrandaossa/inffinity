import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class SystemSettingsService {
  /**
   * Obter uma configuração por chave
   */
  async get(key: string): Promise<string | null> {
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  /**
   * Obter todas as configurações de uma categoria
   */
  async getByCategory(category: string): Promise<Record<string, string>> {
    const settings = await prisma.systemSettings.findMany({
      where: { category },
    });
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Obter todas as configurações
   */
  async getAll(): Promise<Record<string, string>> {
    const settings = await prisma.systemSettings.findMany();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Criar ou atualizar uma configuração
   */
  async set(key: string, value: string, category: string = 'general'): Promise<void> {
    await prisma.systemSettings.upsert({
      where: { key },
      update: { value, category },
      create: { key, value, category },
    });
    logger.info('Configuração do sistema atualizada', { key, category });
  }

  /**
   * Atualizar múltiplas configurações
   */
  async setMany(settings: Array<{ key: string; value: string; category?: string }>): Promise<void> {
    for (const setting of settings) {
      await this.set(setting.key, setting.value, setting.category || 'general');
    }
  }

  /**
   * Obter configurações do OneSignal
   */
  async getOneSignalConfig(): Promise<{ appId: string; restApiKey: string }> {
    const appId = await this.get('ONESIGNAL_APP_ID');
    const restApiKey = await this.get('ONESIGNAL_REST_API_KEY');

    return {
      appId: appId || process.env.ONESIGNAL_APP_ID || '',
      restApiKey: restApiKey || process.env.ONESIGNAL_REST_API_KEY || '',
    };
  }

  /**
   * Atualizar configurações do OneSignal
   */
  async setOneSignalConfig(appId: string, restApiKey: string): Promise<void> {
    await this.set('ONESIGNAL_APP_ID', appId, 'onesignal');
    await this.set('ONESIGNAL_REST_API_KEY', restApiKey, 'onesignal');
  }
}

