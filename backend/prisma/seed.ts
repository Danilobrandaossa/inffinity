import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // Criar usuário Admin principal
  const adminPassword = await bcrypt.hash('Zy598859D@n', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'contato@danilobrandao.com.br' },
    update: {},
    create: {
      email: 'contato@danilobrandao.com.br',
      password: adminPassword,
      name: 'Danilo Brandão',
      role: UserRole.ADMIN,
      phone: '+55 11 99999-9999',
      isActive: true,
    },
  });
  console.log('✅ Admin criado:', admin.email);

  // Criar notificação de boas-vindas
  const notification = await prisma.notification.create({
    data: {
      title: 'Sistema Inicializado',
      message: 'Sistema de agendamento de embarcações está pronto! Comece cadastrando suas embarcações e usuários.',
      type: 'INFO',
      isGlobal: true,
      isActive: true,
    },
  });
  console.log('✅ Notificação de boas-vindas criada');

  // Criar log de auditoria do seed
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'USER_CREATED',
      entityType: 'system',
      entityId: 'seed',
      details: {
        message: 'Sistema inicializado - banco de dados zerado e pronto para uso',
      },
      ipAddress: '127.0.0.1',
    },
  });

  console.log('\n🎉 Sistema inicializado com sucesso!');
  console.log('\n📋 Suas credenciais de acesso:');
  console.log('   Email: contato@danilobrandao.com.br');
  console.log('   Senha: Zy598859D@n');
  console.log('\n🚀 Próximos passos:');
  console.log('   1. Faça login no sistema');
  console.log('   2. Cadastre suas embarcações');
  console.log('   3. Cadastre seus usuários');
  console.log('   4. Configure bloqueios se necessário');
  console.log('\n⚠️  IMPORTANTE: Mantenha suas credenciais seguras!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

