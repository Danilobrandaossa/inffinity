import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { oneSignalService } from './lib/onesignal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Não retentar em erros 429 (Too Many Requests)
        if (error?.response?.status === 429) {
          return false;
        }
        // Retentar até 1 vez para outros erros
        return failureCount < 1;
      },
      staleTime: 30 * 1000, // 30 segundos - reduz requisições desnecessárias
      gcTime: 5 * 60 * 1000, // 5 minutos (tempo de cache no garbage collector)
      refetchOnMount: true, // Refetch apenas se os dados estiverem stale
    },
  },
});

// Inicializar OneSignal após o app carregar
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);

// Inicializar OneSignal quando o app carregar (se usuário já estiver logado)
// Também será inicializado após login via authStore
if (localStorage.getItem('token')) {
  setTimeout(() => {
    oneSignalService.initialize().catch(console.error);
  }, 2000); // Aguardar 2 segundos para garantir que o OneSignal SDK carregou
}



