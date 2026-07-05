import React, { useState } from 'react';

function App() {
  const [view, setView] = useState('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [user, setUser] = useState(null); 
  const [machines, setMachines] = useState([]); 
  
  // NUEVO: Solo necesitamos un estado para el Access Token de Mercado Pago
  const [mercadopagoToken, setMercadopagoToken] = useState('');

  const fetchMachines = async (userId) => {
    try {
      const response = await fetch(`https://vending-api-server.onrender.com/api/maquinas/${userId}`);
      const data = await response.json();
      if (data.success) {
        setMachines(data.maquinas);
      }
    } catch (error) {
      console.error("Error cargando máquinas");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://vending-api-server.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user); 
        fetchMachines(data.user.id); 
        setView('dashboard');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!mercadopagoToken) {
      alert("Por favor, ingresa tu Access Token de Mercado Pago.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://vending-api-server.onrender.com/api/config/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_dueno: user.id, // Ahora guardamos el token a nivel de usuario
          token: mercadopagoToken
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('¡Llave de Mercado Pago guardada exitosamente!');
        setMercadopagoToken(''); // Limpiamos el campo por seguridad
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) { 
      alert('Error de conexión con el servidor.'); 
    } finally { 
      setIsLoading(false); 
    }
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Smart Vending SaaS</h2>
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200 text-center font-medium">{error}</div>}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required />
            </div>
            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
              {isLoading ? 'Conectando...' : 'Ingresar al Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold text-gray-800">Smart Vending Dashboard</div>
        <div className="flex items-center space-x-4">
          <span className={`text-sm font-bold px-3 py-1 rounded-full ${user?.rol === 'superadmin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            {user?.rol === 'superadmin' ? '👑 Súper Admin:' : 'Hola,'} {user?.nombre}
          </span>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${activeTab === 'config' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>Configuración Pagos</button>
          <button onClick={() => { setView('login'); setUser(null); setEmail(''); setPassword(''); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Salir</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-gray-500">{user?.rol === 'superadmin' ? 'Total Flota Global' : 'Tus Máquinas'}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{machines.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">{user?.rol === 'superadmin' ? 'Monitoreo Global' : 'Estado de la Flota'}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4">ID de Máquina</th>
                      <th className="px-6 py-4">Ubicación</th>
                      {user?.rol === 'superadmin' && <th className="px-6 py-4 text-center">Cliente (Dueño)</th>}
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {machines.length === 0 ? (
                      <tr><td colSpan={user?.rol === 'superadmin' ? 4 : 3} className="px-6 py-4 text-center text-gray-500">No hay máquinas registradas.</td></tr>
                    ) : (
                      machines.map((machine) => (
                        <tr key={machine.machine_id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">{machine.machine_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{machine.ubicacion || 'Sin ubicación'}</td>
                          {user?.rol === 'superadmin' && (
                            <td className="px-6 py-4 text-center text-sm font-medium text-blue-600">{machine.nombre_dueno}</td>
                          )}
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">Online</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200">
             <h2 className="text-2xl font-bold mb-2 text-gray-800">Configuración de Pasarela</h2>
             <p className="text-sm text-gray-500 mb-6">Pega aquí tu Access Token de Producción para que todas tus máquinas puedan recibir pagos.</p>
            <div className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Access Token (Mercado Pago)</label>
                <input 
                  type="password" 
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" 
                  placeholder="APP_USR-..." 
                  value={mercadopagoToken} 
                  onChange={(e) => setMercadopagoToken(e.target.value)} 
                />
              </div>

              <button onClick={handleSaveConfig} disabled={isLoading} className="w-full bg-green-600 text-white p-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors mt-4">
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