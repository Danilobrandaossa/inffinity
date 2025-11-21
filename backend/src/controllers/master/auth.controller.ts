import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/error-handler';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class MasterAuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password, twoFactorCode } = req.body;

      // Buscar usuário master
      const masterUser = await prisma.masterUser.findUnique({
        where: { email }
      });

      if (!masterUser || !masterUser.isActive) {
        throw new AppError(401, 'Credenciais inválidas');
      }

      // Verificar senha
      const isPasswordValid = await bcrypt.compare(password, masterUser.password);
      if (!isPasswordValid) {
        throw new AppError(401, 'Credenciais inválidas');
      }

      // Verificar 2FA se habilitado
      if (masterUser.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.status(200).json({
            success: true,
            requiresTwoFactor: true,
            message: 'Código 2FA necessário'
          });
        }

        const isValid2FA = speakeasy.totp.verify({
          secret: masterUser.twoFactorSecret!,
          encoding: 'base32',
          token: twoFactorCode,
          window: 2
        });

        if (!isValid2FA) {
          throw new AppError(401, 'Código 2FA inválido');
        }
      }

      // Verificar IP permitido
      const clientIP = req.ip || req.connection.remoteAddress || '';
      if (masterUser.allowedIPs.length > 0 && !masterUser.allowedIPs.includes(clientIP)) {
        throw new AppError(403, 'IP não autorizado');
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          masterUserId: masterUser.id,
          email: masterUser.email,
          role: masterUser.role
        },
        process.env.JWT_SECRET!,
        { expiresIn: '8h' }
      );

      // Criar sessão
      await prisma.masterSession.create({
        data: {
          masterUserId: masterUser.id,
          token,
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 horas
          ipAddress: clientIP,
          userAgent: req.get('User-Agent')
        }
      });

      // Atualizar último login
      await prisma.masterUser.update({
        where: { id: masterUser.id },
        data: {
          lastLoginAt: new Date(),
          lastLoginIp: clientIP
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId: masterUser.id,
          action: 'LOGIN',
          details: {
            email: masterUser.email,
            ipAddress: clientIP,
            userAgent: req.get('User-Agent')
          },
          ipAddress: clientIP,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        data: {
          accessToken: token,
          user: {
            id: masterUser.id,
            email: masterUser.email,
            name: masterUser.name,
            role: masterUser.role,
            twoFactorEnabled: masterUser.twoFactorEnabled
          }
        }
      });
    } catch (error) {
      logger.error('Erro no login master:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async setup2FA(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;

      const masterUser = await prisma.masterUser.findUnique({
        where: { id: masterUserId }
      });

      if (!masterUser) {
        throw new AppError(404, 'Usuário não encontrado');
      }

      // Gerar secret 2FA
      const secret = speakeasy.generateSecret({
        name: `ReservaPro Master (${masterUser.email})`,
        issuer: 'ReservaPro'
      });

      // Gerar QR Code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Salvar secret temporariamente (não habilitar ainda)
      await prisma.masterUser.update({
        where: { id: masterUserId },
        data: {
          twoFactorSecret: secret.base32
        }
      });

      res.json({
        success: true,
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
          manualEntryKey: secret.base32
        }
      });
    } catch (error) {
      logger.error('Erro ao configurar 2FA:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async verify2FA(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const masterUserId = req.user?.id;

      const masterUser = await prisma.masterUser.findUnique({
        where: { id: masterUserId }
      });

      if (!masterUser || !masterUser.twoFactorSecret) {
        throw new AppError(400, '2FA não configurado');
      }

      // Verificar token
      const isValid = speakeasy.totp.verify({
        secret: masterUser.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });

      if (!isValid) {
        throw new AppError(400, 'Token 2FA inválido');
      }

      // Habilitar 2FA
      await prisma.masterUser.update({
        where: { id: masterUserId },
        data: {
          twoFactorEnabled: true
        }
      });

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: '2FA_ENABLED',
          details: { enabled: true },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: '2FA habilitado com sucesso'
      });
    } catch (error) {
      logger.error('Erro ao verificar 2FA:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const masterUserId = req.user?.id;

      if (token) {
        // Invalidar sessão
        await prisma.masterSession.deleteMany({
          where: {
            token,
            masterUserId
          }
        });
      }

      // Log de auditoria
      await prisma.masterAuditLog.create({
        data: {
          masterUserId,
          action: 'LOGOUT',
          details: { token },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });

      res.json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      logger.error('Erro no logout master:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const masterUserId = req.user?.id;

      const masterUser = await prisma.masterUser.findUnique({
        where: { id: masterUserId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          twoFactorEnabled: true,
          allowedIPs: true,
          lastLoginAt: true,
          lastLoginIp: true,
          createdAt: true
        }
      });

      if (!masterUser) {
        throw new AppError(404, 'Usuário não encontrado');
      }

      res.json({
        success: true,
        data: masterUser
      });
    } catch (error) {
      logger.error('Erro ao buscar perfil master:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(500, 'Erro interno do servidor');
    }
  }
}








