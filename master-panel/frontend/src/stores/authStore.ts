import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

interface User {
  id: string
  email: string
  name: string
  role: 'MASTER_OWNER' | 'MASTER_SUPPORT' | 'MASTER_AUDITOR'
  twoFactorEnabled: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string, twoFactorCode?: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await api.post('/auth/login', {
            email,
            password,
            twoFactorCode
          })

          if (response.data.success) {
            const { accessToken, user } = response.data.data
            
            // Salvar token no localStorage
            localStorage.setItem('master_token', accessToken)
            
            // Configurar header de autorização
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
            
            set({
              user,
              token: accessToken,
              isLoading: false,
              error: null
            })
          } else {
            set({
              isLoading: false,
              error: response.data.message || 'Erro no login'
            })
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.error || 'Erro de conexão'
          })
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout')
        } catch (error) {
          // Ignorar erros de logout
        } finally {
          // Limpar dados locais
          localStorage.removeItem('master_token')
          delete api.defaults.headers.common['Authorization']
          
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null
          })
        }
      },

      checkAuth: async () => {
        const token = localStorage.getItem('master_token')
        
        if (!token) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        
        try {
          // Configurar header de autorização
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          const response = await api.get('/auth/profile')
          
          if (response.data.success) {
            set({
              user: response.data.data,
              token,
              isLoading: false,
              error: null
            })
          } else {
            throw new Error('Token inválido')
          }
        } catch (error) {
          // Token inválido, limpar dados
          localStorage.removeItem('master_token')
          delete api.defaults.headers.common['Authorization']
          
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null
          })
        }
      },

      clearError: () => {
        set({ error: null })
      }
    }),
    {
      name: 'master-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token
      })
    }
  )
)








