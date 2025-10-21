import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, 
  Ship, 
  Calendar, 
  Users, 
  ShieldBan, 
  FileText, 
  Bell, 
  User, 
  LogOut,
  Menu,
  X,
  DollarSign,
  MessageSquare,
  CreditCard,
  Clock,
  Shield,
  BarChart3,
  Zap
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import PWAInstallBanner from '@/components/PWAInstallBanner';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  // Buscar contador de notificações
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count');
      return data.count;
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, show: true },
    { name: 'Embarcações', href: '/vessels', icon: Ship, show: true },
    { name: 'Agendamentos', href: '/bookings', icon: Calendar, show: true },
    { name: 'Minhas Finanças', href: '/my-financials', icon: CreditCard, show: !isAdmin },
    { name: 'Histórico', href: '/audit-logs', icon: FileText, show: true },
    { name: '⚡ Painel Financeiro', href: '/financial-priority', icon: Zap, show: isAdmin },
    { name: 'Controle Financeiro', href: '/financial', icon: DollarSign, show: isAdmin },
    { name: 'Gerenciar Notificações', href: '/notification-management', icon: MessageSquare, show: isAdmin },
    { name: 'Usuários', href: '/users', icon: Users, show: isAdmin },
    { name: 'Bloqueios', href: '/blocked-dates', icon: ShieldBan, show: isAdmin },
    { name: 'Bloqueios Semanais', href: '/weekly-blocks', icon: Clock, show: isAdmin },
    { name: 'Analytics', href: '/analytics', icon: BarChart3, show: isAdmin },
    { name: 'Segurança 2FA', href: '/two-factor', icon: Shield, show: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-2">
              <Ship className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Embarcações</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => 
              item.show ? (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              ) : null
            )}
          </nav>

          {/* User menu */}
          <div className="p-4 border-t">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                to="/notifications"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <Bell className="w-5 h-5 mr-3" />
                  Notificações
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                to="/profile"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <User className="w-5 h-5 mr-3" />
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex items-center space-x-4 ml-auto">
              {/* Badge de notificações */}
              {unreadCount > 0 && (
                <Link
                  to="/notifications"
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </Link>
              )}
              
              {isAdmin && (
                <span className="hidden sm:inline-flex px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      
      {/* PWA Install Banner */}
      <PWAInstallBanner />
    </div>
  );
}

