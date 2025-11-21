import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { prisma } from '../utils/prisma';

export class OneSignalService {
  private readonly appId: string;
  private readonly restApiKey: string;
  private readonly apiUrl = 'https://onesignal.com/api/v1';

  constructor() {
    this.appId = config.onesignal.appId;
    this.restApiKey = config.onesignal.restApiKey;
  }

  /**
   * Envia notificação push para um ou mais usuários
   */
  async sendNotification(data: {
    title: string;
    message: string;
    userIds?: string[];
    playerIds?: string[];
    url?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    try {
      // Se userIds for fornecido, buscar os playerIds dos usuários
      let playerIds: string[] = [];
      
      if (data.userIds && data.userIds.length > 0) {
        const users = await prisma.user.findMany({
          where: { id: { in: data.userIds }, isActive: true },
          select: { onesignalPlayerId: true },
        });
        
        playerIds = users
          .map((u) => u.onesignalPlayerId)
          .filter((id): id is string => !!id);
      } else if (data.playerIds) {
        playerIds = data.playerIds;
      }

      if (playerIds.length === 0) {
        logger.warn('Nenhum player ID encontrado para enviar notificação');
        return;
      }

      const payload = {
        app_id: this.appId,
        include_player_ids: playerIds,
        headings: { en: data.title, pt: data.title },
        contents: { en: data.message, pt: data.message },
        ...(data.url && { url: data.url }),
        ...(data.data && { data: data.data }),
      };

      const response = await axios.post(
        `${this.apiUrl}/notifications`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            // OneSignal REST API v1 usa Basic Auth com a REST API Key como password
            Authorization: `Basic ${this.restApiKey}`,
          },
        }
      );

      logger.info('Notificação OneSignal enviada', {
        recipients: playerIds.length,
        notificationId: response.data.id,
      });
    } catch (error: any) {
      logger.error('Erro ao enviar notificação OneSignal', {
        error: error.message,
        response: error.response?.data,
      });
      // Não lançar erro para não quebrar o fluxo principal
    }
  }

  /**
   * Envia notificação para todos os usuários (global)
   */
  async sendGlobalNotification(data: {
    title: string;
    message: string;
    url?: string;
    data?: Record<string, any>;
  }): Promise<void> {
    try {
      const payload: any = {
        app_id: this.appId,
        included_segments: ['All'],
        headings: { en: data.title, pt: data.title },
        contents: { en: data.message, pt: data.message },
      };

      if (data.url) {
        payload.url = data.url;
      }

      if (data.data) {
        payload.data = data.data;
      }

      const response = await axios.post(
        `${this.apiUrl}/notifications`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            // OneSignal REST API v1 usa Basic Auth com a REST API Key como password
            Authorization: `Basic ${this.restApiKey}`,
          },
        }
      );

      logger.info('Notificação global OneSignal enviada', {
        notificationId: response.data.id,
      });
    } catch (error: any) {
      logger.error('Erro ao enviar notificação global OneSignal', {
        error: error.message,
        response: error.response?.data,
      });
    }
  }
}

export const oneSignalService = new OneSignalService();

