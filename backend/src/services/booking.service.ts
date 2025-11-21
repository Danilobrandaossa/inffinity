import { prisma } from '../utils/prisma';
import { AppError } from '../middleware/error-handler';
import { BookingStatus } from '@prisma/client';
import { startOfDay, isBefore, isAfter, differenceInHours, addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { WeeklyBlockService } from './weekly-block.service';
import { logger } from '../utils/logger';
import { oneSignalService } from './onesignal.service';

const weeklyBlockService = new WeeklyBlockService();

export class BookingService {
  async create(
    data: {
      vesselId: string;
      bookingDate: Date;
      notes?: string;
    },
    userId: string,
    ip?: string
  ) {
    // 1. Verificar se usuário tem acesso à embarcação
    const userVessel = await prisma.userVessel.findUnique({
      where: {
        userId_vesselId: {
          userId,
          vesselId: data.vesselId,
        },
      },
      include: {
        vessel: {
          include: {
            bookingLimit: true,
          },
        },
        user: true,
      },
    });

    // Verificar se o usuário é admin - admins podem fazer reservas em qualquer embarcação
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true }
    });

    if (!userVessel && user?.role !== 'ADMIN') {
      throw new AppError(403, 'Você não tem acesso a esta embarcação');
    }

    // Se for admin e não tiver userVessel, buscar a embarcação diretamente
    let vessel, bookingLimit;
    if (userVessel) {
      vessel = userVessel.vessel;
      bookingLimit = vessel.bookingLimit;
    } else if (user?.role === 'ADMIN') {
      vessel = await prisma.vessel.findUnique({
        where: { id: data.vesselId },
        include: { bookingLimit: true }
      });
      if (!vessel) {
        throw new AppError(404, 'Embarcação não encontrada');
      }
      bookingLimit = vessel.bookingLimit;
    }

    // 1.1 Verificar status do usuário (apenas para usuários normais, admins podem sempre reservar)
    if (userVessel && userVessel.user.status === 'BLOCKED') {
      throw new AppError(403, 'Sua conta está bloqueada. Entre em contato com o administrador.');
    }

    if (userVessel && userVessel.user.status === 'OVERDUE_PAYMENT') {
      throw new AppError(403, 'Você possui pagamentos em atraso. Regularize sua situação para continuar fazendo reservas.');
    }

    if (userVessel && userVessel.user.status === 'OVERDUE') {
      throw new AppError(403, 'Você possui pendências. Por favor, regularize sua situação para continuar fazendo reservas.');
    }

    // 2. Verificar antecedência mínima de 24h
    const now = new Date();
    const bookingDateTime = startOfDay(new Date(data.bookingDate));
    const hoursDifference = differenceInHours(bookingDateTime, now);

    if (hoursDifference < 24) {
      throw new AppError(400, 'Reservas devem ser feitas com no mínimo 24 horas de antecedência');
    }

    // 3. Verificar se a data não está no passado
    if (isBefore(bookingDateTime, startOfDay(now))) {
      throw new AppError(400, 'Não é possível reservar datas passadas');
    }

    // 4. Verificar limite máximo de dias à frente (configurado por embarcação)
    const maxDaysAhead = vessel?.calendarDaysAhead || 62;
    const maxAllowedDate = addDays(startOfDay(now), maxDaysAhead);
    if (isAfter(bookingDateTime, maxAllowedDate)) {
      throw new AppError(400, `Reservas só podem ser feitas até ${maxDaysAhead} dias à frente (até ${maxAllowedDate.toLocaleDateString('pt-BR')})`);
    }

    // 5. Verificar se a data está bloqueada
    const blockedDate = await prisma.blockedDate.findFirst({
      where: {
        vesselId: data.vesselId,
        startDate: { lte: bookingDateTime },
        endDate: { gte: bookingDateTime },
      },
    });

    if (blockedDate) {
      throw new AppError(400, `Data bloqueada: ${blockedDate.notes || blockedDate.reason}`);
    }

    // 6. Verificar bloqueios semanais (apenas para usuários normais, admins podem sempre reservar)
    if (userVessel) {
      const weeklyBlock = await weeklyBlockService.isDateBlockedByWeeklyBlock(bookingDateTime);
      if (weeklyBlock.isBlocked) {
        throw new AppError(400, `Data bloqueada (${weeklyBlock.reason}): ${weeklyBlock.notes || 'Bloqueio semanal ativo'}`);
      }
    }

    // 7. Verificar se já existe reserva ATIVA para esta data (canceladas não contam)
    // Buscar todas as reservas para esta data e embarcação
    const allBookingsForDate = await prisma.booking.findMany({
      where: {
        vesselId: data.vesselId,
        bookingDate: bookingDateTime,
      },
      select: {
        id: true,
        status: true,
        userId: true,
      },
    });

    // Verificar se existe alguma reserva ATIVA (não cancelada)
    const activeBooking = allBookingsForDate.find(
      (b) => b.status !== BookingStatus.CANCELLED
    );

    if (activeBooking) {
      logger.warn('Tentativa de criar reserva em data ocupada', {
        vesselId: data.vesselId,
        bookingDate: bookingDateTime,
        existingBookingId: activeBooking.id,
        existingStatus: activeBooking.status,
      });
      throw new AppError(409, 'Já existe uma reserva para esta data');
    }

    // Se só existem reservas canceladas, permitir criar nova reserva
    if (allBookingsForDate.length > 0) {
      logger.info('Permitindo nova reserva em data com reservas canceladas', {
        vesselId: data.vesselId,
        bookingDate: bookingDateTime,
        cancelledCount: allBookingsForDate.filter(b => b.status === BookingStatus.CANCELLED).length,
      });
    }

    // 7. Verificar limite de reservas ativas NESTA EMBARCAÇÃO
    const maxActiveBookings = bookingLimit?.maxActiveBookings || 2;
    
    // Buscar reservas ativas APENAS NESTA EMBARCAÇÃO
    const activeBookingsThisVessel = await prisma.booking.findMany({
      where: {
        userId,
        vesselId: data.vesselId, // Importante: apenas desta embarcação
        status: { in: ['PENDING', 'APPROVED'] },
        bookingDate: { gte: startOfDay(now) },
      },
      orderBy: { bookingDate: 'asc' },
    });

    if (activeBookingsThisVessel.length >= maxActiveBookings) {
      // Verificar se a primeira reserva já passou
      const firstBooking = activeBookingsThisVessel[0];
      if (isAfter(startOfDay(now), new Date(firstBooking.bookingDate))) {
        // Primeira reserva já passou, pode reservar
      } else {
        throw new AppError(
          400,
          `Limite de ${maxActiveBookings} reservas ativas atingido para ${vessel?.name}. Você poderá reservar novamente nesta embarcação após a data ${new Date(firstBooking.bookingDate).toLocaleDateString('pt-BR')} passar.`
        );
      }
    }

    // 8. Criar a reserva
    const booking = await prisma.booking.create({
      data: {
        userId,
        vesselId: data.vesselId,
        bookingDate: bookingDateTime,
        status: BookingStatus.APPROVED, // Auto-aprovar
        notes: data.notes,
        createdByIp: ip,
      },
      include: {
        user: true, // Incluir todos os campos do usuário (incluindo onesignalPlayerId)
        vessel: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    // 8. Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BOOKING_CREATED',
        entityType: 'booking',
        entityId: booking.id,
        ipAddress: ip,
        details: {
          vesselName: booking.vessel.name,
          bookingDate: booking.bookingDate,
        },
      },
    });

    // 9. Enviar notificação push via OneSignal
    try {
      // Usar playerId diretamente se disponível, senão usar userId
      const userPlayerId = (booking.user as any)?.onesignalPlayerId;
      const playerIds = userPlayerId ? [userPlayerId] : undefined;
      
      await oneSignalService.sendNotification({
        title: '✅ Reserva Confirmada',
        message: `Sua reserva para ${booking.vessel.name} no dia ${format(bookingDateTime, 'dd/MM/yyyy', { locale: ptBR })} foi confirmada!`,
        ...(playerIds ? { playerIds } : { userIds: [userId] }),
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings`,
        data: {
          bookingId: booking.id,
          vesselId: data.vesselId,
          bookingDate: bookingDateTime.toISOString(),
        },
      });
    } catch (error) {
      logger.error('Erro ao enviar push notification:', error);
      // Não bloquear a criação da reserva se a notificação falhar
    }

    return booking;
  }

  async findAll(filters?: {
    userId?: string;
    vesselId?: string;
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
    excludeCancelled?: boolean;
  }) {
    return prisma.booking.findMany({
      where: {
        ...(filters?.userId && { userId: filters.userId }),
        ...(filters?.vesselId && { vesselId: filters.vesselId }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && {
          bookingDate: { gte: filters.startDate },
        }),
        ...(filters?.endDate && {
          bookingDate: { lte: filters.endDate },
        }),
        // Excluir reservas canceladas por padrão para evitar confusão
        // Só aplicar se não foi especificado um status específico
        ...(filters?.excludeCancelled && !filters?.status && {
          status: { not: BookingStatus.CANCELLED },
        }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vessel: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
      orderBy: { bookingDate: 'desc' },
    });
  }

  async findById(id: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        vessel: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            capacity: true,
          },
        },
      },
    });

    if (!booking) {
      throw new AppError(404, 'Reserva não encontrada');
    }

    return booking;
  }

  async getCalendar(vesselId: string, startDate: Date, endDate: Date) {
    // Buscar todas as reservas no período
    const bookings = await prisma.booking.findMany({
      where: {
        vesselId,
        bookingDate: {
          gte: startOfDay(startDate),
          lte: startOfDay(endDate),
        },
        status: { in: ['PENDING', 'APPROVED'] },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Buscar datas bloqueadas no período
    const blockedDates = await prisma.blockedDate.findMany({
      where: {
        vesselId,
        OR: [
          {
            startDate: { lte: endDate },
            endDate: { gte: startDate },
          },
        ],
      },
    });

    // Buscar bloqueios semanais ativos
    const activeWeeklyBlocks = await weeklyBlockService.getActiveWeeklyBlocks();

    return {
      bookings,
      blockedDates,
      weeklyBlocks: activeWeeklyBlocks,
    };
  }

  async cancel(id: string, userId: string, isAdmin: boolean, reason?: string) {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        vessel: true,
      },
    });

    if (!booking) {
      throw new AppError(404, 'Reserva não encontrada');
    }

    // Verificar permissão
    if (!isAdmin && booking.userId !== userId) {
      throw new AppError(403, 'Você não tem permissão para cancelar esta reserva');
    }

    // Verificar se a reserva já foi cancelada
    if (booking.status === BookingStatus.CANCELLED) {
      throw new AppError(400, 'Esta reserva já foi cancelada');
    }

    // Verificar se a reserva já passou
    if (booking.status === BookingStatus.COMPLETED) {
      throw new AppError(400, 'Não é possível cancelar uma reserva concluída');
    }

    // Cancelar a reserva
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: reason,
      },
      include: {
        user: true, // Incluir todos os campos do usuário (incluindo onesignalPlayerId)
        vessel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'BOOKING_CANCELLED',
        entityType: 'booking',
        entityId: id,
        details: {
          vesselName: booking.vessel.name,
          bookingDate: booking.bookingDate,
          reason,
        },
      },
    });

    // Enviar notificação push via OneSignal
    try {
      await oneSignalService.sendNotification({
        title: '❌ Reserva Cancelada',
        message: `Sua reserva para ${booking.vessel.name} no dia ${format(new Date(booking.bookingDate), 'dd/MM/yyyy', { locale: ptBR })} foi cancelada.${reason ? ` Motivo: ${reason}` : ''}`,
        userIds: [booking.userId],
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/bookings`,
        data: {
          bookingId: id,
          vesselId: booking.vesselId,
          status: 'CANCELLED',
        },
      });
    } catch (error) {
      logger.error('Erro ao enviar push notification:', error);
      // Não bloquear o cancelamento se a notificação falhar
    }

    return updatedBooking;
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    updatedBy: string
  ) {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        vessel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: updatedBy,
        action: 'BOOKING_UPDATED',
        entityType: 'booking',
        entityId: id,
        details: {
          status,
          vesselName: booking.vessel.name,
          bookingDate: booking.bookingDate,
        },
      },
    });

    return booking;
  }

  async delete(id: string, deletedBy: string) {
    await prisma.booking.delete({
      where: { id },
    });

    // Log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: deletedBy,
        action: 'BOOKING_DELETED',
        entityType: 'booking',
        entityId: id,
      },
    });
  }
}

