import React from 'react';
import { Store } from 'lucide-react';

export default function Dashboard({ machines }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Estado de la Flota</h3>
        <span className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">{machines.length} máquinas</span>
      </div>
      
      {machines.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Store size={48} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Aún no tienes máquinas</h3>
          <p className="text-gray-500 mt-2 max-w-sm">No hay máquinas registradas en tu cuenta actualmente.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4 rounded-tl-lg">ID de Máquina</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4 text-center rounded-tr-lg">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {machines.map((machine) => (
                <tr key={machine.machine_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono font-semibold text-gray-800">{machine.machine_id}</td>
                  <td className="px-6 py-4 text-gray-600">{machine.ubicacion || 'Sin ubicación'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-bold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Online
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}