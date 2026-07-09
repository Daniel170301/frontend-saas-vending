import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function Reports({ selectedMachine }) {
    const [ventas, setVentas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vending-api-server.onrender.com/api';

    const fetchReportes = async () => {
        if (!selectedMachine) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/reportes/${selectedMachine}`);
            const data = await response.json();
            if (data.success) {
                setVentas(data.ventas);
            } else {
                toast.error("Error al cargar el historial");
            }
        } catch (error) {
            toast.error("Error de conexión");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReportes();
    }, [selectedMachine]);

    const exportarPDF = () => {
        if (ventas.length === 0) {
            return toast.error("No hay ventas para exportar");
        }

        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Reporte de Ventas - Máquina ${selectedMachine}`, 14, 22);
        
        const tableData = ventas.map((venta, index) => [
            index + 1,
            venta.codigo_motor,
            venta.nombre_producto,
            `S/ ${Number(venta.precio).toFixed(2)}`,
            new Date(venta.fecha).toLocaleString()
        ]);

        doc.autoTable({
            startY: 30,
            head: [['#', 'Motor', 'Producto', 'Precio', 'Fecha/Hora']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });

        doc.save(`Reporte_${selectedMachine}_${new Date().toLocaleDateString()}.pdf`);
        toast.success("PDF generado exitosamente");
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-600" size={24} />
                        Historial de Ventas
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Registro histórico de la máquina {selectedMachine}
                    </p>
                </div>
                
                <button 
                    onClick={exportarPDF}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    <Download size={18} />
                    Exportar PDF
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
            ) : ventas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No hay ventas registradas aún para esta máquina.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-xs uppercase font-bold tracking-wider">
                                <th className="px-6 py-4">Motor</th>
                                <th className="px-6 py-4">Producto</th>
                                <th className="px-6 py-4">Precio</th>
                                <th className="px-6 py-4 text-right">Fecha y Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {ventas.map((venta, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono text-gray-800 font-bold">{venta.codigo_motor}</td>
                                    <td className="px-6 py-4 text-gray-600">{venta.nombre_producto}</td>
                                    <td className="px-6 py-4 text-green-600 font-bold">S/ {Number(venta.precio).toFixed(2)}</td>
                                    <td className="px-6 py-4 text-gray-500 text-right text-sm">
                                        {new Date(venta.fecha).toLocaleString()}
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