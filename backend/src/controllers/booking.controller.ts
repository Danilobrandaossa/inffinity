import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { BookingService } from '../services/booking.service';
import { BookingStatus, UserRole } from '@prisma/client';

const bookingService = new BookingService();

const createBookingSchema = z.object({
  vesselId: z.string().uuid('ID da embarcação inválido'),
  bookingDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  notes: z.string().optional(),
});

const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
});

export class BookingController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createBookingSchema.parse(req.body);
      const userId = req.user!.userId;
      const ip = req.ip || req.socket.remoteAddress;

      const booking = await bookingService.create(
        {
          vesselId: data.vesselId,
          bookingDate: new Date(data.bookingDate),
          notes: data.notes,
        },
        userId,
        ip
      );

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { vesselId, status, startDate, endDate } = req.query;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      const filters: any = {};

      // Usuários normais só veem suas próprias reservas
      if (userRole !== UserRole.ADMIN) {
        filters.userId = userId;
      }

      if (vesselId) filters.vesselId = vesselId as string;
      if (status) filters.status = status as BookingStatus;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const bookings = await bookingService.findAll(filters);

      res.json(bookings);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const booking = await bookingService.findById(id);

      // Verificar permissão
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      if (userRole !== UserRole.ADMIN && booking.user.id !== userId) {
        return res.status(403).json({ error: 'Sem permissão para ver esta reserva' });
      }

      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async getCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { vesselId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'startDate e endDate são obrigatórios' });
      }

      const calendar = await bookingService.getCalendar(
        vesselId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(calendar);
    } catch (error) {
      next(error);
    }
  }

  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { reason } = cancelBookingSchema.parse(req.body);
      const userId = req.user!.userId;
      const isAdmin = req.user!.role === UserRole.ADMIN;

      const booking = await bookingService.cancel(id, userId, isAdmin, reason);

      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = updateStatusSchema.parse(req.body);
      const updatedBy = req.user!.userId;

      const booking = await bookingService.updateStatus(id, status, updatedBy);

      res.json(booking);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedBy = req.user!.userId;

      await bookingService.delete(id, deletedBy);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}



