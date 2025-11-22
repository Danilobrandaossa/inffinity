import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-primary-600" />
            Configurações
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie as configurações do sistema
          </p>
        </div>
      </div>

      {/* Placeholder */}
      <div className="card">
        <p className="text-gray-600">Configurações do sistema em breve.</p>
      </div>
    </div>
  );
}
