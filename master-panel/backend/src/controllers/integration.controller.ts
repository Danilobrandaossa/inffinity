import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error-handler';
import { logger } from '../utils/logger';
import mainSystemService from '../services/main-system.service';

const prisma = new PrismaClient();

export class IntegrationController {
  async getMainSystemUsers(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { page = 1, limit = 10, search, role, status } = req.query;

      const users = await mainSystemService.getUsers();
      
      // Filtrar usuários se necessário
      let filteredUsers = users.data || [];
      
      if (search) {
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(search.toString().toLowerCase()) ||
          user.email.toLowerCase().includes(search.toString().toLowerCase())
        );
      }

      if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
      }

      if (status) {
        filteredUsers = filteredUsers.filter(user => user.status === status);
      }

      // Paginação
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredUsers.length,
          pages: Math.ceil(filteredUsers.length / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Erro ao obter usuários do sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getMainSystemVessels(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { page = 1, limit = 10, search, status } = req.query;

      const vessels = await mainSystemService.getVessels();
      
      // Filtrar embarcações se necessário
      let filteredVessels = vessels.data || [];
      
      if (search) {
        filteredVessels = filteredVessels.filter(vessel => 
          vessel.name.toLowerCase().includes(search.toString().toLowerCase()) ||
          vessel.description?.toLowerCase().includes(search.toString().toLowerCase())
        );
      }

      if (status) {
        filteredVessels = filteredVessels.filter(vessel => vessel.isActive === (status === 'active'));
      }

      // Paginação
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedVessels = filteredVessels.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedVessels,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredVessels.length,
          pages: Math.ceil(filteredVessels.length / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Erro ao obter embarcações do sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getMainSystemBookings(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;

      const bookings = await mainSystemService.getBookings();
      
      // Filtrar reservas se necessário
      let filteredBookings = bookings.data || [];
      
      if (status) {
        filteredBookings = filteredBookings.filter(booking => booking.status === status);
      }

      if (dateFrom) {
        filteredBookings = filteredBookings.filter(booking => 
          new Date(booking.startDate) >= new Date(dateFrom.toString())
        );
      }

      if (dateTo) {
        filteredBookings = filteredBookings.filter(booking => 
          new Date(booking.startDate) <= new Date(dateTo.toString())
        );
      }

      // Paginação
      const startIndex = (Number(page) - 1) * Number(limit);
      const endIndex = startIndex + Number(limit);
      const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedBookings,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: filteredBookings.length,
          pages: Math.ceil(filteredBookings.length / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Erro ao obter reservas do sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async createMainSystemUser(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const userData = req.body;

      const newUser = await mainSystemService.createUser(userData);

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: 'MAIN_SYSTEM_USER_CREATED',
          entityType: 'User',
          entityId: newUser.id,
          details: {
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuário criado com sucesso no sistema principal'
      });
    } catch (error) {
      logger.error('Erro ao criar usuário no sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async updateMainSystemUser(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { userId } = req.params;
      const userData = req.body;

      const updatedUser = await mainSystemService.updateUser(userId, userData);

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: 'MAIN_SYSTEM_USER_UPDATED',
          entityType: 'User',
          entityId: userId,
          details: {
            changes: userData,
            email: updatedUser.email
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao atualizar usuário no sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async suspendMainSystemUser(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { userId } = req.params;
      const { reason } = req.body;

      const result = await mainSystemService.suspendUser(userId, reason);

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: 'MAIN_SYSTEM_USER_SUSPENDED',
          entityType: 'User',
          entityId: userId,
          details: {
            reason,
            email: result.email
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: result,
        message: 'Usuário suspenso com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao suspender usuário no sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async activateMainSystemUser(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { userId } = req.params;

      const result = await mainSystemService.activateUser(userId);

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: 'MAIN_SYSTEM_USER_ACTIVATED',
          entityType: 'User',
          entityId: userId,
          details: {
            email: result.email
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: result,
        message: 'Usuário ativado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao ativar usuário no sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getMainSystemAuditLogs(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;
      const { page = 1, limit = 50, action, userId, dateFrom, dateTo } = req.query;

      const params = {
        page: Number(page),
        limit: Number(limit),
        action,
        userId,
        dateFrom,
        dateTo
      };

      const auditLogs = await mainSystemService.getAuditLogs(params);

      res.json({
        success: true,
        data: auditLogs.data || [],
        pagination: auditLogs.pagination || {
          page: Number(page),
          limit: Number(limit),
          total: 0,
          pages: 0
        }
      });
    } catch (error) {
      logger.error('Erro ao obter logs de auditoria do sistema principal:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getSystemStatus(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;

      // Verificar status do Master Panel
      const masterStatus = {
        status: 'online',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: process.uptime()
      };

      // Verificar status do sistema principal
      let mainSystemStatus = null;
      try {
        const healthCheck = await mainSystemService.healthCheck();
        mainSystemStatus = {
          status: 'online',
          timestamp: new Date().toISOString(),
          ...healthCheck
        };
      } catch (error) {
        mainSystemStatus = {
          status: 'offline',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }

      res.json({
        success: true,
        data: {
          master: masterStatus,
          mainSystem: mainSystemStatus,
          overall: mainSystemStatus.status === 'online' ? 'online' : 'degraded'
        }
      });
    } catch (error) {
      logger.error('Erro ao verificar status dos sistemas:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }
}





