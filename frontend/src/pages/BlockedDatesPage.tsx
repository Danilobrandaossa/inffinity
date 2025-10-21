import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldBan, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BlockedDatesPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data: blockedDates, isLoading } = useQuery({
    queryKey: ['blocked-dates'],
    queryFn: async () => {
      const { data } = await api.get('/blocked-dates');
      return data;
    },
  });

  const { data: vessels } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const { data } = await api.get('/vessels');
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/blocked-dates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      toast.success('Bloqueio criado!');
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar bloqueio');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/blocked-dates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-dates'] });
      toast.success('Bloqueio removido!');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      vesselId: formData.get('vesselId'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      reason: formData.get('reason'),
      notes: formData.get('notes'),
    });
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Datas Bloqueadas</h1>
          <p className="text-gray-600 mt-1">Gerencie bloqueios de datas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Novo Bloqueio
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="table">
          <thead className="table-head">
            <tr>
              <th className="table-header">Embarcação</th>
              <th className="table-header">Data Início</th>
              <th className="table-header">Data Fim</th>
              <th className="table-header">Motivo</th>
              <th className="table-header">Ações</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {blockedDates?.map((block: any) => (
              <tr key={block.id}>
                <td className="table-cell font-medium">{block.vessel.name}</td>
                <td className="table-cell">{format(new Date(block.startDate), 'dd/MM/yyyy', { locale: ptBR })}</td>
                <td className="table-cell">{format(new Date(block.endDate), 'dd/MM/yyyy', { locale: ptBR })}</td>
                <td className="table-cell">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    block.reason === 'MAINTENANCE' ? 'bg-red-100 text-red-800' :
                    block.reason === 'DRAW' ? 'bg-gray-800 text-white' :
                    block.reason === 'UNAVAILABLE' ? 'bg-orange-100 text-orange-800' :
                    block.reason === 'OVERDUE_PAYMENT' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {block.reason === 'MAINTENANCE' ? '🔴 Manutenção' :
                     block.reason === 'DRAW' ? '⚫ Sorteio' :
                     block.reason === 'UNAVAILABLE' ? '🟠 Indisponível' :
                     block.reason === 'OVERDUE_PAYMENT' ? '🟡 Inadimplência' :
                     '⚪ Outro'}
                  </span>
                </td>
                <td className="table-cell">
                  <button onClick={() => { if(confirm('Remover bloqueio?')) deleteMutation.mutate(block.id); }} className="btn btn-danger text-xs px-3 py-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Novo Bloqueio</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Embarcação *</label>
                <select name="vesselId" className="input bg-white text-gray-900" required>
                  <option value="">Selecione...</option>
                  {vessels?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Data Início *</label>
                <input name="startDate" type="date" className="input bg-white text-gray-900" required />
              </div>
              <div>
                <label className="label">Data Fim *</label>
                <input name="endDate" type="date" className="input bg-white text-gray-900" required />
              </div>
                <div>
                  <label className="label">Motivo *</label>
                  <select name="reason" className="input bg-white text-gray-900" required>
                    <option value="MAINTENANCE">🔴 Manutenção</option>
                    <option value="DRAW">⚫ Sorteio</option>
                    <option value="UNAVAILABLE">🟠 Indisponível</option>
                    <option value="OVERDUE_PAYMENT">🟡 Inadimplência</option>
                    <option value="OTHER">⚪ Outro</option>
                  </select>
                </div>
              <div>
                <label className="label">Observações</label>
                <textarea name="notes" className="input bg-white text-gray-900" rows={3}></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-outline">Cancelar</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 btn btn-primary">
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

