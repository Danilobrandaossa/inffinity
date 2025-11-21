const { PrismaClient, UserRole } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function addDemoUser() {
  try {
    console.log('🌱 Adicionando usuário de demonstração...');

    // Criar usuário cliente
    const clientPassword = await bcrypt.hash('Cliente123!@#', 12);
    const client = await prisma.user.create({
      data: {
        email: 'cliente@reservapro.com',
        password: clientPassword,
        name: 'Cliente Demo',
        role: UserRole.USER,
        phone: '+55 11 88888-8888',
        isActive: true,
      },
    });

    console.log('✅ Cliente criado:', client.email);
    console.log('📋 Credenciais do cliente:');
    console.log('   Email: cliente@reservapro.com');
    console.log('   Senha: Cliente123!@#');
    console.log('   Função: Cliente/Usuário');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️  Usuário cliente já existe');
    } else {
      console.error('❌ Erro ao criar usuário:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addDemoUser();








