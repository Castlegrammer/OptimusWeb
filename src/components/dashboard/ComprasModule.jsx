import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Truck, Check, FileText, X } from 'lucide-react';

export default function ComprasModule({ bcvRate = 884.75 }) {
  const [purchases, setPurchases] = useState([
    { id: 'COM-021', date: '21 Oct 2026', supplier: 'Empresas Polar C.A.', items: 'Harina P.A.N. y Arroz (30 bultos)', totalUsd: 840.00, status: 'Pagado' },
    { id: 'COM-020', date: '19 Oct 2026', supplier: 'Distribuidora Lácteos Los Andes', items: 'Leche en polvo y Quesos', totalUsd: 450.00, status: 'Crédito 15 días' },
    { id: 'COM-019', date: '15 Oct 2026', supplier: 'Inversiones Kimberly Clark', items: 'Papel higiénico y pañales', totalUsd: 310.00, status: 'Pagado' },
    { id: 'COM-018', date: '10 Oct 2026', supplier: 'Cervecería Regional', items: 'Refrescos y Maltas (25 cajas)', totalUsd: 520.00, status: 'Pagado' },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState('');
  const [amount, setAmount] = useState('');

  const handleAddPurchase = (e) => {
    e.preventDefault();
    if (!amount) return;
    const newEntry = {
      id: `COM-0${purchases.length + 22}`,
      date: 'Hoy (Reciente)',
      supplier: supplier || 'Proveedor Directo',
      items: items || 'Mercadería General',
      totalUsd: parseFloat(amount),
      status: 'Pagado',
    };
    setPurchases([newEntry, ...purchases]);
    setShowModal(false);
    setSupplier('');
    setItems('');
    setAmount('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Compras a Proveedores & Reposición</h2>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de facturas de mercancía para mantener los costos al día y reponer inventario
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Compra</span>
        </button>
      </div>

      {/* Compras Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Código / Fecha</th>
                <th className="py-3.5 px-4">Proveedor</th>
                <th className="py-3.5 px-4">Detalle Mercadería</th>
                <th className="py-3.5 px-4">Monto USD ($)</th>
                <th className="py-3.5 px-4">Monto en Bs (BCV)</th>
                <th className="py-3.5 px-5">Condición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-mono font-bold text-slate-900 block">{p.id}</span>
                    <span className="text-[10px] text-slate-400">{p.date}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.supplier}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{p.items}</td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">
                    ${p.totalUsd.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-800 font-semibold">
                    Bs. {(p.totalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      p.status === 'Pagado'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-900 border-amber-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Compra */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Registrar Factura de Compra</h3>
                  <p className="text-[11px] text-slate-500">Ingreso de mercancía por mayorista</p>
                </div>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddPurchase} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre del Proveedor:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Distribuidora Polar C.A."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción de la Mercancía:</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 10 Cajas de Aceite y Harina"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Total de la Factura ($ USD):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                {amount && (
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Equivale a: <strong className="text-emerald-800 font-bold">Bs. {(parseFloat(amount || 0) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong> al BCV
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Guardar Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
