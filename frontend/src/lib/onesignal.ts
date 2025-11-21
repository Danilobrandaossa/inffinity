// Serviço para gerenciar OneSignal no frontend

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: any[];
  }
}

export class OneSignalService {
  private static instance: OneSignalService;
  private initialized = false;

  private constructor() {}

  static getInstance(): OneSignalService {
    if (!OneSignalService.instance) {
      OneSignalService.instance = new OneSignalService();
    }
    return OneSignalService.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Aguardar OneSignal estar disponível
      await this.waitForOneSignal();

      const OneSignal = window.OneSignal;
      if (!OneSignal) {
        console.warn('OneSignal não está disponível');
        return;
      }

      // Verificar se já está inicializado
      const isInitialized = await OneSignal.isPushNotificationsEnabled();
      if (isInitialized) {
        this.initialized = true;
        return;
      }

      // Solicitar permissão de notificação
      await OneSignal.showNativePrompt();

      // Obter player ID e enviar para o backend
      const playerId = await OneSignal.getUserId();
      if (playerId) {
        await this.registerPlayerId(playerId);
      }

      // Listener para quando o player ID mudar
      OneSignal.on('subscriptionChange', async (isSubscribed: boolean) => {
        if (isSubscribed) {
          const playerId = await OneSignal.getUserId();
          if (playerId) {
            await this.registerPlayerId(playerId);
          }
        }
      });

      this.initialized = true;
    } catch (error) {
      console.error('Erro ao inicializar OneSignal:', error);
    }
  }

  private async waitForOneSignal(): Promise<void> {
    return new Promise((resolve) => {
      if (window.OneSignal) {
        resolve();
        return;
      }

      const checkInterval = setInterval(() => {
        if (window.OneSignal) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout após 5 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  private async registerPlayerId(playerId: string): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/users/onesignal-player-id`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) {
        console.error('Erro ao registrar player ID:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao registrar player ID:', error);
    }
  }

  async getPlayerId(): Promise<string | null> {
    try {
      await this.waitForOneSignal();
      const OneSignal = window.OneSignal;
      if (!OneSignal) return null;
      return await OneSignal.getUserId();
    } catch (error) {
      console.error('Erro ao obter player ID:', error);
      return null;
    }
  }

  async isSubscribed(): Promise<boolean> {
    try {
      await this.waitForOneSignal();
      const OneSignal = window.OneSignal;
      if (!OneSignal) return false;
      return await OneSignal.isPushNotificationsEnabled();
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
      return false;
    }
  }
}

export const oneSignalService = OneSignalService.getInstance();

