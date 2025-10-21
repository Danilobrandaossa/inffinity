import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' }
];

const BLOCK_REASONS = [
  { value: 'MANUTENÇÃO', label: 'Manutenção' },
  { value: 'SORTEIO', label: 'Sorteio' },
  { value: 'INDISPONÍVEL', label: 'Indisponível' },
  { value: 'FUNCIONAMENTO', label: 'Funcionamento' },
  { value: 'OUTROS', label: 'Outros' }
];

export default function WeeklyBlocksPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    reason: '',
    notes: ''
  });

  const queryClient = useQueryClient();

  // Buscar todos os bloqueios semanais
  const { data: weeklyBlocks, isLoading } = useQuery({
    queryKey: ['weekly-blocks'],
    queryFn: async () => {
      const { data } = await api.get('/weekly-blocks');
      return data.data;
    }
  });

  // Buscar estatísticas dos bloqueios
  const { data: stats } = useQuery({
    queryKey: ['weekly-blocks-stats'],
    queryFn: async () => {
      const { data } = await api.get('/weekly-blocks/stats');
      return data.data;
    }
  });

  // Criar bloqueio semanal
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: response } = await api.post('/weekly-blocks', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks-stats'] });
      setShowModal(false);
      resetForm();
    }
  });

  // Atualizar bloqueio semanal
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: response } = await api.put(`/weekly-blocks/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks-stats'] });
      setShowModal(false);
      setEditingBlock(null);
      resetForm();
    }
  });

  // Deletar bloqueio semanal
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/weekly-blocks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks-stats'] });
    }
  });

  const resetForm = () => {
    setFormData({
      dayOfWeek: '',
      reason: '',
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      dayOfWeek: parseInt(formData.dayOfWeek)
    };

    if (editingBlock) {
      updateMutation.mutate({ id: editingBlock.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (block: any) => {
    setEditingBlock(block);
    setFormData({
      dayOfWeek: block.dayOfWeek.toString(),
      reason: block.reason,
      notes: block.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja deletar este bloqueio semanal?')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleBlockStatus = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/weekly-blocks/${id}`, { isActive: !isActive });
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-blocks-stats'] });
    } catch (error) {
      console.error('Erro ao alterar status do bloqueio:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bloqueios Semanais</h1>
          <p className="text-sm sm:text-base text-gray-600">Gerencie bloqueios que se repetem semanalmente</p>
        </div>
        <button
          onClick={() => {
            setEditingBlock(null);
            resetForm();
            setShowModal(true);
          }}
          className="btn btn-primary w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Bloqueio Semanal
        </button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat bg-base-100 shadow">
            <div className="stat-figure text-primary">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="stat-title">Total de Bloqueios</div>
            <div className="stat-value text-primary">{stats.totalBlocks}</div>
          </div>
          <div className="stat bg-base-100 shadow">
            <div className="stat-figure text-success">
              <Clock className="w-8 h-8" />
            </div>
            <div className="stat-title">Bloqueios Ativos</div>
            <div className="stat-value text-success">{stats.activeBlocks}</div>
          </div>
          <div className="stat bg-base-100 shadow">
            <div className="stat-figure text-warning">
              <Clock className="w-8 h-8" />
            </div>
            <div className="stat-title">Bloqueios Inativos</div>
            <div className="stat-value text-warning">{stats.inactiveBlocks}</div>
          </div>
          <div className="stat bg-base-100 shadow">
            <div className="stat-figure text-info">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="stat-title">Dias Bloqueados</div>
            <div className="stat-value text-info">{stats.blocksByDay.length}</div>
          </div>
        </div>
      )}

      {/* Lista de bloqueios semanais */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="table w-full text-sm sm:text-base">
            <thead>
              <tr>
                <th>Dia da Semana</th>
                <th>Motivo</th>
                <th>Observações</th>
                <th>Status</th>
                <th>Criado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {weeklyBlocks?.map((block: any) => (
                <tr key={block.id}>
                  <td>
                    <div className="font-medium">
                      {DAYS_OF_WEEK.find(d => d.value === block.dayOfWeek)?.label}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-outline">
                      {BLOCK_REASONS.find(r => r.value === block.reason)?.label || block.reason}
                    </span>
                  </td>
                  <td>{block.notes || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${block.isActive ? 'badge-success' : 'badge-error'}`}>
                        {block.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <button
                        onClick={() => toggleBlockStatus(block.id, block.isActive)}
                        className="btn btn-ghost btn-xs"
                        title={block.isActive ? 'Desativar' : 'Ativar'}
                      >
                        {block.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </td>
                  <td>{new Date(block.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(block)}
                        className="btn btn-ghost btn-sm"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(block.id)}
                        className="btn btn-ghost btn-sm text-error"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para criar/editar bloqueio semanal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingBlock ? 'Editar Bloqueio Semanal' : 'Novo Bloqueio Semanal'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Dia da Semana *</label>
                  <select
                    name="dayOfWeek"
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Selecione o dia</option>
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Motivo do Bloqueio *</label>
                  <select
                    name="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Selecione o motivo</option>
                    {BLOCK_REASONS.map(reason => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Observações</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    placeholder="Observações adicionais sobre o bloqueio..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBlock(null);
                      resetForm();
                    }}
                    className="btn btn-ghost flex-1 order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 order-1 sm:order-2"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      editingBlock ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
