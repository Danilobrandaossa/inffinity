import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { Search, Filter, Download } from 'lucide-react'

export default function AuditPage() {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs', { search, dateFrom, dateTo }],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      
      const response = await api.get(`/audit?${params.toString()}`)
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Auditoria</h1>
          <p className="text-secondary-600">
            Log de todas as ações realizadas no sistema
          </p>
        </div>
        <button className="btn-outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Buscar ações..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Data Inicial
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Data Final
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>
            <div className="flex items-end">
              <button className="btn-outline w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="card">
        <div className="card-content p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Data/Hora</th>
                  <th className="table-head">Usuário</th>
                  <th className="table-head">Ação</th>
                  <th className="table-head">Entidade</th>
                  <th className="table-head">IP</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {auditLogs?.map((log: any) => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {log.masterUser?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {log.masterUser?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className="badge badge-primary">
                        {log.action}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {log.entityType || 'N/A'}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {log.entityId || 'N/A'}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {log.ipAddress || 'N/A'}
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








