import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 10 * 1000, // 10 segundos - equilibra atualização rápida com estabilidade
      gcTime: 5 * 60 * 1000, // 5 minutos (tempo de cache no garbage collector)
      refetchOnMount: 'always', // Sempre refetch ao montar para garantir dados atualizados
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);



