import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function Planogram({ machines, selectedMachine, handleMachineChange, inventory, fetchInventory }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', precio: '', stock: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

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
        toast.success('Motor actualizado correctamente');
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

  const rows = [1, 2, 3, 4, 5, 6];
  const cols = [0, 1, 2, 3, 4, 5];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Planograma 6x6</h3>
          <p className="text-sm text-gray-500 mt-1">Configura los precios y productos de tu máquina.</p>
        </div>
        <select value={selectedMachine} onChange={handleMachineChange} className="p-2.5 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500">
          {machines.map((machine) => (
            <option key={machine.machine_id} value={machine.machine_id}>
              {machine.machine_id} - {machine.ubicacion}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-100 rounded-xl">
        {rows.map(row => (
          cols.map(col => {
            const code = `${row}${col}`;
            const item = inventory.find(i => i.codigo_motor === code);
            return (
              <div key={code} className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden relative">
                <div className="bg-gray-800 text-white text-center font-mono font-bold py-1.5 text-sm">{code}</div>
                <div className="p-3 flex-grow flex flex-col justify-center items-center text-center">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px]">
                    {item && item.nombre_producto ? item.nombre_producto : <span className="text-gray-400 italic">Vacío</span>}
                  </p>
                  <p className="text-blue-600 font-bold mt-1 text-lg">
                    {item && item.precio ? `S/ ${Number(item.precio).toFixed(2)}` : '--'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Stock: <span className={`font-bold ${item && item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {item && item.stock !== undefined ? item.stock : 0}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => openModal(code, item)}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 text-xs border-t border-gray-100 transition-colors"
                >
                  Editar Motor
                </button>
              </div>
            );
          })
        ))}
      </div>

      {/* MODAL MODERNO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Editar Motor {editingCode}</h3>
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto</label>
                <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Precio (S/)</label>
                  <input type="number" step="0.01" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Stock</label>
                  <input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">Cancelar</button>
                <button type="submit" disabled={isUpdating} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  {isUpdating ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}