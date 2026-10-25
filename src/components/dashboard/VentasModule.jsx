import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Check, 
  ArrowRight, 
  Calculator,
  Receipt,
  DollarSign,
  CreditCard,
  X
} from 'lucide-react';

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

  const getMethodBadgeClass = (method) => {
    if (method.includes('Pago Móvil')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (method.includes('Efectivo')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (method.includes('USDT')) return 'bg-amber-50 text-amber-900 border-amber-200';
    if (method.includes('Fiado')) return 'bg-orange-50 text-orange-800 border-orange-200';
    return 'bg-purple-50 text-purple-800 border-purple-200';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Ventas & Facturación (Caja POS)</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Emisión de tickets de mostrador y cobro multimoneda (USD y Bolívares a tasa oficial BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border border-emerald-300/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs"
              title="Calcular vuelto a diferentes tasas"
            >
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Calculadora de Vuelto</span>
            </button>
          )}

          <button
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Venta Rápida</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar venta por número de ticket, nombre de cliente o forma de pago..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Ticket / Fecha</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Método de Pago</th>
                <th className="py-3.5 px-4">Monto ($ USD)</th>
                <th className="py-3.5 px-4">Monto en Bs (BCV)</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-5">
                    <span className="font-mono font-bold text-slate-900 block">{s.id}</span>
                    <span className="text-[10px] text-slate-400">{s.date}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{s.client}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getMethodBadgeClass(s.paymentMethod)}`}>
                      {s.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-950 text-sm">
                    ${s.totalUsd.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-800 font-semibold">
                    Bs. {(s.totalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      s.status === 'Completado' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button 
                      onClick={() => alert(`Imprimiendo ticket térmico para ${s.id}...`)}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Registrar Venta Rápida</h3>
                  <p className="text-[11px] text-slate-500">Cobro directo en caja de mostrador</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNewSaleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre del Cliente:</label>
                <input
                  type="text"
                  placeholder="Ej. Consumidor Final, María Pérez..."
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Monto en Dólares ($ USD):</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="25.00"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-slate-900 font-mono font-bold text-base focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                {newAmount && (
                  <div className="text-[11px] text-slate-500 font-mono mt-1">
                    Equivale a: <strong className="text-emerald-800 font-bold">Bs. {(parseFloat(newAmount || 0) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong> al BCV
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Método de Cobro:</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                >
                  <option value="Pago Móvil (BCV)">Pago Móvil (Tasa Oficial BCV)</option>
                  <option value="Efectivo USD">Efectivo Divisas ($ USD)</option>
                  <option value="Punto de Venta (Bs)">Punto de Venta Débito (Bs)</option>
                  <option value="USDT Binance">USDT Binance / P2P</option>
                  <option value="Fiado (Crédito)">Fiado a Libreta (Cuenta por cobrar)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Cobrar y Emitir Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
