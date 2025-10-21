import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Criar usuário Admin
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@embarcacoes.com' },
    update: {},
    create: {
      email: 'admin@embarcacoes.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN,
      phone: '+55 11 99999-9999',
      isActive: true,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar embarcações de exemplo
  const vessels = [
    {
      name: 'Infinity ONE',
      description: 'Lancha de luxo 45 pés',
      capacity: 12,
      location: 'Marina São Paulo',
      imageUrl: 'https://placehold.co/600x400/0066cc/white?text=Infinity+ONE',
    },
    {
      name: 'Infinity TWO',
      description: 'Iate 50 pés',
      capacity: 15,
      location: 'Marina São Paulo',
      imageUrl: 'https://placehold.co/600x400/0099ff/white?text=Infinity+TWO',
    },
  ];

  const createdVessels = [];
  for (const vesselData of vessels) {
    // Verificar se já existe
    const existing = await prisma.vessel.findFirst({
      where: { name: vesselData.name },
    });
    
    const vessel = existing || await prisma.vessel.create({
      data: vesselData,
    });
    console.log('✅ Embarcação criada:', vessel.name);
    createdVessels.push(vessel);

    // Criar limite de reservas para cada embarcação
    await prisma.bookingLimit.upsert({
      where: { vesselId: vessel.id },
      update: {},
      create: {
        vesselId: vessel.id,
        maxActiveBookings: 2,
      },
    });
    console.log('   Limite de reservas configurado: 2 reservas ativas');
  }

  // Criar usuários de exemplo com CPF como senha
  const users = [
    {
      email: 'danillo.brandao@gmail.com',
      password: await bcrypt.hash('05062618592', 12), // CPF como senha
      name: 'Danillo Brandão',
      phone: '+55 11 98888-8888',
    },
    {
      email: 'maria@exemplo.com',
      password: await bcrypt.hash('12345678901', 12), // CPF de exemplo
      name: 'Maria Santos',
      phone: '+55 11 97777-7777',
    },
  ];

  console.log('\n');
  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        role: UserRole.USER,
        isActive: true,
      },
    });
    console.log('✅ Usuário criado:', user.email);

    // Vincular usuário à primeira embarcação
    await prisma.userVessel.upsert({
      where: {
        userId_vesselId: {
          userId: user.id,
          vesselId: createdVessels[0].id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        vesselId: createdVessels[0].id,
      },
    });
    console.log('   Vinculado à embarcação:', createdVessels[0].name);
  }

  // Criar notificação global de exemplo
  const notification = await prisma.notification.create({
    data: {
      title: 'Bem-vindo ao Sistema',
      message: 'Sistema de agendamento de embarcações está pronto para uso!',
      type: 'INFO',
      isGlobal: true,
      isActive: true,
    },
  });
  console.log('\n✅ Notificação global criada:', notification.title);

  // Criar log de auditoria do seed
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'USER_CREATED',
      entityType: 'system',
      entityId: 'seed',
      details: {
        message: 'Banco de dados inicializado com dados de exemplo',
      },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('   Admin:');
  console.log('   Email: admin@embarcacoes.com');
  console.log('   Senha: Admin@123');
  console.log('\n   Usuários:');
  console.log('   Email: danilo@exemplo.com ou maria@exemplo.com');
  console.log('   Senha: Usuario@123');
  console.log('\n⚠️  IMPORTANTE: Altere as senhas após o primeiro login!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

