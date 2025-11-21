import { useState } from 'react'
import { Save, Shield, Bell, Globe } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    systemName: 'ReservaPro Master Panel',
    systemEmail: 'master@reservapro.com',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    security: {
      twoFactorRequired: true,
      sessionTimeout: 8,
      ipWhitelist: true
    }
  })

  const handleSave = () => {
    // Implementar salvamento
    console.log('Salvando configurações:', settings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Configurações</h1>
        <p className="text-secondary-600">
          Configure as preferências do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Sistema */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Sistema
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nome do Sistema
                </label>
                <input
                  type="text"
                  value={settings.systemName}
                  onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email do Sistema
                </label>
                <input
                  type="email"
                  value={settings.systemEmail}
                  onChange={(e) => setSettings({...settings, systemEmail: e.target.value})}
                  className="input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Fuso Horário
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="input"
                  >
                    <option value="America/Sao_Paulo">São Paulo</option>
                    <option value="America/New_York">Nova York</option>
                    <option value="Europe/London">Londres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Idioma
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="input"
                  >
                    <option value="pt-BR">Português (BR)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notificações */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notificações
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-secondary-900">Email</div>
                  <div className="text-sm text-secondary-500">Receber notificações por email</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.email}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, email: e.target.checked}
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-secondary-900">SMS</div>
                  <div className="text-sm text-secondary-500">Receber notificações por SMS</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.sms}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, sms: e.target.checked}
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-secondary-900">Push</div>
                  <div className="text-sm text-secondary-500">Receber notificações push</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.notifications.push}
                  onChange={(e) => setSettings({
                    ...settings,
                    notifications: {...settings.notifications, push: e.target.checked}
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Segurança */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Segurança
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-secondary-900">2FA Obrigatório</div>
                  <div className="text-sm text-secondary-500">Exigir 2FA para todos os usuários</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.twoFactorRequired}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {...settings.security, twoFactorRequired: e.target.checked}
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Timeout da Sessão (horas)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {...settings.security, sessionTimeout: parseInt(e.target.value)}
                  })}
                  className="input"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-secondary-900">IP Whitelist</div>
                  <div className="text-sm text-secondary-500">Restringir acesso por IP</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.security.ipWhitelist}
                  onChange={(e) => setSettings({
                    ...settings,
                    security: {...settings.security, ipWhitelist: e.target.checked}
                  })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                />
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}








