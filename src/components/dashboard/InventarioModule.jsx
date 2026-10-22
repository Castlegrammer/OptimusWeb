import React, { useState } from 'react';
import { Boxes, AlertTriangle, ArrowUpDown, Plus, Search } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Control de Existencias & Alertas de Quiebre</h2>
          <p className="text-xs text-neutral-500">Monitoreo continuo de stock para evitar pérdidas de venta por falta de mercancía</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>3 productos bajo el mínimo</span>
          </span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto o código de barras..."
          className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
        />
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Producto / Código</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Stock actual</th>
                <th className="py-3 px-4">Stock Mínimo</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Reposición Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-950 block">{item.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{item.sku}</span>
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{item.location}</td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-950 text-sm">
                    {item.current} uds
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-500">{item.min} uds</td>
                  <td className="py-3 px-4">
                    {item.status === 'critical' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-800 border border-rose-200/60 flex items-center gap-1 w-max">
                        <AlertTriangle className="w-3 h-3 text-rose-600" /> Quiebre inminente
                      </span>
                    ) : item.status === 'low' ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 w-max block">
                        Stock bajo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 w-max block">
                        Óptimo
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleAddStock(item.id, 10)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white text-neutral-800 text-[11px] font-semibold transition-colors font-mono"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleAddStock(item.id, 50)}
                      className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-950 hover:text-white text-neutral-800 text-[11px] font-semibold transition-colors font-mono"
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
