import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

interface DashboardStats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  recentActivity: Array<{
    id: string
    action: string
    tenantName: string
    timestamp: string
  }>
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/dashboard/stats')
      return response.data.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8" />
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total de Empresas',
      value: stats?.totalTenants || 0,
      icon: Building2,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100'
    },
    {
      title: 'Empresas Ativas',
      value: stats?.activeTenants || 0,
      icon: Users,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    },
    {
      title: 'Empresas Suspensas',
      value: stats?.suspendedTenants || 0,
      icon: AlertTriangle,
      color: 'text-danger-600',
      bgColor: 'bg-danger-100'
    },
    {
      title: 'Total de Usuários',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-100'
    },
    {
      title: 'Agendamentos',
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100'
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats?.totalRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      icon: DollarSign,
      color: 'text-success-600',
      bgColor: 'bg-success-100'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="text-secondary-600">
          Visão geral do sistema ReservaPro
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
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

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Atividade Recente</h3>
          <p className="card-description">
            Últimas ações realizadas no sistema
          </p>
        </div>
        <div className="card-content">
          {stats?.recentActivity?.length ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {stats.recentActivity.map((activity, index) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {index !== stats.recentActivity.length - 1 && (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-secondary-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
                            <TrendingUp className="h-4 w-4 text-primary-600" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm text-secondary-500">
                              {activity.action} em <span className="font-medium text-secondary-900">{activity.tenantName}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-secondary-500">
                            {new Date(activity.timestamp).toLocaleString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-secondary-500">Nenhuma atividade recente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}








