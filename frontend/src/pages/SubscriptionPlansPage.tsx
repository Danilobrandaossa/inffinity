import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currencyId: string;
  frequency: number;
  frequencyType: 'days' | 'months';
  repetitions?: number;
  billingDay?: number;
  billingDayProportional?: boolean;
  freeTrialFrequency?: number;
  freeTrialFrequencyType?: 'days' | 'months';
  status: string;
  createdAt: string;
  lateInterestPercent: number;
  penaltyPercent: number;
}

export default function SubscriptionPlansPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    frequency: '1',
    frequencyType: 'months',
    repetitions: '',
    billingDay: '',
    freeTrialFrequency: '',
    freeTrialFrequencyType: 'months',
    backUrl: '',
    lateInterestPercent: '',
    penaltyPercent: '',
  });

  const { data: plans } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      const { data } = await api.get('/subscription-plans');
      return data.data as SubscriptionPlan[];
    },
  });

  const createPlan = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/subscription-plans', payload);
      return data.data as SubscriptionPlan;
    },
    onSuccess: () => {
      toast.success('Plano criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['subscription-plans'] });
      setFormData({
        name: '',
        description: '',
        amount: '',
        frequency: '1',
        frequencyType: 'months',
        repetitions: '',
        billingDay: '',
        freeTrialFrequency: '',
        freeTrialFrequencyType: 'months',
        backUrl: '',
        lateInterestPercent: '',
        penaltyPercent: '',
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar plano');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: any = {
      name: formData.name,
      description: formData.description || undefined,
      amount: Number(formData.amount),
      frequency: Number(formData.frequency),
      frequencyType: formData.frequencyType,
      repetitions: formData.repetitions ? Number(formData.repetitions) : undefined,
      billingDay: formData.billingDay ? Number(formData.billingDay) : undefined,
      freeTrial: formData.freeTrialFrequency
        ? {
            frequency: Number(formData.freeTrialFrequency),
            frequencyType: formData.freeTrialFrequencyType,
          }
        : undefined,
      backUrl: formData.backUrl || undefined,
      lateInterestPercent: formData.lateInterestPercent
        ? Number(formData.lateInterestPercent)
        : undefined,
      penaltyPercent: formData.penaltyPercent ? Number(formData.penaltyPercent) : undefined,
    };

    if (!payload.amount || payload.amount <= 0) {
      toast.error('Informe um valor válido');
      return;
    }

    if (!payload.frequency || payload.frequency <= 0) {
      toast.error('Informe uma frequência válida');
      return;
    }

    createPlan.mutate(payload);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Planos de Assinatura</h1>
        <p className="text-gray-600 mt-1">
          Cadastre novos planos recorrentes e visualize os existentes.
        </p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium">ℹ️ Ambiente de testes</p>
          <p className="mt-1">
            O Mercado Pago exige URLs HTTPS em produção. Se estiver testando localmente, deixe o campo
            “URL de retorno” vazio e utilize cartões/token de sandbox. Os valores de juros e multa serão
            aplicados apenas em cálculos internos; configure cobranças únicas (ex.: gasolina, manutenção)
            pelo módulo de cobranças avulsas em <strong>Controle Financeiro</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Novo Plano</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nome *</label>
                <input
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="label">Descrição</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="label">Valor (R$) *</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Frequência *</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, frequency: e.target.value }))
                    }
                    required
                  />
                </div>
                <div>
                  <label className="label">Tipo *</label>
                  <select
                    className="input"
                    value={formData.frequencyType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, frequencyType: e.target.value }))
                    }
                  >
                    <option value="months">Meses</option>
                    <option value="days">Dias</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Limite de ciclos</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.repetitions}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, repetitions: e.target.value }))
                    }
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="label">Dia cobrança</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="input"
                    value={formData.billingDay}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, billingDay: e.target.value }))
                    }
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Trial (quantidade)</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={formData.freeTrialFrequency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freeTrialFrequency: e.target.value,
                      }))
                    }
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="label">Trial (tipo)</label>
                  <select
                    className="input"
                    value={formData.freeTrialFrequencyType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        freeTrialFrequencyType: e.target.value,
                      }))
                    }
                  >
                    <option value="months">Meses</option>
                    <option value="days">Dias</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Juros de mora (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="input"
                    placeholder="Ex: 1.50"
                    value={formData.lateInterestPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lateInterestPercent: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Multa (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="input"
                    placeholder="Ex: 2.00"
                    value={formData.penaltyPercent}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, penaltyPercent: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">URL de retorno</label>
                <input
                  className="input"
                  placeholder="https://..."
                  value={formData.backUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, backUrl: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={createPlan.isPending}
              >
                {createPlan.isPending ? 'Criando...' : 'Criar Plano'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Planos cadastrados</h2>
              <span className="text-sm text-gray-500">
                {plans?.length ? `${plans.length} plano(s)` : 'Nenhum plano cadastrado'}
              </span>
            </div>

            <div className="space-y-4">
              {plans && plans.length > 0 ? (
                plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-500">
                          R$ {plan.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} a
                          cada {plan.frequency}{' '}
                          {plan.frequencyType === 'months'
                            ? plan.frequency > 1
                              ? 'meses'
                              : 'mês'
                            : plan.frequency > 1
                            ? 'dias'
                            : 'dia'}
                        </p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          plan.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {plan.status === 'active' ? 'Ativo' : plan.status}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                    )}

                    <dl className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-gray-500">
                      {plan.repetitions && (
                        <div>
                          <span className="font-medium">Ciclos:</span> {plan.repetitions}
                        </div>
                      )}
                      {plan.billingDay && (
                        <div>
                          <span className="font-medium">Dia cobrança:</span> {plan.billingDay}
                        </div>
                      )}
                      {plan.freeTrialFrequency && (
                        <div>
                          <span className="font-medium">Trial:</span>{' '}
                          {plan.freeTrialFrequency}{' '}
                          {plan.freeTrialFrequencyType === 'months'
                            ? plan.freeTrialFrequency > 1
                              ? 'meses'
                              : 'mês'
                            : plan.freeTrialFrequency > 1
                            ? 'dias'
                            : 'dia'}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Criado em:</span>{' '}
                        {new Date(plan.createdAt).toLocaleDateString('pt-BR')}
                      </div>
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
                <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500">
                  Nenhum plano cadastrado até o momento. Crie um plano no formulário ao lado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


