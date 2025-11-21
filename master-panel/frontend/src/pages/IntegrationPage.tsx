import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  Users,
  Building2,
  Calendar,
  Activity
} from 'lucide-react'

interface MainSystemUser {
  id: string
  email: string
  name: string
  role: string
  status: string
  phone?: string
  createdAt: string
  lastLoginAt?: string
}

export default function IntegrationPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'vessels' | 'bookings'>('users')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['main-system-users', { search, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await api.get(`/integration/users?${params.toString()}`)
      return response.data.data
    },
    enabled: activeTab === 'users'
  })

  const { data: vessels, isLoading: vesselsLoading } = useQuery({
    queryKey: ['main-system-vessels', { search }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      
      const response = await api.get(`/integration/vessels?${params.toString()}`)
      return response.data.data
    },
    enabled: activeTab === 'vessels'
  })

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['main-system-bookings', { search, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await api.get(`/integration/bookings?${params.toString()}`)
      return response.data.data
    },
    enabled: activeTab === 'bookings'
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativo', className: 'badge-success' },
      SUSPENDED: { label: 'Suspenso', className: 'badge-danger' },
      PENDING: { label: 'Pendente', className: 'badge-warning' },
      INACTIVE: { label: 'Inativo', className: 'badge-secondary' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <span className={`badge ${config.className}`}>{config.label}</span>
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { label: 'Admin', className: 'badge-primary' },
      USER: { label: 'Usuário', className: 'badge-secondary' }
    }
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.USER
    return <span className={`badge ${config.className}`}>{config.label}</span>
  }

  const isLoading = usersLoading || vesselsLoading || bookingsLoading

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Integração com Sistema Principal</h1>
        <p className="text-secondary-600">
          Gerencie usuários, embarcações e reservas do sistema principal
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', label: 'Usuários', icon: Users },
            { id: 'vessels', label: 'Embarcações', icon: Building2 },
            { id: 'bookings', label: 'Reservas', icon: Calendar }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            {activeTab === 'users' && (
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="">Todos os status</option>
                  <option value="ACTIVE">Ativo</option>
                  <option value="SUSPENDED">Suspenso</option>
                  <option value="PENDING">Pendente</option>
                  <option value="INACTIVE">Inativo</option>
                </select>
              </div>
            )}
            {activeTab === 'bookings' && (
              <div className="sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input"
                >
                  <option value="">Todos os status</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="PENDING">Pendente</option>
                  <option value="CANCELLED">Cancelado</option>
                  <option value="COMPLETED">Concluído</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="card">
        <div className="card-content p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="loading-spinner h-8 w-8" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'users' && (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-head">Usuário</th>
                      <th className="table-head">Função</th>
                      <th className="table-head">Status</th>
                      <th className="table-head">Telefone</th>
                      <th className="table-head">Último Login</th>
                      <th className="table-head">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {users?.map((user: MainSystemUser) => (
                      <tr key={user.id} className="table-row">
                        <td className="table-cell">
                          <div>
                            <div className="font-medium text-secondary-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            {user.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            {user.lastLoginAt 
                              ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR')
                              : 'Nunca'
                            }
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-secondary-400 hover:text-secondary-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-secondary-400 hover:text-secondary-600">
                              <Edit className="h-4 w-4" />
                            </button>
                            {user.status === 'ACTIVE' ? (
                              <button className="p-1 text-warning-400 hover:text-warning-600">
                                <ShieldOff className="h-4 w-4" />
                              </button>
                            ) : (
                              <button className="p-1 text-success-400 hover:text-success-600">
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'vessels' && (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-head">Embarcação</th>
                      <th className="table-head">Descrição</th>
                      <th className="table-head">Capacidade</th>
                      <th className="table-head">Preço/Hora</th>
                      <th className="table-head">Status</th>
                      <th className="table-head">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {vessels?.map((vessel: any) => (
                      <tr key={vessel.id} className="table-row">
                        <td className="table-cell">
                          <div className="font-medium text-secondary-900">
                            {vessel.name}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            {vessel.description || 'N/A'}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            {vessel.capacity} pessoas
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            R$ {vessel.pricePerHour?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                          </div>
                        </td>
                        <td className="table-cell">
                          {vessel.isActive ? (
                            <span className="badge badge-success">Ativo</span>
                          ) : (
                            <span className="badge badge-danger">Inativo</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-secondary-400 hover:text-secondary-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-secondary-400 hover:text-secondary-600">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'bookings' && (
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-head">Cliente</th>
                      <th className="table-head">Embarcação</th>
                      <th className="table-head">Data/Hora</th>
                      <th className="table-head">Valor</th>
                      <th className="table-head">Status</th>
                      <th className="table-head">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {bookings?.map((booking: any) => (
                      <tr key={booking.id} className="table-row">
                        <td className="table-cell">
                          <div className="font-medium text-secondary-900">
                            {booking.user?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-secondary-500">
                            {booking.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="font-medium text-secondary-900">
                            {booking.vessel?.name || 'N/A'}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            {new Date(booking.startDate).toLocaleString('pt-BR')}
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900">
                            R$ {booking.totalPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                          </div>
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(booking.status)}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-secondary-400 hover:text-secondary-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-secondary-400 hover:text-secondary-600">
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





