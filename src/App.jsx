import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast'; // Importamos las alertas modernas
import toast from 'react-hot-toast';
import Planogram from './components/Planogram'; // Importamos tu nuevo componente

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

function App() {
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [user, setUser] = useState(null);
  
  // App state
  const [machines, setMachines] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [inventory, setInventory] = useState([]);
  const [mercadopagoToken, setMercadopagoToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        fetchMachines(data.user.id);
        toast.success(`Bienvenido ${data.user.nombre || ''}`);
        setView('dashboard');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!mercadopagoToken) return toast.error("Ingresa tu Access Token.");
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/config/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_dueno: user.id, token: mercadopagoToken })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('¡Llave de Mercado Pago guardada!');
        setMercadopagoToken('');
      } else {
        toast.error("Error: " + data.message);
      }
    } catch (err) {
      toast.error('Error de conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <Toaster position="top-right" /> {/* Renderiza las notificaciones */}
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Smart Vending SaaS</h2>
          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border focus:ring-2 focus:ring-blue-500 rounded-xl outline-none" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
              {isLoading ? 'Conectando...' : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" /> {/* Renderiza las notificaciones */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm flex-wrap gap-4">
        <div className="text-xl font-bold text-gray-800">Smart Vending Dashboard</div>
        <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto">
          <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${user?.rol === 'superadmin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            Hola, {user?.nombre || 'Usuario'}
          </span>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('inventario')} className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'inventario' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>Mi Planograma</button>
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg font-semibold text-sm ${activeTab === 'config' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}>Config. Pagos</button>
          <button onClick={() => setView('login')} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">Salir</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && (
          <div className="bg-white p-6 rounded-2xl border shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Estado de la Flota ({machines.length} máquinas)</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">ID de Máquina</th>
                  <th className="px-6 py-4">Ubicación</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {machines.map((machine) => (
                  <tr key={machine.machine_id}>
                    <td className="px-6 py-4 font-mono font-semibold">{machine.machine_id}</td>
                    <td className="px-6 py-4 text-gray-600">{machine.ubicacion || 'Sin ubicación'}</td>
                    <td className="px-6 py-4 text-center"><span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Online</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* AQUÍ INYECTAMOS TU NUEVO COMPONENTE */}
        {activeTab === 'inventario' && (
          <Planogram 
            machines={machines} 
            selectedMachine={selectedMachine} 
            handleMachineChange={handleMachineChange} 
            inventory={inventory} 
            fetchInventory={fetchInventory} 
          />
        )}

        {activeTab === 'config' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md border mt-8">
            <h2 className="text-2xl font-bold mb-2">Configuración de Mercado Pago</h2>
            <div className="space-y-4 mt-6">
              <input type="password" value={mercadopagoToken} onChange={(e) => setMercadopagoToken(e.target.value)} className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="APP_USR-..." />
              <button onClick={handleSaveConfig} disabled={isLoading} className="w-full bg-green-600 text-white p-3.5 rounded-xl font-bold hover:bg-green-700">
                {isLoading ? 'Guardando...' : 'Guardar Llave'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;