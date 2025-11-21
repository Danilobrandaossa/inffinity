import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currencyId: string;
  frequency: number;
  frequencyType: 'days' | 'months';
  lateInterestPercent: number;
  penaltyPercent: number;
}

type ChargeBreakdown = {
  baseAmount: number;
  penaltyPercent?: number;
  penaltyAmount?: number;
  interestPercentPerDay?: number;
  interestAmount?: number;
  daysLate?: number;
  isOverdue?: boolean;
  dueDate?: string;
  generatedAt?: string;
  overrideApplied?: boolean;
};

interface Subscription {
  id: string;
  status: string;
  providerStatus?: string;
  reason?: string;
  nextChargeDate?: string;
  createdAt: string;
  plan: SubscriptionPlan;
  metadata?: {
    payment?: {
      dateOfExpiration?: string;
    };
    currentCharge?: (ChargeBreakdown & {
      totalAmount: number;
      triggeredBy?: string;
      expiresAt?: string;
      providerStatus?: string;
      lastStatusUpdateAt?: string;
    }) | null;
    chargeHistory?: Array<
      ChargeBreakdown & {
        totalAmount?: number;
        paidAt?: string;
        providerPaymentId?: string | number;
      }
    >;
  };
}

interface PixTransactionData {
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
}

interface PixState {
  subscriptionId: string;
  planName: string;
  transaction?: PixTransactionData;
  expiresAt?: string;
  amount?: number;
  breakdown?: ChargeBreakdown;
}

const formatCurrency = (value?: number) =>
  typeof value === 'number'
    ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    : undefined;

