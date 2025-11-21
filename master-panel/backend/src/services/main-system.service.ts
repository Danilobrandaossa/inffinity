import axios from 'axios';

export class MainSystemService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.MAIN_SYSTEM_URL || 'http://localhost:3001';
    this.apiKey = process.env.MAIN_SYSTEM_API_KEY || 'master-panel-api-key-2024';
  }

  // Obter estatísticas do sistema principal
  async getSystemStats() {
    try {
      const response = await axios.get(`${this.baseURL}/api/stats`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas do sistema principal:', error);
      throw error;
    }
  }

  // Obter usuários do sistema principal
  async getUsers() {
    try {
      const response = await axios.get(`${this.baseURL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      throw error;
    }
  }

  // Obter embarcações do sistema principal
  async getVessels() {
    try {
      const response = await axios.get(`${this.baseURL}/api/vessels`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter embarcações:', error);
      throw error;
    }
  }

  // Obter reservas do sistema principal
  async getBookings() {
    try {
      const response = await axios.get(`${this.baseURL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter reservas:', error);
      throw error;
    }
  }

  // Criar usuário no sistema principal
  async createUser(userData: any) {
    try {
      const response = await axios.post(`${this.baseURL}/api/users`, userData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  // Atualizar usuário no sistema principal
  async updateUser(userId: string, userData: any) {
    try {
      const response = await axios.put(`${this.baseURL}/api/users/${userId}`, userData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  // Suspender usuário no sistema principal
  async suspendUser(userId: string, reason: string) {
    try {
      const response = await axios.post(`${this.baseURL}/api/users/${userId}/suspend`, {
        reason
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao suspender usuário:', error);
      throw error;
    }
  }

  // Ativar usuário no sistema principal
  async activateUser(userId: string) {
    try {
      const response = await axios.post(`${this.baseURL}/api/users/${userId}/activate`, {}, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao ativar usuário:', error);
      throw error;
    }
  }

  // Obter logs de auditoria do sistema principal
  async getAuditLogs(params?: any) {
    try {
      const response = await axios.get(`${this.baseURL}/api/audit`, {
        params,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      throw error;
    }
  }

  // Health check do sistema principal
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      console.error('Erro no health check:', error);
      throw error;
    }
  }
}

export default new MainSystemService();





