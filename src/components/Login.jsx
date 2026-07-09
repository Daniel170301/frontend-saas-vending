import React, { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Store, Loader2 } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Apuntamos a tu backend en Render
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Bienvenido ${data.user.nombre || ''}`);
        onLoginSuccess(data.user); // Le avisamos a App.jsx que el login fue exitoso
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

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