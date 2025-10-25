import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { logger } from '../utils/logger';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  // Dashboard completo
  async getDashboard(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getDashboardData();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar dados do dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas gerais
  async getGeneralStats(_req: Request, res: Response) {
    try {
      const stats = await analyticsService.getGeneralStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas gerais:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Reservas por mês
  async getBookingsByMonth(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getBookingsByMonth();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar reservas por mês:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Reservas por embarcação
  async getBookingsByVessel(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getBookingsByVessel();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar reservas por embarcação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Status de pagamentos
  async getPaymentStatus(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getPaymentStatus();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar status de pagamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Receita por mês
  async getRevenueByMonth(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getRevenueByMonth();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar receita por mês:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Usuários por status
  async getUsersByStatus(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getUsersByStatus();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar usuários por status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Atividade recente
  async getRecentActivity(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await analyticsService.getRecentActivity(limit);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar atividade recente:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Estatísticas de uso das embarcações
  async getVesselUsageStats(_req: Request, res: Response) {
    try {
      const data = await analyticsService.getVesselUsageStats();

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Erro ao buscar estatísticas de uso das embarcações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

