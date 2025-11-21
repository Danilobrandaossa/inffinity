import { ReactNode } from 'react'
import { useAuthStore } from '../stores/authStore'
import Sidebar from './Sidebar'
import Header from './Header'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user } = useAuthStore()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-secondary-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-secondary-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}








