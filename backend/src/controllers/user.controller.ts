import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UserService } from '../services/user.service';
import { UserRole } from '@prisma/client';

const userService = new UserService();

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  phone: z.string().optional(),
  cpf: z.string().min(11, 'CPF deve ter 11 dígitos').optional(), // CPF será usado como senha
  role: z.nativeEnum(UserRole).optional(),
  vesselIds: z.array(z.string()).optional(),
  // Campos adicionais
  birthDate: z.string().optional(),
  licenseType: z.string().optional(),
  registrationNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  billingDueDay: z.number().min(1).max(31).optional(),
  // Dados de endereço
  address: z.string().optional(),
  zipCode: z.string().optional(),
  addressNumber: z.string().optional(),
  state: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  complement: z.string().optional(),
  // Campos financeiros para embarcações
  vesselFinancials: z.array(z.object({
    vesselId: z.string(),
    totalValue: z.number().min(0).optional(),
    downPayment: z.number().min(0).optional(),
    totalInstallments: z.number().min(0).optional(),
    marinaMonthlyFee: z.number().min(0).optional(),
    marinaDueDay: z.number().min(1).max(31).optional()
  })).optional()
});

const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'OVERDUE', 'OVERDUE_PAYMENT', 'BLOCKED']).optional(),
  vesselIds: z.array(z.string()).optional(),
  // Campos financeiros para embarcações
  vesselFinancials: z.array(z.object({
    vesselId: z.string(),
    totalValue: z.number().min(0).optional(),
    downPayment: z.number().min(0).optional(),
    totalInstallments: z.number().min(0).optional(),
    marinaMonthlyFee: z.number().min(0).optional(),
    marinaDueDay: z.number().min(1).max(31).optional()
  })).optional()
});

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createUserSchema.parse(req.body);
      const createdBy = req.user!.userId;

      const user = await userService.create(data, createdBy);

      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { role, isActive } = req.query;

      const users = await userService.findAll({
        role: role as UserRole,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      });

      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const user = await userService.findById(id);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = updateUserSchema.parse(req.body);
      const updatedBy = req.user!.userId;

      const user = await userService.update(id, data, updatedBy);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deletedBy = req.user!.userId;

      await userService.delete(id, deletedBy);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      await userService.changePassword(userId, currentPassword, newPassword);

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      next(error);
    }
  }
}

