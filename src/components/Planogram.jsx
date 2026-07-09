import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Save, X, Loader2, PackageOpen, LayoutGrid, RotateCcw } from 'lucide-react';

export default function Planogram({ machines, selectedMachine, handleMachineChange, inventory, fetchInventory }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', precio: '', stock: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

  const rows = [1, 2, 3, 4, 5, 6];
  const cols = [0, 1, 2, 3, 4, 5];

  const openModal = (code, item) => {
    setEditingCode(code);
    setFormData({
      nombre: item?.nombre_producto || '',
      precio: item?.precio || '',
      stock: item?.stock !== undefined ? item?.stock : '0'
    });
    setIsModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/inventario/actualizar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: selectedMachine,
          codigo_motor: editingCode,
          nombre_producto: formData.nombre,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock)
        })
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success(`Motor ${editingCode} actualizado correctamente`);
        fetchInventory(selectedMachine);
        setIsModalOpen(false);
      } else {
        toast.error('Error al actualizar el motor');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsUpdating(false);
    }
  };

  // NUEVA FUNCIÓN: Reiniciar todo el inventario
  const handleResetInventory = async () => {
    const confirmar = window.confirm("¿Estás seguro de reiniciar TODOS los 36 motores? Los productos pasarán a llamarse 'Producto X' costando 1.00 sol con stock 0. Esta acción no se puede deshacer.");
    if (!confirmar) return;

    setIsUpdating(true);
    const toastId = toast.loading('Reiniciando 36 motores, por favor no cierres la ventana...');

    try {
      let contador = 1;
      
      // Recorremos las 6 filas y 6 columnas (36 peticiones)
      for (const row of rows) {
        for (const col of cols) {
          const code = `${row}${col}`;
          
          await fetch(`${API_BASE_URL}/inventario/actualizar`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              machine_id: selectedMachine,
              codigo_motor: code,
              nombre_producto: `Producto ${contador}`,
              precio: 1.00,
              stock: 0
            })
          });
          contador++;
        }
      }
      
      toast.success('¡Máquina reiniciada con éxito!', { id: toastId });
      fetchInventory(selectedMachine); // Recargamos el planograma
    } catch (error) {
      toast.error('Hubo un error al reiniciar algunos motores', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!machines || machines.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <LayoutGrid className="mx-auto text-gray-300 mb-4" size={48} />
        <h3 className="text-xl font-bold text-gray-800">Planograma no disponible</h3>
        <p className="text-gray-500 mt-2">Registra una máquina para comenzar a configurar su inventario y precios.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-center gap-4 bg-gray-50">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <LayoutGrid className="text-blue-600" size={24} />
            Planograma Visual
          </h3>
          <p className="text-sm text-gray-500 mt-1">Configura los precios y productos de tu máquina actual.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
          <select value={selectedMachine} onChange={handleMachineChange} disabled={isUpdating} className="w-full sm:w-64 p-2.5 border border-gray-300 rounded-lg bg-white font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer disabled:opacity-50">
            {machines.map((machine) => (
              <option key={machine.machine_id} value={machine.machine_id}>
                ID: {machine.machine_id} - {machine.ubicacion || 'Sin ubicación'}
              </option>
            ))}
          </select>
          
          {/* NUEVO BOTÓN DE REINICIO */}
          <button 
            onClick={handleResetInventory} 
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap disabled:opacity-50"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />}
            Reiniciar a 1 Sol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-6 bg-gray-100/50">
        {rows.map(row => (
          cols.map(col => {
            const code = `${row}${col}`;
            const item = inventory.find(i => String(i.codigo_motor) === String(code));
            const isOutOFStock = item && item.stock <= 0;
            
            return (
              <div key={code} className={`bg-white border rounded-xl shadow-sm flex flex-col overflow-hidden relative transition-all hover:shadow-md hover:border-blue-200 ${isOutOFStock ? 'border-red-200' : 'border-gray-200'}`}>
                <div className={`text-white text-center font-mono font-bold py-1.5 text-sm ${isOutOFStock ? 'bg-red-500' : 'bg-gray-800'}`}>
                  {code}
                </div>
                <div className="p-3 flex-grow flex flex-col justify-center items-center text-center">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] flex items-center justify-center">
                    {item && item.nombre_producto ? (
                      item.nombre_producto
                    ) : (
                      <span className="text-gray-400 italic flex items-center gap-1 text-xs">
                        <PackageOpen size={14} /> Vacío
                      </span>
                    )}
                  </p>
                  <p className="text-blue-600 font-bold mt-2 text-lg bg-blue-50 px-2 py-0.5 rounded-md w-full">
                    {item && item.precio ? `S/ ${Number(item.precio).toFixed(2)}` : '--'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Stock: <span className={`font-bold px-1.5 py-0.5 rounded ${item && item.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item && item.stock !== undefined ? item.stock : 0}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => openModal(code, item)}
                  disabled={isUpdating}
                  className="w-full bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-semibold py-2.5 text-xs border-t border-gray-100 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Edit2 size={14} />
                  Editar Motor
                </button>
              </div>
            );
          })
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Edit2 size={18} className="text-blue-600" />
                Motor {editingCode}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del Producto</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Ej: Coca Cola 500ml" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Precio (S/)</label>
                  <input type="number" step="0.01" min="0" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="0.00" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock</label>
                  <input type="number" min="0" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="0" required />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4 mt-2 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isUpdating} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                  {isUpdating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {isUpdating ? 'Guardando' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}