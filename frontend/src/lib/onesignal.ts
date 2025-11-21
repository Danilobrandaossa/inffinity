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
    if (this.initialized) {
      // Mesmo se já inicializado, verificar e registrar player ID
      await this.ensurePlayerIdRegistered();
      return;
    }

    try {
      // Aguardar OneSignal estar disponível
      await this.waitForOneSignal();

      const OneSignal = window.OneSignal;
      if (!OneSignal) {
        console.warn('OneSignal não está disponível');
        return;
      }

      // Verificar se já está inscrito
      const isSubscribed = await OneSignal.isPushNotificationsEnabled();
      
      if (!isSubscribed) {
        // Solicitar permissão de notificação
        try {
          await OneSignal.showNativePrompt();
        } catch (error) {
          console.warn('Erro ao solicitar permissão de notificação:', error);
        }
      }

      // Aguardar um pouco para o player ID ser gerado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Obter player ID e enviar para o backend
      await this.ensurePlayerIdRegistered();

      // Listener para quando o player ID mudar ou subscription mudar
      OneSignal.on('subscriptionChange', async (isSubscribed: boolean) => {
        console.log('OneSignal subscription changed:', isSubscribed);
        if (isSubscribed) {
          await this.ensurePlayerIdRegistered();
        }
      });

      // Listener para quando o player ID for obtido
      OneSignal.on('permissionPromptDisplay', () => {
        console.log('OneSignal permission prompt displayed');
      });

      this.initialized = true;
      console.log('OneSignal inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar OneSignal:', error);
    }
  }

  /**
   * Garantir que o player ID está registrado no backend
   */
  private async ensurePlayerIdRegistered(): Promise<void> {
    try {
      await this.waitForOneSignal();
      const OneSignal = window.OneSignal;
      if (!OneSignal) return;

      // Tentar obter player ID várias vezes (pode demorar para ser gerado)
      let playerId: string | null = null;
      for (let i = 0; i < 5; i++) {
        playerId = await OneSignal.getUserId();
        if (playerId) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (playerId) {
        console.log('OneSignal Player ID obtido:', playerId);
        await this.registerPlayerId(playerId);
      } else {
        console.warn('OneSignal Player ID não disponível ainda');
      }
    } catch (error) {
      console.error('Erro ao garantir registro do player ID:', error);
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

