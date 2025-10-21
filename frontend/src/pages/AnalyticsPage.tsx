import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Users, 
  Ship, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';
import api from '@/lib/api';

const COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6'];

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  // Buscar dados do dashboard
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/dashboard');
      return data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const { 
    generalStats, 
    bookingsByMonth, 
    bookingsByVessel, 
    paymentStatus, 
    revenueByMonth, 
    usersByStatus,
    recentActivity,
    // vesselUsageStats
  } = dashboardData || {};

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema de embarcações</p>
        </div>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="select select-bordered"
        >
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </select>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat bg-white shadow rounded-lg p-6">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">Total de Usuários</div>
          <div className="stat-value text-primary">{generalStats?.totalUsers || 0}</div>
          <div className="stat-desc">Usuários cadastrados</div>
        </div>

        <div className="stat bg-white shadow rounded-lg p-6">
          <div className="stat-figure text-success">
            <Ship className="w-8 h-8" />
          </div>
          <div className="stat-title">Embarcações</div>
          <div className="stat-value text-success">{generalStats?.totalVessels || 0}</div>
          <div className="stat-desc">Embarcações ativas</div>
        </div>

        <div className="stat bg-white shadow rounded-lg p-6">
          <div className="stat-figure text-warning">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="stat-title">Reservas Ativas</div>
          <div className="stat-value text-warning">{generalStats?.activeBookings || 0}</div>
          <div className="stat-desc">Reservas pendentes/aprovadas</div>
        </div>

        <div className="stat bg-white shadow rounded-lg p-6">
          <div className="stat-figure text-info">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title">Receita Total</div>
          <div className="stat-value text-info">
            R$ {(generalStats?.totalRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="stat-desc">Receita acumulada</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reservas por Mês */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Reservas por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Receita por Mês */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Receita por Mês
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status de Pagamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Status de Pagamentos - Parcelas
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pagas', value: paymentStatus?.installments?.paid || 0 },
                  { name: 'Pendentes', value: paymentStatus?.installments?.pending || 0 },
                  { name: 'Em Atraso', value: paymentStatus?.installments?.overdue || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Pagas', value: paymentStatus?.installments?.paid || 0 },
                  { name: 'Pendentes', value: paymentStatus?.installments?.pending || 0 },
                  { name: 'Em Atraso', value: paymentStatus?.installments?.overdue || 0 }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Status de Pagamentos - Marina
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Pagas', value: paymentStatus?.marinaPayments?.paid || 0 },
                  { name: 'Pendentes', value: paymentStatus?.marinaPayments?.pending || 0 },
                  { name: 'Em Atraso', value: paymentStatus?.marinaPayments?.overdue || 0 }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Pagas', value: paymentStatus?.marinaPayments?.paid || 0 },
                  { name: 'Pendentes', value: paymentStatus?.marinaPayments?.pending || 0 },
                  { name: 'Em Atraso', value: paymentStatus?.marinaPayments?.overdue || 0 }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Reservas por Embarcação */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Ship className="w-5 h-5 mr-2" />
          Reservas por Embarcação (Últimos 30 dias)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookingsByVessel} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="vesselName" type="category" width={120} />
            <Tooltip />
            <Bar dataKey="bookings" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Atividade Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Atividade Recente
          </h3>
          <div className="space-y-3">
            {recentActivity?.slice(0, 5).map((activity: any) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action.replace(/_/g, ' ').toLowerCase()}
                  </p>
                  <p className="text-xs text-gray-500">
                    por {activity.user} • {new Date(activity.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Usuários por Status
          </h3>
          <div className="space-y-3">
            {usersByStatus?.map((status: any) => (
              <div key={status.status} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">
                  {status.status.replace(/_/g, ' ').toLowerCase()}
                </span>
                <span className="text-sm font-bold text-primary">
                  {status.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
