import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Activity,
  Server,
  Database,
  Globe
} from 'lucide-react'

interface SystemStats {
  master: {
    totalTenants: number
    activeTenants: number
    suspendedTenants: number
    totalMasterUsers: number
    totalAuditLogs: number
  }
  mainSystem: {
    totalUsers: number
    totalVessels: number
    totalBookings: number
    totalRevenue: number
  }
  timestamp: string
}

export default function MasterDashboardPage() {
  const { data: stats, isLoading } = useQuery<SystemStats>({
    queryKey: ['master-dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats')
      return response.data.data
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  })

  const { data: systemStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const response = await api.get('/integration/status')
      return response.data.data
    },
    refetchInterval: 10000 // Atualizar a cada 10 segundos
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8" />
      </div>
    )
  }

  const masterStats = [
    {
      title: 'Total de Empresas',
      value: stats?.master?.totalTenants || 0,
      icon: Building2,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Empresas Ativas',
      value: stats?.master?.activeTenants || 0,
      icon: Users,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      title: 'Empresas Suspensas',
      value: stats?.master?.suspendedTenants || 0,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    },
    {
      title: 'Usuários Master',
      value: stats?.master?.totalMasterUsers || 0,
      icon: Users,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    }
  ]

  const mainSystemStats = [
    {
      title: 'Usuários do Sistema',
      value: stats?.mainSystem?.totalUsers || 0,
      icon: Users,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Embarcações',
      value: stats?.mainSystem?.totalVessels || 0,
      icon: Building2,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      title: 'Reservas',
      value: stats?.mainSystem?.totalBookings || 0,
      icon: Calendar,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats?.mainSystem?.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      icon: DollarSign,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-success-600 bg-success-100'
      case 'offline':
        return 'text-danger-600 bg-danger-100'
      case 'degraded':
        return 'text-warning-600 bg-warning-100'
      default:
        return 'text-secondary-600 bg-secondary-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return Server
      case 'offline':
        return AlertTriangle
      case 'degraded':
        return Activity
      default:
        return Database
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Master Dashboard</h1>
        <p className="text-secondary-600">
          Visão geral completa dos sistemas ReservaPro
        </p>
      </div>

      {/* Status dos Sistemas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-500">Master Panel</h3>
                <p className="text-lg font-semibold text-secondary-900">
                  {systemStatus?.master?.status || 'Verificando...'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(systemStatus?.master?.status || 'unknown')}`}>
                {(() => {
                  const Icon = getStatusIcon(systemStatus?.master?.status || 'unknown')
                  return <Icon className="h-5 w-5" />
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-500">Sistema Principal</h3>
                <p className="text-lg font-semibold text-secondary-900">
                  {systemStatus?.mainSystem?.status || 'Verificando...'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(systemStatus?.mainSystem?.status || 'unknown')}`}>
                {(() => {
                  const Icon = getStatusIcon(systemStatus?.mainSystem?.status || 'unknown')
                  return <Icon className="h-5 w-5" />
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-secondary-500">Status Geral</h3>
                <p className="text-lg font-semibold text-secondary-900">
                  {systemStatus?.overall || 'Verificando...'}
                </p>
              </div>
              <div className={`p-2 rounded-full ${getStatusColor(systemStatus?.overall || 'unknown')}`}>
                {(() => {
                  const Icon = getStatusIcon(systemStatus?.overall || 'unknown')
                  return <Icon className="h-5 w-5" />
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas do Master Panel */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Master Panel</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {masterStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">
                          {stat.title}
                        </dt>
                        <dd className="text-lg font-medium text-secondary-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Estatísticas do Sistema Principal */}
      <div>
        <h2 className="text-lg font-semibold text-secondary-900 mb-4">Sistema Principal</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {mainSystemStats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.title} className="card">
                <div className="card-content">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 rounded-md p-3 ${stat.bgColor}`}>
                      <Icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-secondary-500 truncate">
                          {stat.title}
                        </dt>
                        <dd className="text-lg font-medium text-secondary-900">
                          {stat.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Links Rápidos */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Acesso Rápido</h3>
          <p className="card-description">
            Links diretos para os sistemas
          </p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <Globe className="h-8 w-8 text-primary-600 mr-4" />
              <div>
                <h4 className="font-medium text-secondary-900">Sistema Principal</h4>
                <p className="text-sm text-secondary-500">Painel administrativo e cliente</p>
              </div>
            </a>
            
            <a
              href="http://localhost:3001/health"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <Server className="h-8 w-8 text-success-600 mr-4" />
              <div>
                <h4 className="font-medium text-secondary-900">API Principal</h4>
                <p className="text-sm text-secondary-500">Health check e documentação</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}





