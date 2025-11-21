import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';

const prisma = new PrismaClient();

async function seedMasterData() {
  console.log('🌱 Seeding Master Panel data...');

  // 1. Criar planos
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { id: 'plan-basic' },
      update: {},
      create: {
        id: 'plan-basic',
        name: 'Básico',
        type: 'BASIC',
        description: 'Plano básico para pequenas empresas',
        price: 99.00,
        billingCycle: 'monthly',
        maxUsers: 5,
        maxVessels: 3,
        maxBookingsPerMonth: 50,
        features: {
          notifications: true,
          reports: false,
          integrations: false,
          whitelabel: false,
          support: 'email'
        }
      }
    }),
    prisma.plan.upsert({
      where: { id: 'plan-pro' },
      update: {},
      create: {
        id: 'plan-pro',
        name: 'Pro',
        type: 'PRO',
        description: 'Plano profissional para empresas médias',
        price: 199.00,
        billingCycle: 'monthly',
        maxUsers: 15,
        maxVessels: 10,
        maxBookingsPerMonth: 200,
        features: {
          notifications: true,
          reports: true,
          integrations: true,
          whitelabel: false,
          support: 'priority'
        }
      }
    }),
    prisma.plan.upsert({
      where: { id: 'plan-premium' },
      update: {},
      create: {
        id: 'plan-premium',
        name: 'Premium',
        type: 'PREMIUM',
        description: 'Plano premium para grandes empresas',
        price: 399.00,
        billingCycle: 'monthly',
        maxUsers: -1, // Ilimitado
        maxVessels: -1, // Ilimitado
        maxBookingsPerMonth: -1, // Ilimitado
        features: {
          notifications: true,
          reports: true,
          integrations: true,
          whitelabel: true,
          support: '24/7',
          sso: true,
          customDomain: true
        }
      }
    })
  ]);

  console.log('✅ Planos criados:', plans.length);

  // 2. Criar usuário Master Owner
  const masterOwnerPassword = await bcrypt.hash('Master123!@#', 12);
  const masterOwner2FASecret = speakeasy.generateSecret({
    name: 'ReservaPro Master',
    issuer: 'ReservaPro'
  });

  const masterOwner = await prisma.masterUser.upsert({
    where: { email: 'master@reservapro.com' },
    update: {},
    create: {
      email: 'master@reservapro.com',
      name: 'Master Owner',
      password: masterOwnerPassword,
      role: 'MASTER_OWNER',
      isActive: true,
      twoFactorSecret: masterOwner2FASecret.base32,
      twoFactorEnabled: true,
      recoveryCodes: [
        'RECOVERY001',
        'RECOVERY002',
        'RECOVERY003',
        'RECOVERY004',
        'RECOVERY005'
      ],
      allowedIPs: ['127.0.0.1', '::1', '192.168.1.0/24']
    }
  });

  console.log('✅ Master Owner criado:', masterOwner.email);

  // 3. Criar usuário Master Support
  const masterSupportPassword = await bcrypt.hash('Support123!@#', 12);
  const masterSupport2FASecret = speakeasy.generateSecret({
    name: 'ReservaPro Support',
    issuer: 'ReservaPro'
  });

  const masterSupport = await prisma.masterUser.upsert({
    where: { email: 'support@reservapro.com' },
    update: {},
    create: {
      email: 'support@reservapro.com',
      name: 'Master Support',
      password: masterSupportPassword,
      role: 'MASTER_SUPPORT',
      isActive: true,
      twoFactorSecret: masterSupport2FASecret.base32,
      twoFactorEnabled: true,
      recoveryCodes: [
        'SUPPORT001',
        'SUPPORT002',
        'SUPPORT003',
        'SUPPORT004',
        'SUPPORT005'
      ],
      allowedIPs: ['127.0.0.1', '::1']
    }
  });

  console.log('✅ Master Support criado:', masterSupport.email);

  // 4. Criar tenant de demonstração
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-empresa' },
    update: {},
    create: {
      name: 'Demo Empresa',
      slug: 'demo-empresa',
      domain: 'demo.reservapro.com',
      subdomain: 'demo',
      email: 'contato@demo-empresa.com',
      phone: '+55 11 99999-9999',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      country: 'BR',
      website: 'https://demo-empresa.com',
      description: 'Empresa de demonstração do sistema',
      status: 'ACTIVE',
      planId: 'plan-pro',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      billingEmail: 'financeiro@demo-empresa.com',
      settings: {
        timezone: 'America/Sao_Paulo',
        currency: 'BRL',
        language: 'pt-BR',
        bookingRules: {
          minAdvanceHours: 24,
          maxAdvanceDays: 30,
          allowCancellation: true,
          cancellationHours: 2
        }
      },
      whitelabelConfig: {
        primaryColor: '#3B82F6',
        secondaryColor: '#1E40AF',
        logoUrl: 'https://demo-empresa.com/logo.png',
        faviconUrl: 'https://demo-empresa.com/favicon.ico',
        customDomain: 'demo.reservapro.com'
      },
      schemaName: 'tenant_demo_empresa'
    }
  });

  console.log('✅ Tenant demo criado:', demoTenant.name);

  // 5. Criar usuários do tenant demo
  const tenantUsers = await Promise.all([
    prisma.tenantUser.upsert({
      where: { 
        tenantId_email: {
          tenantId: demoTenant.id,
          email: 'admin@demo-empresa.com'
        }
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        email: 'admin@demo-empresa.com',
        name: 'Admin Demo',
        role: 'TENANT_OWNER',
        isActive: true
      }
    }),
    prisma.tenantUser.upsert({
      where: { 
        tenantId_email: {
          tenantId: demoTenant.id,
          email: 'user@demo-empresa.com'
        }
      },
      update: {},
      create: {
        tenantId: demoTenant.id,
        email: 'user@demo-empresa.com',
        name: 'Usuário Demo',
        role: 'TENANT_EDITOR',
        isActive: true
      }
    })
  ]);

  console.log('✅ Usuários do tenant criados:', tenantUsers.length);

  // 6. Criar métricas de exemplo
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.tenantMetrics.upsert({
    where: {
      tenantId_date: {
        tenantId: demoTenant.id,
        date: today
      }
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      date: today,
      activeUsers: 2,
      totalBookings: 15,
      completedBookings: 12,
      cancelledBookings: 3,
      revenue: 1500.00,
      errors4xx: 2,
      errors5xx: 0,
      avgResponseTime: 150.5
    }
  });

  console.log('✅ Métricas de exemplo criadas');

  // 7. Criar log de auditoria de exemplo
  await prisma.masterAuditLog.create({
    data: {
      masterUserId: masterOwner.id,
      tenantId: demoTenant.id,
      action: 'TENANT_CREATED',
      entityType: 'Tenant',
      entityId: demoTenant.id,
      details: {
        tenantName: demoTenant.name,
        plan: 'Pro',
        status: 'ACTIVE'
      },
      ipAddress: '127.0.0.1',
      userAgent: 'ReservaPro-Seed/1.0'
    }
  });

  console.log('✅ Log de auditoria criado');

  console.log('🎉 Master Panel seed concluído!');
  console.log('');
  console.log('📋 DADOS DE ACESSO:');
  console.log('');
  console.log('🔑 MASTER OWNER:');
  console.log('   Email: master@reservapro.com');
  console.log('   Senha: Master123!@#');
  console.log('   2FA Secret:', masterOwner2FASecret.base32);
  console.log('');
  console.log('🔑 MASTER SUPPORT:');
  console.log('   Email: support@reservapro.com');
  console.log('   Senha: Support123!@#');
  console.log('   2FA Secret:', masterSupport2FASecret.base32);
  console.log('');
  console.log('🏢 TENANT DEMO:');
  console.log('   Nome: Demo Empresa');
  console.log('   Slug: demo-empresa');
  console.log('   Domain: demo.reservapro.com');
  console.log('   Admin: admin@demo-empresa.com');
  console.log('   User: user@demo-empresa.com');
  console.log('');
}

async function main() {
  try {
    await seedMasterData();
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();