import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { ArrowLeft, Building2, Users, Calendar, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function TenantDetailPage() {
  const { id } = useParams()
  
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn: async () => {
      const response = await api.get(`/tenants/${id}`)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/tenants" className="p-2 text-secondary-400 hover:text-secondary-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">{tenant?.name}</h1>
          <p className="text-secondary-600">{tenant?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Informações Gerais</h3>
            </div>
            <div className="card-content">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Nome</dt>
                  <dd className="mt-1 text-sm text-secondary-900">{tenant?.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Slug</dt>
                  <dd className="mt-1 text-sm text-secondary-900">{tenant?.slug}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Email</dt>
                  <dd className="mt-1 text-sm text-secondary-900">{tenant?.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-secondary-500">Status</dt>
                  <dd className="mt-1 text-sm text-secondary-900">{tenant?.status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Ações Rápidas</h3>
            </div>
            <div className="card-content space-y-3">
              <button className="btn-outline w-full">
                <Building2 className="h-4 w-4 mr-2" />
                Ver Empresa
              </button>
              <button className="btn-outline w-full">
                <Users className="h-4 w-4 mr-2" />
                Gerenciar Usuários
              </button>
              <button className="btn-outline w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Agendamentos
              </button>
              <button className="btn-outline w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}








