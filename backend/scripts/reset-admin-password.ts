import bcrypt from 'bcryptjs';
import { prisma } from '../src/utils/prisma';

async function main() {
  const newPassword = 'Admin@123';
  const hash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: { email: 'contato@danilobrandao.com.br' },
    data: { password: hash },
    select: { id: true, email: true },
  });

  console.log('Senha do admin atualizada com sucesso:', user.email);
}

main()
  .catch((error) => {
    console.error('Erro ao atualizar senha do admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

