import { Bell, Search } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-secondary-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar empresas, usuários..."
              className="block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 text-secondary-400 hover:text-secondary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}








