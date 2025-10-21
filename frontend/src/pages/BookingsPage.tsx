import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Plus, X, Ship, User, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BookingsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();
  const isBlocked = user?.status === 'BLOCKED';
  const hasPaymentIssues = user?.status === 'OVERDUE_PAYMENT' || user?.status === 'OVERDUE';
  
  
  const [selectedVessel, setSelectedVessel] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Estados para funcionalidades de admin
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // Buscar embarcações
  const { data: vessels } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const { data } = await api.get(isAdmin ? '/vessels' : '/vessels/my-vessels');
      return data;
    },
  });

  // Buscar calendário da embarcação selecionada
  const { data: calendar } = useQuery({
    queryKey: ['calendar', selectedVessel?.id, currentMonth],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const { data } = await api.get(`/bookings/calendar/${selectedVessel.id}`, {
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
      });
      return data;
    },
    enabled: !!selectedVessel,
  });

  // Buscar todas as reservas
  const { data: allBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings');
      return data;
    },
  });

  // Criar reserva
  const createBooking = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/bookings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Reserva criada com sucesso!');
      setShowModal(false);
      setSelectedDate(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar reserva');
    },
  });

  // Cancelar reserva
  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/bookings/${id}/cancel`, { reason: 'Cancelado pelo usuário' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      toast.success('Reserva cancelada!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao cancelar reserva');
    },
  });

  const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !selectedVessel) return;

    const formData = new FormData(e.currentTarget);
    createBooking.mutate({
      vesselId: selectedVessel.id,
      bookingDate: selectedDate.toISOString(),
      notes: formData.get('notes'),
    });
  };

  const handleAdminAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const actionType = formData.get('actionType') as string;
    const notes = formData.get('notes') as string;
    
    // Determinar quais datas processar
    const datesToProcess = selectedDates.length > 0 ? selectedDates : [selectedDate!];
    
    try {
      for (const date of datesToProcess) {
        if (actionType === 'RESERVED') {
          // Criar reserva normal
          await api.post('/bookings', {
            vesselId: selectedVessel.id,
            bookingDate: date.toISOString().split('T')[0],
            notes: notes || 'Reserva criada pelo administrador'
          });
        } else {
          // Criar bloqueio de data
          await api.post('/blocked-dates', {
            vesselId: selectedVessel.id,
            startDate: date.toISOString().split('T')[0],
            endDate: date.toISOString().split('T')[0],
            reason: actionType,
            notes: notes
          });
        }
      }
      
      toast.success(`Ação "${actionType}" aplicada com sucesso!`);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar', selectedVessel.id] });
      
      // Limpar estados
      setShowAdminModal(false);
      setSelectedDate(null);
      setSelectedDates([]);
      setIsMultiSelectMode(false);
      
    } catch (error: any) {
      toast.error('Erro ao processar ação: ' + (error.response?.data?.message || 'Erro desconhecido'));
    }
  };

  const handleCancelBooking = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      cancelBooking.mutate(id);
    }
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  };

  const isDateBooked = (date: Date) => {
    if (!calendar) return false;
    return calendar.bookings.some((b: any) => 
      isSameDay(new Date(b.bookingDate), date)
    );
  };

  const getBlockedDateInfo = (date: Date) => {
    if (!calendar) return null;
    return calendar.blockedDates.find((bd: any) => {
      const start = new Date(bd.startDate);
      const end = new Date(bd.endDate);
      return (isAfter(date, start) || isSameDay(date, start)) && 
             (isBefore(date, end) || isSameDay(date, end));
    });
  };

  // Função para verificar se uma data está bloqueada por bloqueio semanal
  const getWeeklyBlockInfo = (date: Date) => {
    if (!calendar?.weeklyBlocks) return null;
    
    const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Segunda, etc.
    
    return calendar.weeklyBlocks.find((block: any) => {
      return block.dayOfWeek === dayOfWeek && block.isActive;
    });
  };

  const isDateBlocked = (date: Date) => {
    return getBlockedDateInfo(date) !== null;
  };

  const getBookingForDate = (date: Date) => {
    if (!calendar) return null;
    return calendar.bookings.find((b: any) => 
      isSameDay(new Date(b.bookingDate), date)
    );
  };

  const days = selectedVessel ? getDaysInMonth() : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
        <p className="text-gray-600 mt-1">
          Visualize e gerencie suas reservas
        </p>
      </div>

      {/* Avisos de Status */}
      {isBlocked && (
        <div className="card bg-red-50 border-2 border-red-300">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-red-900 mb-2">
                🚫 Conta Bloqueada - Reservas Desabilitadas
              </h3>
              <p className="text-red-800">
                Você não pode fazer novas reservas no momento. Entre em contato com o administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      {hasPaymentIssues && (
        <div className="card bg-orange-50 border-2 border-orange-300">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-orange-900 mb-2">
                ⚠️ Atenção - Regularize sua Situação
              </h3>
              <p className="text-orange-800">
                {user?.status === 'OVERDUE_PAYMENT' 
                  ? 'Você possui pagamentos pendentes. Regularize para continuar fazendo reservas.'
                  : 'Você possui pendências. Regularize sua situação para continuar fazendo reservas.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seleção de Embarcação */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-bold mb-4">Selecione uma Embarcação</h2>
            <div className="space-y-2">
              {vessels?.map((vessel: any) => (
                <button
                  key={vessel.id}
                  onClick={() => setSelectedVessel(vessel)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedVessel?.id === vessel.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Ship className="w-5 h-5 mr-2 text-primary-600" />
                    <div>
                      <p className="font-medium">{vessel.name}</p>
                      {vessel.location && (
                        <p className="text-xs text-gray-500">{vessel.location}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calendário */}
        <div className="lg:col-span-2">
          {selectedVessel ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedVessel.name}</h2>
                  <p className="text-sm text-gray-600">
                    Reservas permitidas até {selectedVessel.calendarDaysAhead || 62} dias à frente
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
                      className="btn btn-outline px-3 py-1 text-sm"
                    >
                      ←
                    </button>
                    <span className="text-sm font-medium text-center">
                      {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <button
                      onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
                      className="btn btn-outline px-3 py-1 text-sm"
                    >
                      →
                    </button>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                      <button
                        onClick={() => {
                          setIsMultiSelectMode(!isMultiSelectMode);
                          setSelectedDates([]);
                        }}
                        className={`btn btn-sm ${isMultiSelectMode ? 'btn-primary' : 'btn-outline'}`}
                      >
                        {isMultiSelectMode ? 'Sair do Modo' : 'Modo Seleção'}
                      </button>
                      {isMultiSelectMode && selectedDates.length > 0 && (
                        <button
                          onClick={() => setShowAdminModal(true)}
                          className="btn btn-sm btn-primary"
                        >
                          Processar {selectedDates.length} Data{selectedDates.length > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Legendas */}
              <div className="flex flex-wrap gap-2 sm:gap-4 mb-4 text-xs">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
                  Disponível
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded mr-1"></div>
                  Reservado
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-600 rounded mr-1"></div>
                  Manutenção
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-900 rounded mr-1"></div>
                  Sorteio
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-1"></div>
                  Indisponível
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 rounded mr-1"></div>
                  Muito Distante
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded mr-1"></div>
                  Bloqueio Semanal
                </div>
              </div>

              {/* Grid do Calendário */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
                
                {days.map((day, idx) => {
                  const isBooked = isDateBooked(day);
                  const blockedInfo = getBlockedDateInfo(day);
                  const weeklyBlockInfo = getWeeklyBlockInfo(day);
                  const isDateBlocked = blockedInfo !== null || weeklyBlockInfo !== null;
                  const booking = getBookingForDate(day);
                  const today = startOfDay(new Date());
                  const isPast = isBefore(day, today);
                  // Verificar limite máximo de dias à frente (configurado por embarcação)
                  const maxDaysAhead = selectedVessel.calendarDaysAhead || 62;
                  const maxAllowedDate = addDays(today, maxDaysAhead);
                  const isTooFarAhead = isAfter(day, maxAllowedDate);
                  
                  // Verificar se a data está selecionada (modo múltipla seleção)
                  const isSelected = isAdmin && isMultiSelectMode && selectedDates.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
                  
                  
                  // Usuário bloqueado não pode fazer reservas
                  // Simplificar a lógica para permitir seleção de datas
                  const canBook = !isBooked && !isDateBlocked && !isPast && !isTooFarAhead;
                  
                  

                  // Definir cores baseadas no tipo de bloqueio
                  let bgColor = '';
                  let textColor = 'text-white';
                  let title = '';

                  if (isSelected) {
                    bgColor = 'bg-blue-200 border-2 border-blue-500';
                    textColor = 'text-blue-900';
                    title = 'Data selecionada';
                  } else if (isPast) {
                    bgColor = 'bg-gray-100';
                    textColor = 'text-gray-400';
                    title = 'Data passada';
                  } else if (isTooFarAhead) {
                    bgColor = 'bg-gray-200';
                    textColor = 'text-gray-500';
                    title = `Data muito distante (limite: ${maxDaysAhead} dias)`;
                  } else if (isDateBlocked) {
                    // Priorizar bloqueio semanal sobre bloqueio específico
                    const blockInfo = weeklyBlockInfo || blockedInfo;
                    const blockType = weeklyBlockInfo ? 'SEMANAL' : 'ESPECÍFICO';
                    
                    switch (blockInfo.reason) {
                      case 'MANUTENÇÃO':
                      case 'MAINTENANCE':
                        bgColor = 'bg-red-600';
                        title = `Bloqueado (${blockType}): Manutenção${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      case 'SORTEIO':
                      case 'DRAW':
                        bgColor = 'bg-gray-900';
                        title = `Bloqueado (${blockType}): Sorteio${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      case 'OVERDUE_PAYMENT':
                        bgColor = 'bg-yellow-600';
                        title = `Bloqueado (${blockType}): Inadimplência${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      case 'INDISPONÍVEL':
                      case 'UNAVAILABLE':
                        bgColor = 'bg-orange-500';
                        title = `Bloqueado (${blockType}): Indisponível${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      case 'FUNCIONAMENTO':
                        bgColor = 'bg-purple-600';
                        title = `Bloqueado (${blockType}): Funcionamento${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      default:
                        bgColor = 'bg-gray-600';
                        title = `Bloqueado (${blockType})${blockInfo.notes ? ': ' + blockInfo.notes : ''}`;
                    }
                  } else if (isBooked) {
                    bgColor = 'bg-blue-400';
                    title = `Reservado por ${booking?.user.name}`;
                  } else if (canBook) {
                    bgColor = 'bg-green-50 border-green-200 hover:bg-green-100';
                    textColor = 'text-gray-900';
                    title = 'Disponível - Clique para reservar';
                  } else {
                    // Data disponível mas não pode reservar (por outras razões)
                    bgColor = 'bg-green-50 border-green-200';
                    textColor = 'text-gray-900';
                    title = 'Disponível';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        if (isAdmin && isMultiSelectMode) {
                          // Modo seleção múltipla para admin
                          const dateStr = format(day, 'yyyy-MM-dd');
                          const isSelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
                          
                          if (isSelected) {
                            setSelectedDates(prev => prev.filter(d => format(d, 'yyyy-MM-dd') !== dateStr));
                          } else {
                            setSelectedDates(prev => [...prev, day]);
                          }
                        } else {
                          // Modo normal - abrir modal de reserva
                          setSelectedDate(day);
                          if (isAdmin) {
                            setShowAdminModal(true);
                          } else {
                            setShowModal(true);
                          }
                        }
                      }}
                      className={`
                        aspect-square p-1 sm:p-2 text-xs sm:text-sm rounded-lg border transition-colors
                        ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}
                        ${bgColor}
                        ${textColor}
                        cursor-pointer
                      `}
                      title={title}
                    >
                      <div>{format(day, 'd')}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Selecione uma embarcação para ver o calendário
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Reservas */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          {isAdmin ? 'Todas as Reservas' : 'Minhas Reservas'}
        </h2>
        
        {allBookings && allBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-header">Embarcação</th>
                  {isAdmin && <th className="table-header">Usuário</th>}
                  <th className="table-header">Data</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Ações</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {allBookings.map((booking: any) => (
                  <tr key={booking.id}>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <Ship className="w-4 h-4 mr-2 text-gray-400" />
                        {booking.vessel.name}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="table-cell">
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {booking.user.name}
                        </div>
                      </td>
                    )}
                    <td className="table-cell">
                      {format(new Date(booking.bookingDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'APPROVED' ? 'Aprovado' :
                         booking.status === 'CANCELLED' ? 'Cancelado' :
                         booking.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                      </span>
                    </td>
                    <td className="table-cell">
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="btn btn-danger text-xs px-3 py-1"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            Nenhuma reserva encontrada
          </p>
        )}
      </div>

      {/* Modal de Nova Reserva */}
      {showModal && selectedDate && selectedVessel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Nova Reserva</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="label">Embarcação</label>
                  <input
                    type="text"
                    value={selectedVessel.name}
                    className="input bg-white text-gray-900"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Data</label>
                  <input
                    type="text"
                    value={format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    className="input bg-white text-gray-900"
                    disabled
                  />
                </div>

                <div>
                  <label className="label">Observações (opcional)</label>
                  <textarea
                    name="notes"
                    className="input bg-white text-gray-900"
                    rows={3}
                    placeholder="Adicione observações sobre sua reserva"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedDate(null);
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createBooking.isPending}
                    className="flex-1 btn btn-primary"
                  >
                    {createBooking.isPending ? 'Reservando...' : 'Confirmar Reserva'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Especial para Admin */}
      {showAdminModal && selectedVessel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Gerenciar Datas</h2>
                <button
                  onClick={() => {
                    setShowAdminModal(false);
                    setSelectedDate(null);
                    setSelectedDates([]);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <label className="label">Embarcação</label>
                <input
                  type="text"
                  value={selectedVessel.name}
                  className="input bg-white text-gray-900"
                  disabled
                />
              </div>

              {selectedDate && (
                <div className="mb-4">
                  <label className="label">Data Selecionada</label>
                  <input
                    type="text"
                    value={format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    className="input bg-white text-gray-900"
                    disabled
                  />
                </div>
              )}

              {selectedDates.length > 0 && (
                <div className="mb-4">
                  <label className="label">Datas Selecionadas ({selectedDates.length})</label>
                  <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
                    {selectedDates.map((date, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        {format(date, "dd/MM/yyyy")}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleAdminAction} className="space-y-4">
                <div>
                  <label className="label">Tipo de Ação *</label>
                  <select
                    name="actionType"
                    className="input bg-white text-gray-900"
                    required
                  >
                    <option value="">Selecione uma opção</option>
                    <option value="RESERVED">Reservado</option>
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="DRAW">Sorteio</option>
                    <option value="UNAVAILABLE">Indisponível</option>
                  </select>
                </div>

                <div>
                  <label className="label">Observações</label>
                  <textarea
                    name="notes"
                    className="input bg-white text-gray-900"
                    rows={3}
                    placeholder="Adicione observações sobre a ação"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminModal(false);
                      setSelectedDate(null);
                      setSelectedDates([]);
                    }}
                    className="flex-1 btn btn-outline"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    Confirmar Ação
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

