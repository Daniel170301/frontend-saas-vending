import React from 'react';
import { Settings } from 'lucide-react';

export default function RefrigeratorConfig() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Settings className="text-blue-600" size={24} />
          Mantenimiento de Equipo
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Instrucciones técnicas para configurar la refrigeradora y ajustes del compresor.
        </p>
      </div>
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-500">
        Módulo de lectura de temperatura y parámetros técnicos en desarrollo...
      </div>
    </div>
  );
}