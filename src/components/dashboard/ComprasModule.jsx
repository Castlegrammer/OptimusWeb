import React, { useState } from 'react';
import { ShoppingBag, Plus, Search, Truck, Check, FileText } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Módulo de Compras a Proveedores</h2>
          <p className="text-xs text-neutral-500">Registro de facturas de mercadería, costos y reposición de bodega</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Compra</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Código / Fecha</th>
                <th className="py-3 px-4">Proveedor</th>
                <th className="py-3 px-4">Detalle mercadería</th>
                <th className="py-3 px-4">Monto USD</th>
                <th className="py-3 px-4">Monto Bs (Tasa BCV)</th>
                <th className="py-3 px-4">Condición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {purchases.map((p) => (
                <tr key={p.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-neutral-900 block">{p.id}</span>
                    <span className="text-[10px] text-neutral-400">{p.date}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">{p.supplier}</td>
                  <td className="py-3 px-4 text-neutral-600">{p.items}</td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-950">${p.totalUsd.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600 font-medium">
                    Bs. {(p.totalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      p.status === 'Pagado'
                        ? 'bg-neutral-100 text-neutral-700 border-neutral-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200/60'
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full relative shadow-xl text-xs space-y-3">
            <h3 className="text-base font-bold text-neutral-950">Registrar Factura de Compra</h3>
            <form onSubmit={handleAddPurchase} className="space-y-3">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Proveedor</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Distribuidora Polar C.A."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Descripción de Mercadería</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 10 Cajas de Aceite y Harina"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Total Compra ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-950 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl font-semibold"
                >
                  Guardar Compra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
