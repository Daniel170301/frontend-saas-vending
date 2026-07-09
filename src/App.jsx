import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { LayoutDashboard, Grid3X3, FileText, LogOut, Store, User, Settings } from 'lucide-react';

// Importamos nuestros nuevos componentes modulares
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Planogram from './components/Planogram';
import Reports from './components/Reports';
import RefrigeratorConfig from './components/RefrigeratorConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

export default function App() {
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [inventory, setInventory] = useState([]);

  // Lógica de hidratación de datos
  const fetchMachines = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/maquinas/${userId}`);
      const data = await response.json();
      if (data.success) {
        setMachines(data.maquinas);
        if (data.maquinas.length > 0) {
          setSelectedMachine(data.maquinas[0].machine_id);
          fetchInventory(data.maquinas[0].machine_id);
        }
      }
    } catch (error) {
      toast.error("Error cargando máquinas");
    }
  };

  const fetchInventory = async (machineId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/inventario/${machineId}`);
      const data = await response.json();
      if (data.success) setInventory(data.inventario);
    } catch (error) {
      toast.error("Error cargando inventario");
    }
  };

  const handleMachineChange = (e) => {
    const newMachineId = e.target.value;
    setSelectedMachine(newMachineId);
    fetchInventory(newMachineId);
  };

  const onLoginSuccess = (userData) => {
    setUser(userData);
    fetchMachines(userData.id);
    setView('dashboard');
  };

  // Si no está logueado, mostramos nuestro nuevo componente
  if (view === 'login') {
    return <Login onLoginSuccess={onLoginSuccess} />;
  }

  // Si está logueado, renderizamos el esqueleto y el menú
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm flex-wrap gap-4">
        <div className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Store className="text-blue-600" />
          Smart Vending
        </div>
        <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto">
          <span className={`flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${user?.rol === 'superadmin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            <User size={16} />
            {user?.nombre || 'Usuario'}
          </span>
          
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </button>
          
          <button onClick={() => setActiveTab('inventario')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'inventario' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Grid3X3 size={18} /> Planograma
          </button>

          <button onClick={() => setActiveTab('reportes')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'reportes' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            <FileText size={18} /> Reportes
          </button>

          <button onClick={() => setActiveTab('configuracion')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'configuracion' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings size={18} /> Mantenimiento
          </button>
          
          <button onClick={() => { setView('login'); setUser(null); }} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-2">
            <LogOut size={18} /> Salir
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* Renderizado Condicional de Componentes Modulares */}
        {activeTab === 'dashboard' && <Dashboard machines={machines} />}
        
        {activeTab === 'inventario' && (
          <Planogram
            machines={machines}
            selectedMachine={selectedMachine}
            handleMachineChange={handleMachineChange}
            inventory={inventory}
            fetchInventory={fetchInventory}
          />
        )}
        
        {activeTab === 'reportes' && <Reports selectedMachine={selectedMachine} />}
        
        {activeTab === 'configuracion' && <RefrigeratorConfig />}
      </main>
    </div>
  );
}