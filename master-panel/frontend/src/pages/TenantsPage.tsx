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
  ShieldOff
} from 'lucide-react'

interface Tenant {
  id: string
  name: string
  slug: string
  email: string
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'TRIAL'
  plan: {
    name: string
    type: string
  }
  users: Array<{
    id: string
    email: string
    name: string
    role: string
  }>
  createdAt: string
}

export default function TenantsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenants', { search, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      
      const response = await api.get(`/tenants?${params.toString()}`)
      return response.data.data
    }
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Ativo', className: 'badge-success' },
      SUSPENDED: { label: 'Suspenso', className: 'badge-danger' },
      PENDING: { label: 'Pendente', className: 'badge-warning' },
      TRIAL: { label: 'Trial', className: 'badge-primary' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    return <span className={`badge ${config.className}`}>{config.label}</span>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Empresas</h1>
          <p className="text-secondary-600">
            Gerencie todas as empresas cadastradas
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </button>
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
                  placeholder="Buscar empresas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
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
                <option value="TRIAL">Trial</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Empresa</th>
                  <th className="table-head">Status</th>
                  <th className="table-head">Plano</th>
                  <th className="table-head">Usuários</th>
                  <th className="table-head">Criado em</th>
                  <th className="table-head">Ações</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {tenants?.map((tenant: Tenant) => (
                  <tr key={tenant.id} className="table-row">
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-secondary-900">
                          {tenant.name}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {tenant.email}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {getStatusBadge(tenant.status)}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {tenant.plan?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {tenant.plan?.type || 'N/A'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {tenant.users?.length || 0} usuários
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/tenants/${tenant.id}`}
                          className="p-1 text-secondary-400 hover:text-secondary-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="p-1 text-secondary-400 hover:text-secondary-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        {tenant.status === 'ACTIVE' ? (
                          <button className="p-1 text-warning-400 hover:text-warning-600">
                            <ShieldOff className="h-4 w-4" />
                          </button>
                        ) : (
                          <button className="p-1 text-success-400 hover:text-success-600">
                            <Shield className="h-4 w-4" />
                          </button>
                        )}
                        <button className="p-1 text-danger-400 hover:text-danger-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}








