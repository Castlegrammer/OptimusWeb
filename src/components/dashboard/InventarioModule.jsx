import React, { useState, useEffect } from 'react';
import { Boxes, AlertTriangle, Search, CheckCircle2, Loader2, RefreshCw, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';

export default function InventarioModule() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      const data = await api.productos.getAll();
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar inventario de MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleAddStock = async (prod, amount) => {
    const current = Number(prod.cantidad) || 0;
    const next = current + amount;
    setUpdatingId(prod.uuid || prod.id);

    try {
      if (prod.uuid) {
        await api.productos.update(prod.uuid, { cantidad: next });
      }
      setProducts(prev => prev.map(p => {
        if ((p.uuid || p.id) === (prod.uuid || prod.id)) {
          return { ...p, cantidad: next };
        }
        return p;
      }));
      showNotification(`Stock de "${prod.nombre}" actualizado a ${next} unidades.`);
    } catch (err) {
      showNotification(err.message || 'Error al actualizar el stock.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = products.filter(s => {
    const name = s.nombre || '';
    const desc = s.descripcion || '';
    const cat = s.categoria || '';
    const term = search.toLowerCase();
    return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term) || cat.toLowerCase().includes(term);
  });

  const lowStockCount = products.filter(s => {
    const stock = Number(s.cantidad) || 0;
    const min = Number(s.minimo) || 5;
    return stock <= min * 1.5;
  }).length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Control de Existencias & Quiebre de Stock</h2>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Conectado a MySQL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de mercancía en bodega sincronizado con la base de datos central
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchStock}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            title="Recargar inventario desde MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <span className="text-xs font-bold px-3 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{lowStockCount} artículos por agotarse</span>
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto en stock por nombre o categoría..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Stock Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Consultando inventario en la base de datos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Boxes className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No hay productos registrados en el inventario</p>
            <p className="text-slate-400">Registra productos en el catálogo para monitorear sus existencias.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Stock Actual</th>
                  <th className="py-3.5 px-4">Stock Mínimo</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-5 text-right">Reposición Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const stock = Number(item.cantidad) || 0;
                  const min = Number(item.minimo) || 5;
                  const isUpdating = updatingId === (item.uuid || item.id);
                  const isCritical = stock <= min;
                  const isLow = !isCritical && stock <= min * 1.5;

                  return (
                    <tr key={item.uuid || item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {item.nombre}
                        {item.tamano && <span className="text-[11px] text-slate-400 ml-1.5 font-normal">({item.tamano})</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{item.categoria || 'General'}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">
                        {stock} uds
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{min} uds</td>
                      <td className="py-3.5 px-4">
                        {isCritical ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200/80 flex items-center gap-1.5 w-max">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> 
                            <span>Quiebre Inminente</span>
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200/80 w-max block">
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80 w-max flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Óptimo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right space-x-2">
                        <button
                          onClick={() => handleAddStock(item, 10)}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white disabled:opacity-50 text-slate-800 text-[11px] font-bold transition-colors font-mono shadow-2xs"
                          title="Sumar 10 unidades al stock en MySQL"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => handleAddStock(item, 50)}
                          disabled={isUpdating}
                          className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white disabled:opacity-50 text-slate-800 text-[11px] font-bold transition-colors font-mono shadow-2xs"
                          title="Sumar bulto (+50 unidades) al stock en MySQL"
                        >
                          +50
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold ${
            toast.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-800 shadow-rose-950/20 backdrop-blur-md'
              : 'bg-slate-900/95 text-white border-slate-800 shadow-slate-950/20 backdrop-blur-md'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button 
              onClick={() => setToast(null)}
              className="ml-2 text-slate-400 hover:text-white p-0.5 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}