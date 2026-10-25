import React, { useState } from 'react';
import { Boxes, AlertTriangle, ArrowUpDown, Plus, Search, CheckCircle2, PackageCheck } from 'lucide-react';

export default function InventarioModule() {
  const [stockList, setStockList] = useState([
    { id: 1, name: 'Aceite Vegetal Comestible 1L', sku: '75910110025', current: 3, min: 10, max: 50, location: 'Bodega Principal', status: 'critical' },
    { id: 2, name: 'Detergente Polvo 1kg', sku: '75910110069', current: 4, min: 12, max: 40, location: 'Estante 2', status: 'critical' },
    { id: 3, name: 'Atún en Trozos 170g', sku: '75910110080', current: 7, min: 15, max: 60, location: 'Estante 1', status: 'low' },
    { id: 4, name: 'Harina de Maíz Blanco 1kg', sku: '75910110012', current: 45, min: 20, max: 100, location: 'Bodega Principal', status: 'ok' },
    { id: 5, name: 'Arroz Blanco Extra 1kg', sku: '75910110038', current: 60, min: 25, max: 120, location: 'Bodega Principal', status: 'ok' },
    { id: 6, name: 'Café Molido Gourmet 250g', sku: '75910110041', current: 24, min: 10, max: 50, location: 'Vitrina', status: 'ok' },
  ]);

  const [search, setSearch] = useState('');

  const handleAddStock = (id, amount) => {
    setStockList(stockList.map(item => {
      if (item.id === id) {
        const next = item.current + amount;
        return {
          ...item,
          current: next,
          status: next <= item.min ? 'critical' : next <= item.min * 1.5 ? 'low' : 'ok'
        };
      }
      return item;
    }));
  };

  const filtered = stockList.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.sku.includes(search)
  );

  const lowStockCount = stockList.filter(s => s.status === 'critical' || s.status === 'low').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Control de Existencias & Quiebre de Stock</h2>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo continuo en bodega para no quedarte sin mercancía en los días de mayor venta
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
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
          placeholder="Buscar producto por nombre o código de barras..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Stock Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Producto / Código</th>
                <th className="py-3.5 px-4">Ubicación</th>
                <th className="py-3.5 px-4">Stock Actual</th>
                <th className="py-3.5 px-4">Stock Mínimo</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-right">Reposición Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-bold text-slate-900 block">{item.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{item.sku}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{item.location}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">
                    {item.current} uds
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{item.min} uds</td>
                  <td className="py-3.5 px-4">
                    {item.status === 'critical' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200/80 flex items-center gap-1.5 w-max">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> 
                        <span>Quiebre Inminente</span>
                      </span>
                    ) : item.status === 'low' ? (
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
                      onClick={() => handleAddStock(item.id, 10)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-800 text-[11px] font-bold transition-colors font-mono shadow-2xs"
                      title="Sumar 10 unidades"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleAddStock(item.id, 50)}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 text-[11px] font-bold transition-colors font-mono shadow-2xs"
                      title="Sumar bulto (+50 unidades)"
                    >
                      +50
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
