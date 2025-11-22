import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';

export class SystemSettingsService {
  /**
   * Obter uma configuração por chave
   */
  async get(key: string): Promise<string | null> {
    try {
      const setting = await prisma.systemSettings.findUnique({
        where: { key },
      });
      return setting?.value || null;
    } catch (error: any) {
      // Se a tabela não existir, retornar null (configuração não encontrada)
      if (error.code === 'P2021' || error.message?.includes('does not exist')) {
        logger.warn('Tabela system_settings não existe ainda', { key });
        return null;
      }
      throw error;
    }
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
}

