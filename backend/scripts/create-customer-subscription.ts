import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.CUSTOMER_EMAIL ?? 'cliente.pix+teste@example.com';
  const password = process.env.CUSTOMER_PASSWORD ?? 'Cliente@123';
  const vesselName = process.env.CUSTOMER_VESSEL ?? 'Embarcação Cliente PIX';
  const planName = process.env.CUSTOMER_PLAN ?? 'Plano Mensal 5';

  const passwordHash = await bcrypt.hash(password, 12);

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        name: 'Cliente PIX Teste',
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        isActive: true,
        phone: '+55 11 90000-0001',
      },
    });
    console.log('✅ Usuário criado:', user.email);
  } else {
    console.log('ℹ️ Usuário já existia, reutilizando:', user.email);
  }

  let vessel = await prisma.vessel.findFirst({
    where: { name: vesselName },
  });
  if (!vessel) {
    vessel = await prisma.vessel.create({
      data: {
        name: vesselName,
        description: 'Vinculada automaticamente para testes de assinatura',
        capacity: 6,
        location: 'Marina Infinity',
      },
    });
    console.log('✅ Embarcação criada:', vessel.name);
  } else {
    console.log('ℹ️ Embarcação reutilizada:', vessel.name);
  }

  const userVessel = await prisma.userVessel.upsert({
    where: {
      userId_vesselId: {
        userId: user.id,
        vesselId: vessel.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      vesselId: vessel.id,
      totalValue: 0,
      downPayment: 0,
      remainingAmount: 0,
      totalInstallments: 0,
      marinaMonthlyFee: 5,
      marinaDueDay: 5,
    },
  });
  console.log('✅ Usuário vinculado à embarcação:', userVessel.id);

  const plan = await prisma.subscriptionPlan.findFirst({
    where: { name: planName },
  });

  if (!plan) {
    throw new Error(`Plano "${planName}" não encontrado. Crie o plano antes de prosseguir.`);
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: { planId: plan.id, userId: user.id },
  });

  if (existingSubscription) {
    console.log('ℹ️ Assinatura já existente:', existingSubscription.id);
  } else {
    const subscription = await prisma.subscription.create({
      data: {
        planId: plan.id,
        userId: user.id,
        payerEmail: user.email,
        status: 'pending',
        reason: `Assinatura automática - ${plan.name}`,
      },
    });
    console.log('✅ Assinatura criada:', subscription.id);
  }

  console.log('\nCredenciais do cliente gerado:');
  console.log('Email:', email);
  console.log('Senha:', password);
}

main()
  .catch((error) => {
    console.error('❌ Erro ao criar cliente e assinatura:', error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


