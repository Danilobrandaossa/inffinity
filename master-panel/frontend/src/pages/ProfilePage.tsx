import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { Save, Shield, Key, User } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  })

  const handleSave = () => {
    // Implementar salvamento
    console.log('Salvando perfil:', profile)
  }

  const handlePasswordChange = () => {
    // Implementar mudança de senha
    console.log('Mudando senha')
  }

  const handle2FAToggle = () => {
    // Implementar toggle 2FA
    console.log('Toggle 2FA')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Perfil</h1>
        <p className="text-secondary-600">
          Gerencie suas informações pessoais e configurações de segurança
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Pessoais */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informações Pessoais
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Função
                </label>
                <input
                  type="text"
                  value={user?.role || ''}
                  disabled
                  className="input bg-secondary-50"
                />
              </div>
            </div>
          </div>

          {/* Mudança de Senha */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Key className="h-5 w-5 mr-2" />
                Mudança de Senha
              </h3>
            </div>
            <div className="card-content space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Senha Atual
                </label>
                <input
                  type="password"
                  value={profile.currentPassword}
                  onChange={(e) => setProfile({...profile, currentPassword: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Nova Senha
                </label>
                <input
                  type="password"
                  value={profile.newPassword}
                  onChange={(e) => setProfile({...profile, newPassword: e.target.value})}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={profile.confirmPassword}
                  onChange={(e) => setProfile({...profile, confirmPassword: e.target.value})}
                  className="input"
                />
              </div>
              <button onClick={handlePasswordChange} className="btn-primary">
                <Key className="h-4 w-4 mr-2" />
                Alterar Senha
              </button>
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
                  <div className="text-sm font-medium text-secondary-900">Autenticação 2FA</div>
                  <div className="text-sm text-secondary-500">
                    {profile.twoFactorEnabled ? 'Habilitado' : 'Desabilitado'}
                  </div>
                </div>
                <button
                  onClick={handle2FAToggle}
                  className={`btn ${profile.twoFactorEnabled ? 'btn-danger' : 'btn-success'} btn-sm`}
                >
                  {profile.twoFactorEnabled ? 'Desabilitar' : 'Habilitar'}
                </button>
              </div>
              
              <div className="pt-4 border-t border-secondary-200">
                <div className="text-sm font-medium text-secondary-900 mb-2">
                  Último Login
                </div>
                <div className="text-sm text-secondary-500">
                  {new Date().toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary w-full">
            <Save className="h-4 w-4 mr-2" />
            Salvar Perfil
          </button>
        </div>
      </div>
    </div>
  )
}








