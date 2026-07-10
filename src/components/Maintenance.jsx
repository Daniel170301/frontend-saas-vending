import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Thermometer, Settings, Save, Power, Snowflake } from 'lucide-react';

export default function Maintenance({ selectedMachine }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [fridgeConfig, setFridgeConfig] = useState({
    setpoint: 4,      // Temperatura objetivo en °C
    histeresis: 2,    // Margen de variación antes de encender (Ej: enciende a 6°C, apaga a 4°C)
    delay: 3          // Minutos de espera de seguridad antes de volver a encender el compresor
  });

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    // Aquí luego conectaremos con el backend para enviar por MQTT a la ESP32
    setTimeout(() => {
      toast.success(`Configuración enviada a la máquina ${selectedMachine}`);
      setIsUpdating(false);
    }, 1000);
  };

  if (!selectedMachine) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <Settings className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-800">Mantenimiento no disponible</h3>
        <p className="text-gray-500 mt-2">Selecciona una máquina para configurar sus parámetros.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-blue-600" size={24} />
          Mantenimiento Técnico
        </h3>
        <p className="text-sm text-gray-500 mt-1">Configura la telemetría y el sistema de enfriamiento.</p>
      </div>

      <div className="p-6">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-6 max-w-2xl">
          <h4 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-4">
            <Snowflake className="text-blue-500" size={20} />
            Configuración de la Refrigeradora
          </h4>
          
          <form onSubmit={handleSaveConfig} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperatura Objetivo */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Thermometer size={16} className="text-red-500" />
                  Setpoint (°C)
                </label>
                <p className="text-xs text-gray-500 mb-3">Temperatura deseada.</p>
                <input 
                  type="number" 
                  value={fridgeConfig.setpoint} 
                  onChange={(e) => setFridgeConfig({...fridgeConfig, setpoint: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg" 
                  required 
                />
              </div>

              {/* Histéresis */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Settings size={16} className="text-gray-500" />
                  Diferencial (°C)
                </label>
                <p className="text-xs text-gray-500 mb-3">Rango de activación.</p>
                <input 
                  type="number" 
                  min="1" max="5"
                  value={fridgeConfig.histeresis} 
                  onChange={(e) => setFridgeConfig({...fridgeConfig, histeresis: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg" 
                  required 
                />
              </div>

              {/* Retardo del Compresor */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Power size={16} className="text-amber-500" />
                  Retardo (Min)
                </label>
                <p className="text-xs text-gray-500 mb-3">Protección compresor.</p>
                <input 
                  type="number" 
                  min="0" max="10"
                  value={fridgeConfig.delay} 
                  onChange={(e) => setFridgeConfig({...fridgeConfig, delay: e.target.value})}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg" 
                  required 
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isUpdating}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {isUpdating ? 'Guardando...' : 'Aplicar Configuración'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}