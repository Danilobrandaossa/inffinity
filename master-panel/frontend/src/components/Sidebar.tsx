import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  LayoutDashboard,
  Building2,
  Shield,
  Settings,
  User,
  LogOut,
  FileText,
  Activity
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Empresas', href: '/tenants', icon: Building2 },
  { name: 'Integração', href: '/integration', icon: Activity },
  { name: 'Auditoria', href: '/audit', icon: FileText },
  { name: 'Configurações', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="flex items-center">
          <Shield className="h-8 w-8 text-primary-600" />
          <div className="ml-3">
            <h1 className="text-lg font-semibold text-secondary-900">
              Master Panel
            </h1>
            <p className="text-xs text-secondary-500">
              ReservaPro
            </p>
          </div>
        </div>
      </div>

      <div className="sidebar-content">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  isActive ? 'nav-item-active' : 'nav-item'
                }
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-secondary-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="nav-item w-full mt-3 text-danger-600 hover:text-danger-700"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  )
}



