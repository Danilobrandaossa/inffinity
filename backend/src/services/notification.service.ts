import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { UserRole } from '@prisma/client';
import { logger } from '../utils/logger';

export class NotificationService {
  async create(data: {
    title: string;
    message: string;
    type: string;
    isGlobal?: boolean;
    targetRole?: UserRole;
    vesselId?: string;
    userId?: string; // Para notificação específica a um usuário
    userIds?: string[]; // Para múltiplos usuários específicos
    expiresAt?: Date;
  }) {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        isGlobal: data.isGlobal || false,
        targetRole: data.targetRole,
        vesselId: data.vesselId,
        expiresAt: data.expiresAt,
        isActive: true,
      },
    });

    let targetUsers: any[] = [];

    // Determinar usuários destinatários
    if (data.userId) {
      // Usuário específico
      const user = await prisma.user.findUnique({ where: { id: data.userId } });
      if (user) {
        targetUsers = [user];
        logger.info('[NotificationService] Notificação para usuário específico', { 
          userId: data.userId,
          notificationId: notification.id 
        });
      } else {
        logger.warn('[NotificationService] Usuário não encontrado', { userId: data.userId });
      }
    } else if (data.userIds && data.userIds.length > 0) {
      // Múltiplos usuários específicos
      targetUsers = await prisma.user.findMany({
        where: { id: { in: data.userIds }, isActive: true }
      });
      logger.info('[NotificationService] Notificação para múltiplos usuários', { 
        userIdsCount: data.userIds.length,
        foundCount: targetUsers.length,
        notificationId: notification.id 
      });
    } else if (data.vesselId) {
      // Todos os usuários de uma embarcação específica
      const userVessels = await prisma.userVessel.findMany({
        where: { vesselId: data.vesselId },
        include: { user: true }
      });
      targetUsers = userVessels.map(uv => uv.user).filter(user => user !== null);
      logger.info('[NotificationService] Notificação para embarcação', { 
        vesselId: data.vesselId,
        usersCount: targetUsers.length,
        notificationId: notification.id 
      });
    } else if (data.isGlobal || data.targetRole) {
      // Global ou por role - IMPORTANTE: não filtrar por isActive para garantir que todos recebam
      targetUsers = await prisma.user.findMany({
        where: {
          ...(data.targetRole && { role: data.targetRole }),
        },
      });
      logger.info('[NotificationService] Notificação global ou por role', { 
        isGlobal: data.isGlobal,
        targetRole: data.targetRole,
        usersCount: targetUsers.length,
        notificationId: notification.id 
      });
    }

    // Criar UserNotification para os usuários determinados
    if (targetUsers.length > 0) {
      try {
        const userNotificationData = targetUsers
          .filter(user => user !== null && user !== undefined)
          .map((user) => ({
            userId: user.id,
            notificationId: notification.id,
          }));

        if (userNotificationData.length > 0) {
          const result = await prisma.userNotification.createMany({
            data: userNotificationData,
            skipDuplicates: true, // Evitar erros se já existir
          });
          
          logger.info('[NotificationService] UserNotifications criadas', { 
            notificationId: notification.id,
            createdCount: result.count,
            expectedCount: userNotificationData.length
          });
        } else {
          logger.warn('[NotificationService] Nenhum UserNotification para criar (usuários filtrados)', {
            notificationId: notification.id,
            originalUsersCount: targetUsers.length
          });
        }
      } catch (error: any) {
        logger.error('[NotificationService] Erro ao criar UserNotifications', {
          error: error.message,
          notificationId: notification.id,
          usersCount: targetUsers.length
        });
        // Não bloquear a criação da notificação se houver erro ao vincular usuários
        // A notificação foi criada, mesmo que alguns vínculos falhem
      }
    } else {
      logger.warn('[NotificationService] Nenhum usuário destinatário encontrado', {
        notificationId: notification.id,
        data: {
          userId: data.userId,
          userIds: data.userIds,
          vesselId: data.vesselId,
          isGlobal: data.isGlobal,
          targetRole: data.targetRole
        }
      });
    }

    return notification;
  }

  async findAll(filters?: {
    isActive?: boolean;
    type?: string;
  }) {
    return prisma.notification.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    const userNotifications = await prisma.userNotification.findMany({
      where: {
        userId,
        notification: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      },
      include: {
        notification: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return userNotifications;
  }

  async markAsRead(userId: string, notificationId: string) {
    const userNotification = await prisma.userNotification.findUnique({
      where: {
        userId_notificationId: {
          userId,
          notificationId,
        },
      },
    });

    if (!userNotification) {
      throw new AppError(404, 'Notificação não encontrada');
    }

    return prisma.userNotification.update({
      where: {
        id: userNotification.id,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
      include: {
        notification: true,
      },
    });
  }

  async markAllAsRead(userId: string) {
    await prisma.userNotification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.userNotification.count({
      where: {
        userId,
        isRead: false,
        notification: {
          isActive: true,
          OR: [
            { expiresAt: null },
            { expiresAt: { gte: new Date() } },
          ],
        },
      },
    });
  }

  async update(
    id: string,
    data: {
      title?: string;
      message?: string;
      isActive?: boolean;
      expiresAt?: Date;
    }
  ) {
    return prisma.notification.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.notification.delete({
      where: { id },
    });
  }
}

