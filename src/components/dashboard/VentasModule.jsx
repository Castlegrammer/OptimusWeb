import React, { useState } from 'react';
import { ShoppingCart, Plus, Search, Filter, Printer, Check, ArrowRight, Calculator } from 'lucide-react';

export default function VentasModule({ bcvRate = 884.75, onOpenCalculator }) {
  const [salesList, setSalesList] = useState([
    { id: 'FAC-0089', date: '22 Oct 2026 12:14', client: 'Carlos Silva', items: '4 productos', totalUsd: 42.50, paymentMethod: 'Pago Móvil (BCV)', status: 'Completado' },
    { id: 'FAC-0088', date: '22 Oct 2026 11:50', client: 'Consumidor Final', items: '2 productos', totalUsd: 14.00, paymentMethod: 'Efectivo USD', status: 'Completado' },
    { id: 'FAC-0087', date: '22 Oct 2026 11:32', client: 'Panadería La Espiga', items: '12 productos', totalUsd: 185.00, paymentMethod: 'USDT Binance', status: 'Completado' },
    { id: 'FAC-0086', date: '22 Oct 2026 10:45', client: 'Marta Rivas', items: '6 productos', totalUsd: 38.00, paymentMethod: 'Fiado (Crédito)', status: 'Por cobrar' },
    { id: 'FAC-0085', date: '22 Oct 2026 09:20', client: 'Ferretería Moderna', items: '15 productos', totalUsd: 220.50, paymentMethod: 'Punto de Venta (Bs)', status: 'Completado' },
  ]);

  const [search, setSearch] = useState('');
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMethod, setNewMethod] = useState('Pago Móvil (BCV)');

  const handleCreateSale = (e) => {
    e.preventDefault();
    if (!newAmount) return;
    const amountUsd = parseFloat(newAmount) || 0;
    const newEntry = {
      id: `FAC-00${salesList.length + 90}`,
      date: 'Hoy (Reciente)',
      client: newClient || 'Consumidor Final',
      items: 'Venta Mostrador',
      totalUsd: amountUsd,
      paymentMethod: newMethod,
      status: newMethod === 'Fiado (Crédito)' ? 'Por cobrar' : 'Completado',
    };
    setSalesList([newEntry, ...salesList]);
    setShowNewSaleModal(false);
    setNewClient('');
    setNewAmount('');
  };

  const filtered = salesList.filter(s => 
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.client.toLowerCase().includes(search.toLowerCase()) ||
    s.paymentMethod.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Módulo de Ventas & Facturación</h2>
          <p className="text-xs text-neutral-500">Emisión de tickets en mostrador y cobro multimoneda (USD / Bs al BCV)</p>
        </div>

        <div className="flex items-center gap-2">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
              title="Calcular vuelto a diferentes tasas"
            >
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Calculadora de Vuelto</span>
            </button>
          )}

          <button
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta Rápida</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ticket, cliente o método de pago..."
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Ticket / Fecha</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Método de pago</th>
                <th className="py-3 px-4">Total USD</th>
                <th className="py-3 px-4">Total Bs (Tasa BCV)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-neutral-900 block">{s.id}</span>
                    <span className="text-[10px] text-neutral-400">{s.date}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-neutral-900">{s.client}</td>
                  <td className="py-3 px-4 text-neutral-600">{s.paymentMethod}</td>
                  <td className="py-3 px-4 font-mono font-bold text-neutral-950">${s.totalUsd.toFixed(2)}</td>
                  <td className="py-3 px-4 font-mono text-neutral-600 font-medium">
                    Bs. {(s.totalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      s.status === 'Completado' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' 
                        : 'bg-amber-50 text-amber-800 border-amber-200/60'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => alert(`Imprimiendo ticket ${s.id}...`)}
                      className="text-neutral-500 hover:text-neutral-950 p-1"
                      title="Imprimir ticket térmico"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Venta */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full relative shadow-xl">
            <h3 className="text-base font-bold text-neutral-950 mb-3">Registrar Nueva Venta</h3>
            <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Nombre del Cliente</label>
                <input
                  type="text"
                  placeholder="Ej. Consumidor Final / María Pérez"
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Monto en Dólares ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="25.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                />
                {newAmount && (
                  <div className="text-[11px] text-neutral-500 font-mono mt-1">
                    Equivalente en Bolívares (Tasa BCV {bcvRate.toFixed(2)}): <strong className="text-neutral-950">Bs. {(parseFloat(newAmount || 0) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Método de Cobro</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                >
                  <option value="Pago Móvil (BCV)">Pago Móvil (Tasa BCV)</option>
                  <option value="Efectivo USD">Efectivo USD ($)</option>
                  <option value="Punto de Venta (Bs)">Punto de Venta Débito (Bs)</option>
                  <option value="USDT Binance">USDT Binance / Cripto</option>
                  <option value="Fiado (Crédito)">Fiado a Cliente (Cuenta por cobrar)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-950 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl font-semibold"
                >
                  Confirmar y emitir ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
