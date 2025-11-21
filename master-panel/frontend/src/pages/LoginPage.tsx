import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Eye, EyeOff, Shield, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LoginPage() {
  const { user, isLoading, error, login, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    clearError()

    try {
      await login(email, password, twoFactorCode || undefined)
    } catch (error) {
      // Error is handled by the store
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginResponse = (response: any) => {
    if (response.requiresTwoFactor) {
      setRequiresTwoFactor(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Shield className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-secondary-900">
            ReservaPro Master Panel
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Acesso administrativo ao sistema
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1"
                placeholder="master@reservapro.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-secondary-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            {requiresTwoFactor && (
              <div>
                <label htmlFor="twoFactorCode" className="block text-sm font-medium text-secondary-700">
                  Código 2FA
                </label>
                <input
                  id="twoFactorCode"
                  name="twoFactorCode"
                  type="text"
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="input mt-1"
                  placeholder="123456"
                  maxLength={6}
                />
                <p className="mt-1 text-xs text-secondary-500">
                  Digite o código de 6 dígitos do seu aplicativo autenticador
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-danger-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-danger-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-danger-800">
                    Erro no login
                  </h3>
                  <div className="mt-2 text-sm text-danger-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="btn-primary btn-lg w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-secondary-500">
              Credenciais padrão: master@reservapro.com / Master123!@#
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}








