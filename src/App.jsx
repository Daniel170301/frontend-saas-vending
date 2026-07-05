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
  const [selectedMachine, setSelectedMachine] = useState('');
  const [mercadopagoToken, setMercadopagoToken] = useState('');
  const [inventory, setInventory] = useState([]);

  const fetchMachines = async (userId) => {
    try {
      const response = await fetch(`https://vending-api-server.onrender.com/api/maquinas/${userId}`);
      const data = await response.json();
      if (data.success) {
        setMachines(data.maquinas);
        if (data.maquinas.length > 0) {
          setSelectedMachine(data.maquinas[0].machine_id);
          fetchInventory(data.maquinas[0].machine_id);
        }
      }
    } catch (error) { console.error("Error cargando máquinas"); }
  };

  const fetchInventory = async (machineId) => {
    try {
      const response = await fetch(`https://vending-api-server.onrender.com/api/inventario/${machineId}`);
      const data = await response.json();
      if (data.success) setInventory(data.inventario);
    } catch (error) { console.error("Error cargando inventario"); }
  };

  const handleMachineChange = (e) => {
    const newMachineId = e.target.value;
    setSelectedMachine(newMachineId);
    fetchInventory(newMachineId);
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
      } else setError(data.message);
    } catch (err) { setError('Error de conexión.'); } 
    finally { setIsLoading(false); }
  };

  const handleSaveConfig = async () => {
    if (!mercadopagoToken) return alert("Ingresa tu Access Token.");
    setIsLoading(true);
    try {
      const response = await fetch('https://vending-api-server.onrender.com/api/config/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_dueno: user.id, token: mercadopagoToken })
      });
      const data = await response.json();
      if (data.success) { alert('¡Llave guardada!'); setMercadopagoToken(''); } 
      else alert('Error: ' + data.message);
    } catch (err) { alert('Error de conexión.'); } 
    finally { setIsLoading(false); }
  };

  // ACTUALIZADO: Ahora editamos Nombre y Precio
  const handleUpdateProduct = async (codigo_motor, currentName, currentPrecio) => {
    const nuevoNombre = prompt(`Nombre del producto en el motor ${codigo_motor}:`, currentName || '');
    if (nuevoNombre === null) return; 

    const nuevoPrecio = prompt(`Precio para ${nuevoNombre || 'este producto'} (Ej: 2.50):`, currentPrecio || '0.00');
    if (nuevoPrecio === null || isNaN(parseFloat(nuevoPrecio))) return alert("Precio inválido.");

    try {
      const response = await fetch('https://vending-api-server.onrender.com/api/inventario/actualizar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          machine_id: selectedMachine, 
          codigo_motor: codigo_motor, 
          nombre_producto: nuevoNombre,
          precio: parseFloat(nuevoPrecio)
        })
      });
      const data = await response.json();
      if (data.success) {
        fetchInventory(selectedMachine); 
      } else alert('Error al actualizar.');
    } catch (error) { alert('Error de conexión.'); }
  };

  // NUEVO: Generador dinámico de la cuadrícula 6x6 (Filas 1-6, Columnas 0-5)
  const renderPlanogram = () => {
    const rows = [1, 2, 3, 4, 5, 6];
    const cols = [0, 1, 2, 3, 4, 5];

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-100 rounded-xl">
        {rows.map(row => (
          cols.map(col => {
            const code = `${row}${col}`; // Ej: "10", "11", "25", etc.
            const item = inventory.find(i => i.codigo_motor === code);
            
            return (
              <div key={code} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden relative">
                {/* Cabecera del Motor */}
                <div className="bg-gray-800 text-white text-center font-mono font-bold py-1.5 text-sm">
                  {code}
                </div>
                
                {/* Cuerpo del Producto */}
                <div className="p-3 flex-grow flex flex-col justify-center items-center text-center">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
                    {item && item.nombre_producto ? item.nombre_producto : <span className="text-gray-400 italic">Vacío</span>}
                  </p>
                  <p className="text-blue-600 font-bold mt-1 text-lg">
                    {item && item.precio ? `S/ ${Number(item.precio).toFixed(2)}` : '-'}
                  </p>
                </div>
                
                {/* Botón de Acción */}
                <button 
                  onClick={() => handleUpdateProduct(code, item?.nombre_producto, item?.precio)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 text-xs border-t border-gray-100 transition-colors"
                >
                  Editar Motor
                </button>
              </div>
            );
          })
        ))}
      </div>
    );
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
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm flex-wrap gap-4">
        <div className="text-xl font-bold text-gray-800">Smart Vending Dashboard</div>
        <div className="flex items-center space-x-2 md:space-x-4 overflow-x-auto">
          <span className={`text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap ${user?.rol === 'superadmin' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
            {user?.rol === 'superadmin' ? '👑 Súper Admin:' : 'Hola,'} {user?.nombre}
          </span>
          <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('inventario')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'inventario' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>Mi Planograma</button>
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap ${activeTab === 'config' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}>Config. Pagos</button>
          <button onClick={() => { setView('login'); setUser(null); setEmail(''); setPassword(''); }} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">Salir</button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {/* ... (Pestaña de Dashboard se mantiene igual) ... */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-sm font-medium text-gray-500">{user?.rol === 'superadmin' ? 'Total Flota Global' : 'Tus Máquinas'}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{machines.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800">Estado de la Flota</h3>
              </div>
              <div className="overflow-x-auto">
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
                      <tr key={machine.machine_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-800">{machine.machine_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{machine.ubicacion || 'Sin ubicación'}</td>
                        <td className="px-6 py-4 text-center"><span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">Online</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* NUEVA PESTAÑA DE PLANOGRAMA */}
        {activeTab === 'inventario' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Planograma 6x6</h3>
                <p className="text-sm text-gray-500 mt-1">Configura los precios y productos de tu máquina. El stock se actualiza automáticamente.</p>
              </div>
              <select 
                value={selectedMachine} 
                onChange={handleMachineChange} 
                className="p-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.machine_id}>{machine.machine_id} - {machine.ubicacion}</option>
                ))}
              </select>
            </div>
            
            {/* Aquí inyectamos la matriz de 36 espacios */}
            {renderPlanogram()}
            
          </div>
        )}

        {/* ... (Pestaña de Configuración se mantiene igual) ... */}
        {activeTab === 'config' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-md border border-gray-200">
             <h2 className="text-2xl font-bold mb-2 text-gray-800">Configuración de Pasarela</h2>
             <p className="text-sm text-gray-500 mb-6">Pega aquí tu Access Token de Producción para que todas tus máquinas reciban pagos.</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Access Token (Mercado Pago)</label>
                <input type="password" value={mercadopagoToken} onChange={(e) => setMercadopagoToken(e.target.value)} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" placeholder="APP_USR-..." />
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