import 'dotenv/config';
import axios from 'axios';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface SubscriptionPlan {
  id: string;
  name: string;
  status?: string;
  amount: number;
  frequency: number;
  frequencyType: 'days' | 'months';
}

async function main() {
  const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3001/api';
  const email = process.env.SUBSCRIPTION_TEST_EMAIL || 'contato@danilobrandao.com.br';
  const password = process.env.SUBSCRIPTION_TEST_PASSWORD || 'Admin@123';

  const client = axios.create({
    baseURL: apiBaseUrl,
    timeout: 15_000,
  });

  console.log('🔐 Efetuando login...');
  const loginResponse = await client
    .post<LoginResponse>('/auth/login', { email, password })
    .then((res) => res.data);

  const { accessToken } = loginResponse;
  client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  console.log(`✅ Autenticado como ${loginResponse.user.email}\n`);

  console.log('📦 Buscando planos de assinatura...');
  const plansResponse = await client
    .get<{ success: boolean; data: SubscriptionPlan[] }>('/subscription-plans')
    .then((res) => res.data);

  const plan = plansResponse.data.find((item) => (item as any).status === 'active' || true);

  if (!plan) {
    throw new Error('Nenhum plano de assinatura encontrado. Crie um plano antes de testar.');
  }

  console.log(`✅ Plano selecionado: ${plan.name} (${plan.id})\n`);

  console.log('🪙 Criando assinatura e gerando PIX...');
  const subscriptionResponse = await client
    .post('/subscriptions', {
      planId: plan.id,
      reason: 'Teste automático PIX',
    })
    .then((res) => res.data);

  const subscription = subscriptionResponse.data;
  const pix = subscriptionResponse.pix;

  console.log('✅ Assinatura criada.');
  console.log(`   • Subscription ID: ${subscription.id}`);
  console.log(`   • Status interno: ${subscription.status}`);
  console.log(`   • Valor base: R$ ${plan.amount.toFixed(2)}`);
  if (pix) {
    console.log('   • PIX gerado:');
    console.log(`     - QR Code (base64): ${pix.qr_code_base64?.slice(0, 32)}...`);
    console.log(`     - Copia e cola: ${pix.qr_code?.slice(0, 64)}...`);
    if (subscriptionResponse.payment?.amount) {
      console.log(`     - Valor total: R$ ${subscriptionResponse.payment.amount.toFixed(2)}`);
    }
  }

  console.log('\n📋 Consultando minhas assinaturas...');
  const mySubscriptions = await client
    .get('/subscriptions/my')
    .then((res) => res.data);

  console.log(
    `✅ Encontradas ${mySubscriptions.data.length} assinatura(s). Última registro:\n`,
    JSON.stringify(mySubscriptions.data[0], null, 2).slice(0, 800),
    '...',
  );

  console.log('\n♻️  Reemitindo PIX (forçado) para mesma assinatura...');
  const reissueResponse = await client
    .post(`/subscriptions/${subscription.id}/reissue`, {
      force: true,
      reason: 'Reemissão automática de teste',
    })
    .then((res) => res.data);

  console.log('✅ PIX reemitido.');
  if (reissueResponse.payment?.amount) {
    console.log(`   • Novo valor: R$ ${reissueResponse.payment.amount.toFixed(2)}`);
  }
  console.log(
    `   • Status provedor: ${reissueResponse.data.providerStatus || 'N/D'}\n`,
  );

  console.log('🧪 Fluxo de teste concluído! Verifique o painel para confirmar os dados.');
  console.log('📌 Dica: execute novamente após alterar datas/juros para validar cenários de atraso.');
}

main().catch((error) => {
  console.error('\n❌ Erro ao executar teste automático:', error.response?.data || error);
  process.exit(1);
});


