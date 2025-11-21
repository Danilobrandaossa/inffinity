import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallBanner() {
  const { isInstalled, isInstallable, installApp } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show banner if app is installed, not installable, or dismissed
  if (isInstalled || !isInstallable || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installApp();
    if (success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Store dismissal in localStorage
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Check if banner was previously dismissed
  React.useEffect(() => {
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 p-4 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center shadow-sm">
              <Smartphone className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900">
              📱 Instalar App
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Acesso rápido e notificações
            </p>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleInstall}
              className="bg-primary-600 hover:bg-primary-700 text-white text-xs px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center space-x-1 shadow-sm hover:shadow-md"
            >
              <Download className="w-3 h-3" />
              <span>Instalar</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