export default function SubscriptionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'ADMIN';
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [pixState, setPixState] = useState<PixState | null>(null);
  const [reissuingId, setReissuingId] = useState<string | null>(null);

  const { data: plansData } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data } = await api.get('/subscription-plans');
      return data.data as SubscriptionPlan[];
    },
  });

  const { data: mySubscriptions } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: async () => {
      const { data } = await api.get('/subscriptions/my');
      return data.data as Subscription[];
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data as Array<{ id: string; name: string; email: string }>;
    },
    enabled: isAdmin,
  });

  const subscribeMutation = useMutation({
    mutationFn: async (payload: { planId: string; reason?: string; userId?: string }) => {
      const { data } = await api.post('/subscriptions', payload);
      return data as {
        success: boolean;
        data: Subscription;
        pix?: PixTransactionData;
        payment?: { date_of_expiration?: string; amount?: number; breakdown?: ChargeBreakdown };
      };
    },
    onSuccess: (response, variables) => {
      toast.success('Assinatura criada! Finalize o pagamento via PIX.');
      queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
      setReason('');
      setPixState(
        response.pix
          ? {
              subscriptionId: response.data.id,
              planName:
                response.data.plan?.name ||
                sortedPlans.find((plan) => plan.id === variables.planId)?.name ||
                'Assinatura',
              transaction: response.pix,
              expiresAt: response.payment?.date_of_expiration,
              amount: response.payment?.amount,
              breakdown: response.payment?.breakdown,
            }
          : null,
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar assinatura');
    },
  });

  const reissuePixMutation = useMutation({
    mutationFn: async ({ subscriptionId }: { subscriptionId: string }) => {
      const { data } = await api.post(`/subscriptions/${subscriptionId}/reissue`, {});
      return data as {
        success: boolean;
        data: Subscription;
        pix?: PixTransactionData;
        payment?: { date_of_expiration?: string; amount?: number; breakdown?: ChargeBreakdown };
      };
    },
    onSuccess: (response) => {
      toast.success('PIX reemitido! Pague para manter a assinatura ativa.');
      queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] });
      setPixState(
        response.pix
          ? {
              subscriptionId: response.data.id,
              planName: response.data.plan?.name || 'Assinatura',
              transaction: response.pix,
              expiresAt: response.payment?.date_of_expiration,
              amount: response.payment?.amount,
              breakdown: response.payment?.breakdown,
            }
          : null,
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao reemitir PIX da assinatura');
    },
  });

  const sortedPlans = useMemo(() => {
    if (!plansData) return [];
    return [...plansData].sort((a, b) => a.amount - b.amount);
  }, [plansData]);

  const selectedPlan = useMemo(
    () => sortedPlans.find((plan) => plan.id === selectedPlanId),
    [sortedPlans, selectedPlanId],
  );

  const targetUser = useMemo(() => {
    if (isAdmin && selectedUserId) {
      return usersData?.find((u) => u.id === selectedUserId);
    }
    return user;
  }, [isAdmin, selectedUserId, usersData, user]);

  const handleGeneratePix = async () => {
    if (!selectedPlan) {
      toast.error('Selecione um plano antes de gerar o PIX.');
      return;
    }

    if (!targetUser?.email) {
      toast.error('Usuário sem e-mail válido. Atualize o cadastro antes de continuar.');
      return;
    }

    await subscribeMutation.mutateAsync({
      planId: selectedPlan.id,
      reason: reason || undefined,
      userId: isAdmin && selectedUserId ? selectedUserId : undefined,
    });
  };

  const handleReissuePix = async (subscriptionId: string) => {
    setReissuingId(subscriptionId);
    try {
      await reissuePixMutation.mutateAsync({ subscriptionId });
    } finally {
      setReissuingId(null);
    }
  };

  const handleCopyPix = async () => {
    if (!pixState?.transaction?.qr_code) return;
    try {
      await navigator.clipboard.writeText(pixState.transaction.qr_code);
      toast.success('Código PIX copiado!');
    } catch {
      toast.error('Não foi possível copiar o código. Copie manualmente.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Minhas Assinaturas</h1>
          <p className="text-gray-600 mt-1">
            Escolha um plano recorrente, gere o PIX e acompanhe o status das cobranças.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800 max-w-xl">
          <p className="font-medium">💡 Pagamentos recorrentes via PIX</p>
          <p className="mt-1">
            Ao gerar a assinatura criamos um pagamento PIX no Mercado Pago. Pague usando o QR Code ou
            copia e cola para ativar a recorrência.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assinar plano</h2>
              <p className="text-sm text-gray-600 mt-1">
                Selecione um plano, revise os dados e gere o PIX. Validade padrão de 60 minutos.
              </p>
            </div>

            {isAdmin && (
              <div>
                <label className="label">Usuário</label>
                <select
                  className="input"
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setPixState(null);
                  }}
                >
                  <option value="">Selecionar usuário</option>
                  {usersData?.map((adminUser) => (
                    <option key={adminUser.id} value={adminUser.id}>
                      {adminUser.name} — {adminUser.email}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Deixe em branco para criar a assinatura para você mesmo.
                </p>
              </div>
            )}

            <div>
              <label className="label">Plano *</label>
              <select
                className="input"
                value={selectedPlanId}
                onChange={(e) => {
                  setSelectedPlanId(e.target.value);
                  setPixState(null);
                }}
              >
                <option value="">Selecione um plano</option>
                {sortedPlans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — R${' '}
                    {plan.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} /{' '}
                    {plan.frequency}{' '}
                    {plan.frequencyType === 'months'
                      ? plan.frequency > 1
                        ? 'meses'
                        : 'mês'
                      : plan.frequency > 1
                      ? 'dias'
                      : 'dia'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Observações (opcional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Informações adicionais sobre esta assinatura"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary w-full"
              onClick={handleGeneratePix}
              disabled={subscribeMutation.isPending}
            >
              {subscribeMutation.isPending ? 'Gerando PIX…' : 'Gerar PIX'}
            </button>

            {pixState ? (
              <div className="border border-green-200 rounded-lg p-4 bg-green-50 space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-green-900">
                    PIX para assinatura {pixState.planName}
                  </h3>
                  <p className="text-xs text-green-800">
                    Confirme o pagamento para ativar a assinatura. O status atualiza automaticamente via
                    webhook.
                  </p>
                  {pixState.expiresAt && (
                    <p className="text-xs text-green-700 mt-1">
                      Expira em {new Date(pixState.expiresAt).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
                {pixState.transaction?.qr_code_base64 ? (
                  <img
                    src={`data:image/png;base64,${pixState.transaction.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="w-full max-w-xs mx-auto"
                  />
                ) : (
                  <div className="text-xs text-green-800">
                    QR Code indisponível no momento. Use o código copia e cola abaixo.
                  </div>
                )}
                <div>
                  <label className="label text-xs text-green-900">Copia e cola</label>
                  <textarea
                    className="input text-xs"
                    rows={4}
                    readOnly
                    value={pixState.transaction?.qr_code || ''}
                  />
                  <div className="flex justify-between items-center mt-2 text-xs">
                    <button className="btn btn-outline btn-sm" onClick={handleCopyPix}>
                      Copiar código
                    </button>
                    {pixState.transaction?.ticket_url && (
                      <a
                        href={pixState.transaction.ticket_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-green-700 underline"
                      >
                        Abrir comprovante
                      </a>
                    )}
                  </div>
                </div>
                {typeof pixState.amount === 'number' && (
                  <div className="bg-white rounded-lg border border-green-200 p-3 text-xs text-green-900 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Valor total</span>
                      <span>{formatCurrency(pixState.amount)}</span>
                    </div>
                    {pixState.breakdown && (
                      <>
                        <div className="flex justify-between text-green-800">
                          <span>Valor base</span>
                          <span>{formatCurrency(pixState.breakdown.baseAmount)}</span>
                        </div>
                        {pixState.breakdown.penaltyAmount ? (
                          <div className="flex justify-between text-green-800">
                            <span>
                              Multa ({pixState.breakdown.penaltyPercent?.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                              %)
                            </span>
                            <span>{formatCurrency(pixState.breakdown.penaltyAmount)}</span>
                          </div>
                        ) : null}
                        {pixState.breakdown.interestAmount ? (
                          <div className="flex justify-between text-green-800">
                            <span>
                              Juros (
                              {pixState.breakdown.interestPercentPerDay?.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                              })}
                              % ao dia · {pixState.breakdown.daysLate} dia(s))
                            </span>
                            <span>{formatCurrency(pixState.breakdown.interestAmount)}</span>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                Gere o PIX para visualizar QR Code e código copia e cola.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Planos disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedPlans.length > 0 ? (
                sortedPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`border rounded-lg p-4 ${
                      selectedPlanId === plan.id ? 'border-primary-500 shadow-md' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">
                          R$ {plan.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}{' '}
                          / {plan.frequency}{' '}
                          {plan.frequencyType === 'months'
                            ? plan.frequency > 1
                              ? 'meses'
                              : 'mês'
                            : plan.frequency > 1
                            ? 'dias'
                            : 'dia'}
                        </p>
                      </div>
                      <button
                        className="btn btn-outline px-3 py-1 text-sm"
                        onClick={() => setSelectedPlanId(plan.id)}
                      >
                        Escolher
                      </button>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                    )}
                    <dl className="mt-3 text-xs text-gray-500 space-y-1">
                      <div>
                        <span className="font-medium">Juros de mora:</span>{' '}
                        {plan.lateInterestPercent
                          ? `${plan.lateInterestPercent.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}%`
                          : '0%'}
                      </div>
                      <div>
                        <span className="font-medium">Multa:</span>{' '}
                        {plan.penaltyPercent
                          ? `${plan.penaltyPercent.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                            })}%`
                          : '0%'}
                      </div>
                    </dl>
                  </div>
                ))
              ) : (
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 md:col-span-2">
                  Nenhum plano disponível no momento. Entre em contato com o administrador.
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Minhas assinaturas</h2>
            {mySubscriptions && mySubscriptions.length > 0 ? (
              <div className="space-y-4">
                {mySubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {subscription.plan.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {subscription.plan.frequency}{' '}
                          {subscription.plan.frequencyType === 'months'
                            ? subscription.plan.frequency > 1
                              ? 'meses'
                              : 'mês'
                            : subscription.plan.frequency > 1
                            ? 'dias'
                            : 'dia'}{' '}
                          — R${' '}
                          {subscription.plan.amount.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subscription.status === 'authorized'
                            ? 'bg-green-100 text-green-700'
                            : subscription.status === 'paused'
                            ? 'bg-yellow-100 text-yellow-700'
                            : subscription.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </div>
                    {subscription.reason && (
                      <p className="text-sm text-gray-600 mt-2">{subscription.reason}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {subscription.metadata?.currentCharge?.totalAmount !== undefined && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                          Valor corrente:{' '}
                          <span className="ml-1 font-semibold">
                            {formatCurrency(subscription.metadata.currentCharge.totalAmount)}
                          </span>
                        </span>
                      )}
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleReissuePix(subscription.id)}
                        disabled={
                          reissuingId === subscription.id ||
                          reissuePixMutation.isPending ||
                          ['cancelled', 'paused', 'finished', 'expired'].includes(subscription.status) ||
                          Boolean(
                            subscription.providerStatus &&
                              ['pending', 'in_process'].includes(subscription.providerStatus) &&
                              subscription.metadata?.currentCharge?.expiresAt &&
                              new Date(subscription.metadata.currentCharge.expiresAt) > new Date(),
                          )
                        }
                      >
                        {reissuingId === subscription.id
                          ? 'Reemitindo...'
                          : 'Reemitir PIX'}
                      </button>
                      {subscription.metadata?.payment?.dateOfExpiration && (
                        <span className="text-xs text-gray-500 inline-flex items-center">
                          PIX atual expira em{' '}
                          {new Date(subscription.metadata.payment.dateOfExpiration).toLocaleString(
                            'pt-BR',
                          )}
                        </span>
                      )}
                    </div>
                    <dl className="mt-3 text-xs text-gray-500 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <span className="font-medium">Criada em:</span>{' '}
                        {new Date(subscription.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Próxima cobrança:</span>{' '}
                        {subscription.nextChargeDate
                          ? new Date(subscription.nextChargeDate).toLocaleDateString('pt-BR')
                          : '—'}
                      </div>
                      <div>
                        <span className="font-medium">Usuário:</span> {user?.email}
                      </div>
                      {subscription.metadata?.currentCharge?.penaltyAmount ? (
                        <div>
                          <span className="font-medium">Multa aplicada:</span>{' '}
                          {formatCurrency(subscription.metadata.currentCharge.penaltyAmount)} (
                          {subscription.metadata.currentCharge.penaltyPercent?.toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                          %)
                        </div>
                      ) : null}
                      {subscription.metadata?.currentCharge?.interestAmount ? (
                        <div>
                          <span className="font-medium">Juros acumulado:</span>{' '}
                          {formatCurrency(subscription.metadata.currentCharge.interestAmount)} (
                          {subscription.metadata.currentCharge.interestPercentPerDay?.toLocaleString(
                            'pt-BR',
                            { minimumFractionDigits: 2 },
                          )}
                          % ao dia · {subscription.metadata.currentCharge.daysLate} dia(s))
                        </div>
                      ) : null}
                      {(subscription.providerStatus ||
                        subscription.metadata?.currentCharge?.providerStatus) && (
                        <div>
                          <span className="font-medium">Status no provedor:</span>{' '}
                          {subscription.metadata?.currentCharge?.providerStatus ||
                            subscription.providerStatus}
                        </div>
                      )}
                    </dl>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                Você ainda não possui assinaturas ativas.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


