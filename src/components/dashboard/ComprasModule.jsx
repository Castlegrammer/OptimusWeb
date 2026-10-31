import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Truck, Check, FileText, X, Loader2, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function ComprasModule({ bcvRate = 884.75 }) {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState('');
  const [amount, setAmount] = useState('');

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await api.compras.getAll();
      setPurchases(data);
    } catch (err) {
      console.error('Error al cargar compras:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!amount) return;
    setSaving(true);

    try {
      await api.compras.create({
        proveedor: supplier.trim() || 'Proveedor Directo',
        total: parseFloat(amount) || 0,
        inicial: parseFloat(amount) || 0,
        fecha: new Date().toISOString().split('T')[0]
      });

      setShowModal(false);
      setSupplier('');
      setItems('');
      setAmount('');
      await fetchPurchases();
    } catch (err) {
      alert(err.message || 'Error al registrar compra');
    } finally {
      setSaving(false);
    }
  };

  const filtered = purchases.filter(p => {
    const prov = p.proveedor || '';
    const id = String(p.id || p.uuid || '');
    const term = search.toLowerCase();
    return prov.toLowerCase().includes(term) || id.toLowerCase().includes(term);
  });

  const totalSpent = purchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Compras a Proveedores & Reposición</h2>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" title="Conectado a MySQL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de facturas de mercancía almacenadas en la base de datos central (BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchPurchases}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            title="Recargar compras de MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Factura</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 via-white to-white p-5 rounded-3xl border border-blue-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total en Compras Registradas</div>
          <div className="text-3xl font-mono font-extrabold text-slate-900 mt-1.5">${totalSpent.toFixed(2)} USD</div>
          <div className="text-xs font-mono text-emerald-800 font-bold mt-1">
            Bs. {(totalSpent * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })} VES (Tasa BCV)
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Facturas Registradas</div>
            <div className="text-3xl font-mono font-extrabold text-slate-900 mt-1.5">{purchases.length} compras</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Guardadas en la base de datos</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar factura por proveedor o número de documento..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Consultando compras en la base de datos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No hay compras registradas en la base de datos</p>
            <p className="text-slate-400">Registra las facturas de tus proveedores para llevar el control contable.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Ref / ID</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Proveedor</th>
                  <th className="py-3.5 px-4">Total USD</th>
                  <th className="py-3.5 px-5">Total en Bs (BCV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const total = Number(item.total) || 0;
                  const totalBs = (total * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  return (
                    <tr key={item.uuid || item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                        #{item.id ? String(item.id).padStart(4, '0') : (item.uuid ? item.uuid.substring(0, 8) : 'COMPRA')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{item.fecha || 'Reciente'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.proveedor || 'Proveedor Directo'}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">${total.toFixed(2)}</td>
                      <td className="py-3.5 px-5 font-mono font-bold text-emerald-800">Bs. {totalBs}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Compra */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Registrar Factura de Compra</h3>
                  <p className="text-[11px] text-slate-500">Se guardará en la base de datos central</p>
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
                <label className="block text-slate-700 font-bold mb-1">Proveedor / Distribuidor:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Distribuidora Santa Elena C.A."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Monto Total Factura ($ USD):</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="150.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {amount && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 font-mono">
                  Monto en Bolívares (BCV): <strong className="font-extrabold text-emerald-900">Bs. {(parseFloat(amount) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}

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
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Guardando...' : 'Guardar Factura'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}