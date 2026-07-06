import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Grid3X3, 
  Settings, 
  LogOut, 
  Loader2, 
  Store,
  User,
  Save, // <-- ¡Esta es la que faltaba!
} from 'lucide-react';
import Planogram from './components/Planogram';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

function App() {
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  
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
        <Toaster position="top-right" />
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Store size={40} />
            </div>
          </div>
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
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 flex justify-center items-center gap-2 transition-colors">
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLoading ? 'Conectando...' : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
            <LayoutDashboard size={18} />
            Dashboard
          </button>
          <button onClick={() => setActiveTab('inventario')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'inventario' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Grid3X3 size={18} />
            Planograma
          </button>
          <button onClick={() => setActiveTab('config')} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'config' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>
            <Settings size={18} />
            Pagos
          </button>
          <button onClick={() => setView('login')} className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ml-2">
            <LogOut size={18} />
            Salir
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && (
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
                <p className="text-gray-500 mt-2 max-w-sm">No hay máquinas registradas en tu cuenta actualmente. Registra tu primera máquina para verla aquí.</p>
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
        )}

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
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mt-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                <Settings size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Configuración de Pasarela</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6 mt-2">Pega aquí tu Access Token de Producción para que todas tus máquinas reciban pagos con Mercado Pago.</p>
            <div className="space-y-4">
              <input type="password" value={mercadopagoToken} onChange={(e) => setMercadopagoToken(e.target.value)} className="w-full p-3.5 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" placeholder="APP_USR-..." />
              <button onClick={handleSaveConfig} disabled={isLoading} className="w-full bg-green-600 text-white p-3.5 rounded-xl font-bold hover:bg-green-700 flex justify-center items-center gap-2 transition-colors">
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
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