import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Bell, AlertCircle, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [appId, setAppId] = useState('');
  const [restApiKey, setRestApiKey] = useState('');
  const [showRestApiKey, setShowRestApiKey] = useState(false);

  // Buscar configurações do OneSignal
  const { data: oneSignalConfig, isLoading } = useQuery({
    queryKey: ['onesignal-config'],
    queryFn: async () => {
      const { data } = await api.get('/system-settings/onesignal');
      return data;
    },
  });

  // Atualizar estado quando os dados forem carregados
  useEffect(() => {
    if (oneSignalConfig) {
      setAppId(oneSignalConfig.appId || '');
      setRestApiKey(oneSignalConfig.restApiKey || '');
    }
  }, [oneSignalConfig]);

  // Mutation para atualizar configurações
  const updateMutation = useMutation({
    mutationFn: async (data: { appId: string; restApiKey: string }) => {
      return api.put('/system-settings/onesignal', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onesignal-config'] });
      toast.success('Configurações do OneSignal atualizadas com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar configurações');
    },
  });

  // Mutation para testar notificação
  const testNotificationMutation = useMutation({
    mutationFn: async () => {
      return api.post('/system-settings/onesignal/test');
    },
    onSuccess: () => {
      toast.success('Notificação de teste enviada! Verifique seu dispositivo em alguns segundos.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao enviar notificação de teste');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ appId, restApiKey });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-primary-600" />
            Configurações
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as configurações do sistema
          </p>
        </div>
      </div>

      {/* OneSignal Configuration */}
      <div className="card">
        <div className="flex items-center mb-4">
          <Bell className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Notificações Push - OneSignal</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Configure as credenciais do OneSignal para enviar notificações push aos usuários.
        </p>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Carregando configurações...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="label">
                  OneSignal App ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="input"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="Ex: 51feb7b0-8b6f-4f45-8b7b-4a2dd48a41a5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID da aplicação no painel do OneSignal. Você pode encontrar isso em Settings → Keys & IDs
                </p>
              </div>

              <div>
                <label className="label">
                  OneSignal REST API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showRestApiKey ? 'text' : 'password'}
                    className="input pr-10"
                    value={restApiKey}
                    onChange={(e) => setRestApiKey(e.target.value)}
                    placeholder="Ex: os_v2_app_..."
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRestApiKey(!showRestApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showRestApiKey ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Chave de API REST para envio de notificações. Você pode encontrar isso em Settings → Keys & IDs → REST API Key
                </p>
              </div>
            </div>

            {/* Alert de informação */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Como obter as credenciais do OneSignal?
                </h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse o painel do OneSignal em{' '}
                    <a 
                      href="https://app.onesignal.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-900"
                    >
                      app.onesignal.com
                    </a>
                  </li>
                  <li>Selecione seu app ou crie um novo</li>
                  <li>Vá em <strong>Settings → Keys & IDs</strong></li>
                  <li>Copie o <strong>App ID</strong> e a <strong>REST API Key</strong></li>
                  <li>Cole as credenciais nos campos acima</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <button
                type="button"
                onClick={() => testNotificationMutation.mutate()}
                disabled={testNotificationMutation.isPending || !appId || !restApiKey}
                className="btn btn-outline flex items-center"
              >
                {testNotificationMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Notificação de Teste
                  </>
                )}
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn btn-primary flex items-center"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

