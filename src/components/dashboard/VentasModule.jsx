import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calculator,
  Receipt,
  X,
  Loader2,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api';

export default function VentasModule({ bcvRate = 884.75, onOpenCalculator }) {
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [newClient, setNewClient] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newConcept, setNewConcept] = useState('Venta Mostrador');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await api.ventas.getAll();
      setSalesList(data);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleCreateSale = async (e) => {
    e.preventDefault();
    if (!newAmount) return;
    const amountUsd = parseFloat(newAmount) || 0;
    setSaving(true);

    try {
      await api.ventas.create({
        cliente: newClient.trim() || 'Consumidor Final',
        total: amountUsd,
        inicial: amountUsd,
        detalles: [
          {
            producto: newConcept.trim() || 'Venta Mostrador',
            cantidad: 1,
            precio: amountUsd,
            total: amountUsd
          }
        ]
      });

      setShowNewSaleModal(false);
      setNewClient('');
      setNewAmount('');
      setNewConcept('Venta Mostrador');
      await fetchSales();
    } catch (err) {
      alert(err.message || 'Error al registrar venta');
    } finally {
      setSaving(false);
    }
  };

  const filtered = salesList.filter(s => {
    const cli = s.cliente || '';
    const idStr = String(s.id || s.uuid || '');
    return cli.toLowerCase().includes(search.toLowerCase()) || idStr.toLowerCase().includes(search.toLowerCase());
  });

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
            Registro transaccional en tiempo real con MySQL y sincronizado con Android (BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
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
            onClick={fetchSales}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            title="Recargar ventas"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowNewSaleModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Venta</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o número de ticket..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Consultando ventas en la base de datos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Receipt className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No hay ventas registradas aún</p>
            <p className="text-slate-400">Registra una venta desde la Web o sincroniza las ventas realizadas en tu app móvil.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Ticket / Ref</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Monto USD</th>
                  <th className="py-3.5 px-4">Equivalente BCV</th>
                  <th className="py-3.5 px-5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const total = Number(s.total) || 0;
                  const totalBs = (total * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <tr key={s.uuid || s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                        #{s.id ? String(s.id).padStart(4, '0') : (s.uuid ? s.uuid.substring(0, 8) : 'VENTA')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{s.fecha || 'Reciente'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.cliente || 'Consumidor Final'}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">${total.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">Bs. {totalBs}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 font-mono">
                          Registrado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Venta */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Registrar Venta</h3>
                  <p className="text-[11px] text-slate-500">Se guardará en la base de datos central</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNewSaleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSale} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Cliente:</label>
                <input
                  type="text"
                  placeholder="Ej. Consumidor Final, Pedro Pérez..."
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Concepto / Detalle:</label>
                <input
                  type="text"
                  placeholder="Ej. Venta mostrador, 2 Harinas..."
                  value={newConcept}
                  onChange={(e) => setNewConcept(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Total ($ USD):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {newAmount && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 font-mono">
                  Total en Bolívares (BCV): <strong className="font-extrabold text-emerald-900">Bs. {(parseFloat(newAmount) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}

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
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Guardando...' : 'Confirmar Venta'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
