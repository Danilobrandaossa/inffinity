import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { UserRole } from '@prisma/client';

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
      if (user) targetUsers = [user];
    } else if (data.userIds && data.userIds.length > 0) {
      // Múltiplos usuários específicos
      targetUsers = await prisma.user.findMany({
        where: { id: { in: data.userIds }, isActive: true }
      });
    } else if (data.vesselId) {
      // Todos os usuários de uma embarcação específica
      const userVessels = await prisma.userVessel.findMany({
        where: { vesselId: data.vesselId },
        include: { user: true }
      });
      targetUsers = userVessels.map(uv => uv.user);
    } else if (data.isGlobal || data.targetRole) {
      // Global ou por role
      targetUsers = await prisma.user.findMany({
        where: {
          isActive: true,
          ...(data.targetRole && { role: data.targetRole }),
        },
      });
    }

      // Criar UserNotification para os usuários determinados
      if (targetUsers.length > 0) {
        await prisma.userNotification.createMany({
          data: targetUsers.map((user) => ({
            userId: user.id,
            notificationId: notification.id,
          })),
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

