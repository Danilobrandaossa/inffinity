import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Plus, X, Ship, User, AlertCircle, Lock, Crown, Wrench } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, startOfDay, startOfWeek, getDay, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Helper para parsear data do backend sem problemas de timezone
// Se a data vem como string no formato YYYY-MM-DD, cria Date local diretamente
const parseBookingDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  
  // Se é string no formato YYYY-MM-DD, criar Date local diretamente
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  
  // Se é string ISO, extrair apenas a parte da data e criar localmente
  if (typeof dateString === 'string' && dateString.includes('T')) {
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  
  // Fallback: usar new Date normal
  const date = new Date(dateString);
  // Se houve conversão de timezone, extrair componentes e criar localmente
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
};

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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);

  // Buscar embarcações
  const { data: vessels } = useQuery({
    queryKey: ['vessels'],
    queryFn: async () => {
      const { data } = await api.get(isAdmin ? '/vessels' : '/vessels/my-vessels');
      return data;
    },
    staleTime: 30 * 1000, // 30 segundos - reduz requisições desnecessárias
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
    staleTime: 30 * 1000, // 30 segundos - reduz requisições desnecessárias
  });

  // Buscar todas as reservas (excluindo canceladas por padrão para evitar confusão)
  const { data: allBookings } = useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data } = await api.get('/bookings'); // Backend já exclui canceladas por padrão
      // Filtrar canceladas no frontend também como backup
      return data ? data.filter((b: any) => b.status !== 'CANCELLED') : [];
    },
    staleTime: 10 * 1000, // 10 segundos - equilibra atualização e estabilidade
  });

  // Criar reserva
  const createBooking = useMutation({
    mutationFn: async (data: any) => {
      return api.post('/bookings', data);
    },
    // Atualização otimista - adiciona à UI imediatamente
    onMutate: async (newBooking) => {
      // Preservar dados antes de cancelar
      const previousBookings = queryClient.getQueryData(['bookings']);
      const previousCalendar = selectedVessel 
        ? queryClient.getQueryData(['calendar', selectedVessel.id, currentMonth])
        : null;
      
      // Não cancelar queries para não afetar outras páginas
      // await queryClient.cancelQueries({ queryKey: ['bookings'] });
      // await queryClient.cancelQueries({ queryKey: ['calendar'] });

      // Adicionar reserva temporária à lista
      const tempBooking = {
        id: `temp-${Date.now()}`,
        ...newBooking,
        vessel: selectedVessel,
        user: user,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      queryClient.setQueryData(['bookings'], (old: any) => {
        return old ? [tempBooking, ...old] : [tempBooking];
      });

      // Atualizar calendário também
      if (selectedVessel) {
        queryClient.setQueryData(['calendar', selectedVessel.id, currentMonth], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            bookings: [...(old.bookings || []), tempBooking],
          };
        });
      }

      return { previousBookings, previousCalendar };
    },
    onSuccess: (response) => {
      // Substituir reserva temporária pela real da API
      if (response?.data) {
        queryClient.setQueryData(['bookings'], (old: any) => {
          if (!old) return [response.data];
          return old.map((b: any) => 
            b.id?.toString().startsWith('temp-') ? response.data : b
          );
        });

        // Atualizar calendário também
        if (selectedVessel) {
          queryClient.setQueryData(['calendar', selectedVessel.id, currentMonth], (old: any) => {
            if (!old) return old;
            return {
              ...old,
              bookings: old.bookings.map((b: any) =>
                b.id?.toString().startsWith('temp-') ? response.data : b
              ),
            };
          });
        }
      }

      // Invalidar e refetch para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      queryClient.refetchQueries({ queryKey: ['bookings'] });
      queryClient.refetchQueries({ queryKey: ['calendar'] });
      
      toast.success('Reserva criada com sucesso!');
      setShowModal(false);
      setSelectedDate(null);
    },
    onError: (error: any, newBooking, context) => {
      // Reverter para valor anterior em caso de erro
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
      if (context?.previousCalendar && selectedVessel) {
        queryClient.setQueryData(['calendar', selectedVessel.id, currentMonth], context.previousCalendar);
      }
      toast.error(error.response?.data?.error || 'Erro ao criar reserva');
    },
  });

  // Cancelar reserva
  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      return api.post(`/bookings/${id}/cancel`, { reason: 'Cancelado pelo usuário' });
    },
    // Atualização otimista - remove da UI imediatamente
    onMutate: async (bookingId) => {
      // Preservar dados antes de atualizar
      const previousBookings = queryClient.getQueryData(['bookings']);
      
      // Não cancelar queries para não afetar outras páginas
      // await queryClient.cancelQueries({ queryKey: ['bookings'] });
      // await queryClient.cancelQueries({ queryKey: ['calendar'] });

      // Atualizar status para CANCELLED imediatamente
      queryClient.setQueryData(['bookings'], (old: any) => {
        return old ? old.map((b: any) => 
          b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
        ) : [];
      });

      // Atualizar calendário também
      if (selectedVessel) {
        queryClient.setQueryData(['calendar', selectedVessel.id, currentMonth], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            bookings: old.bookings.map((b: any) =>
              b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
            ),
          };
        });
      }

      return { previousBookings };
    },
    onSuccess: (response) => {
      // Remover reserva cancelada da lista (canceladas não aparecem na lista principal)
      queryClient.setQueryData(['bookings'], (old: any) => {
        if (!old) return [];
        // Remover a reserva cancelada da lista ao invés de atualizar
        return old.filter((b: any) => b.id !== response?.data?.id);
      });

      // Atualizar calendário (mantém canceladas mas marca como canceladas)
      if (selectedVessel && response?.data) {
        queryClient.setQueryData(['calendar', selectedVessel.id, currentMonth], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            bookings: old.bookings.map((b: any) =>
              b.id === response.data.id ? { ...b, status: 'CANCELLED' } : b
            ),
          };
        });
      }

      // Invalidar para garantir sincronização completa
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['calendar'] });
      
      toast.success('Reserva cancelada!');
      setShowCancelModal(false);
      setBookingToCancel(null);
    },
    onError: (error: any, bookingId, context) => {
      // Reverter em caso de erro
      if (context?.previousBookings) {
        queryClient.setQueryData(['bookings'], context.previousBookings);
      }
      toast.error(error.response?.data?.error || 'Erro ao cancelar reserva');
    },
  });

  const handleCreateBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !selectedVessel) return;

    const formData = new FormData(e.currentTarget);
    // Garantir normalização da data e enviar apenas data (YYYY-MM-DD)
    const normalizedDate = startOfDay(selectedDate);
    const dateOnly = format(normalizedDate, 'yyyy-MM-dd');
    createBooking.mutate({
      vesselId: selectedVessel.id,
      bookingDate: dateOnly,
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

  const handleCancelBooking = (booking: any) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = () => {
    if (bookingToCancel) {
      cancelBooking.mutate(bookingToCancel.id);
    }
  };

  const getDaysInMonth = () => {
    // Começar na primeira semana que contém o primeiro dia do mês
    // date-fns startOfWeek usa segunda-feira por padrão, precisamos domingo (0)
    const firstDayOfMonth = startOfMonth(currentMonth);
    const firstDayOfCalendar = startOfWeek(firstDayOfMonth, { weekStartsOn: 0 }); // 0 = Domingo
    const lastDayOfMonth = endOfMonth(currentMonth);
    const lastDayOfCalendar = startOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    // Se o último dia do mês não está na mesma semana, precisamos incluir a semana seguinte
    const end = lastDayOfMonth.getDate() >= 25 ? 
      addDays(lastDayOfCalendar, 6) : // Semana completa após o último dia do mês
      lastDayOfMonth;
    
    const days = eachDayOfInterval({ start: firstDayOfCalendar, end });
    // Normalizar todas as datas para início do dia no timezone local
    return days.map(day => startOfDay(day));
  };

  const isDateBooked = (date: Date) => {
    if (!calendar) return false;
    return calendar.bookings.some((b: any) => 
      isSameDay(parseBookingDate(b.bookingDate), date) && b.status !== 'CANCELLED'
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
    const blockedInfo = getBlockedDateInfo(date);
    const weeklyBlockInfo = getWeeklyBlockInfo(date);
    return blockedInfo !== null || weeklyBlockInfo !== null;
  };

  const getBookingForDate = (date: Date) => {
    if (!calendar) return null;
    return calendar.bookings.find((b: any) => 
      isSameDay(parseBookingDate(b.bookingDate), date) && b.status !== 'CANCELLED'
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
                  <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: '#F3F4F6' }}></div>
                  Datas Livres
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded mr-1"></div>
                  Reservado
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-1 flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                  Sorteio
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-1 flex items-center justify-center" style={{ backgroundColor: 'rgb(220 38 38)' }}>
                    <Wrench className="w-3 h-3 text-white" />
                  </div>
                  Manutenção
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 rounded mr-1 flex items-center justify-center" style={{ backgroundColor: '#F3F4F6' }}>
                    <Lock className="w-3 h-3 text-gray-600" />
                  </div>
                  Muito Distante
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
                  // Verificar se o dia pertence ao mês atual
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  
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
                    bgColor = '#F3F4F6';
                    textColor = 'text-gray-600';
                    title = `Data muito distante (limite: ${maxDaysAhead} dias)`;
                  } else if (isDateBlocked) {
                    // Priorizar bloqueio semanal sobre bloqueio específico
                    const blockInfo = weeklyBlockInfo || blockedInfo;
                    
                    if (blockInfo && blockInfo.reason) {
                      switch (blockInfo.reason) {
                      case 'MANUTENÇÃO':
                      case 'MAINTENANCE':
                        bgColor = 'rgb(220 38 38)';
                        textColor = 'text-white';
                        title = `Manutenção${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      case 'SORTEIO':
                      case 'DRAW':
                        bgColor = 'rgb(17 24 39)';
                        textColor = 'text-white';
                        title = `Sorteio${blockInfo.notes ? ' - ' + blockInfo.notes : ''}`;
                        break;
                      default:
                        // Outros tipos de bloqueio não são mais exibidos - mostrar como disponível
                        bgColor = '#F3F4F6';
                        textColor = 'text-gray-900';
                        title = 'Data disponível';
                    }
                    } else {
                      // Fallback
                      bgColor = '#F3F4F6';
                      textColor = 'text-gray-900';
                      title = 'Data disponível';
                    }
                  } else if (isBooked) {
                    bgColor = 'bg-green-500';
                    textColor = 'text-white';
                    title = `Reservado por ${booking?.user.name}`;
                  } else {
                    // Datas livres
                    bgColor = '#F3F4F6';
                    textColor = 'text-gray-900';
                    title = canBook ? 'Disponível - Clique para reservar' : 'Data disponível';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        // Não permitir interação com dias de outros meses
                        if (!isCurrentMonth) return;
                        
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
                          // Criar uma nova instância da data para garantir que não há problemas de referência
                          // Usar os componentes da data (ano, mês, dia) para criar uma data limpa no timezone local
                          const year = day.getFullYear();
                          const month = day.getMonth();
                          const date = day.getDate();
                          const cleanDate = new Date(year, month, date, 0, 0, 0, 0);
                          setSelectedDate(cleanDate);
                          
                          if (isAdmin) {
                            setShowAdminModal(true);
                          } else {
                            setShowModal(true);
                          }
                        }
                      }}
                      className={`
                        aspect-square p-1 sm:p-2 text-xs sm:text-sm rounded-lg border transition-colors relative
                        ${!isCurrentMonth ? 'opacity-30' : ''}
                        ${textColor}
                        ${isCurrentMonth ? 'cursor-pointer' : 'cursor-default'}
                      `}
                      style={{ 
                        backgroundColor: bgColor.startsWith('#') || bgColor.startsWith('rgb') ? bgColor : undefined 
                      }}
                      disabled={!isCurrentMonth}
                      title={title}
                    >
                      <div className="flex items-center justify-center h-full">
                        {isTooFarAhead ? (
                          <div className="flex flex-col items-center">
                            <div>{format(day, 'd')}</div>
                            <Lock className="w-3 h-3 mt-0.5" />
                          </div>
                        ) : (blockedInfo || weeklyBlockInfo) && (blockedInfo?.reason === 'SORTEIO' || blockedInfo?.reason === 'DRAW' || weeklyBlockInfo?.reason === 'SORTEIO' || weeklyBlockInfo?.reason === 'DRAW') ? (
                          <div className="flex flex-col items-center">
                            <div>{format(day, 'd')}</div>
                            <Crown className="w-3 h-3 mt-0.5" />
                          </div>
                        ) : (blockedInfo || weeklyBlockInfo) && (blockedInfo?.reason === 'MANUTENÇÃO' || blockedInfo?.reason === 'MAINTENANCE' || weeklyBlockInfo?.reason === 'MANUTENÇÃO' || weeklyBlockInfo?.reason === 'MAINTENANCE') ? (
                          <div className="flex flex-col items-center">
                            <div>{format(day, 'd')}</div>
                            <Wrench className="w-3 h-3 mt-0.5" />
                          </div>
                        ) : (
                          <div>{format(day, 'd')}</div>
                        )}
                      </div>
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
                      {format(parseBookingDate(booking.bookingDate), 'dd/MM/yyyy', { locale: ptBR })}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelBooking(booking);
                          }}
                          className="btn btn-danger text-xs px-3 py-1 min-w-[80px] touch-manipulation"
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
                    value={selectedDate ? format(startOfDay(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
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
                    value={format(startOfDay(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Cancelar Reserva</h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setBookingToCancel(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 touch-manipulation"
                  type="button"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-yellow-900 mb-2">
                        Tem certeza que deseja cancelar esta reserva?
                      </p>
                      <p className="text-sm text-yellow-800">
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Embarcação:</span>
                    <span className="font-medium text-gray-900">{bookingToCancel.vessel?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data:</span>
                    <span className="font-medium text-gray-900">
                      {format(parseBookingDate(bookingToCancel.bookingDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </div>
                  {bookingToCancel.user && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Usuário:</span>
                      <span className="font-medium text-gray-900">{bookingToCancel.user.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setBookingToCancel(null);
                  }}
                  className="flex-1 btn btn-outline order-2 sm:order-1 touch-manipulation"
                  disabled={cancelBooking.isPending}
                >
                  Não, Manter Reserva
                </button>
                <button
                  type="button"
                  onClick={confirmCancelBooking}
                  className="flex-1 btn btn-danger order-1 sm:order-2 touch-manipulation"
                  disabled={cancelBooking.isPending}
                >
                  {cancelBooking.isPending ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    'Sim, Cancelar Reserva'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

