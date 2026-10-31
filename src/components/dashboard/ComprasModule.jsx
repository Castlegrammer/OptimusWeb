import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Truck, Check, FileText, X, Loader2, RefreshCw, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

export default function ComprasModule({ bcvRate = 884.75 }) {
  const currentUser = api.auth.getUser();
  const userKey = currentUser?.id || currentUser?.email || 'default';
  const COMPRAS_CACHE_KEY = `optimus360_compras_cache_${userKey}`;

  const [purchases, setPurchases] = useState(() => {
    try {
      const cached = localStorage.getItem(COMPRAS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [suppliersList, setSuppliersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }
  const [supplier, setSupplier] = useState('');
  const [amount, setAmount] = useState('');

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await api.compras.getAll();
      if (Array.isArray(data)) {
        // Normalizar montos numéricos para garantizar que no vengan undefined
        const normalized = data.map(item => ({
          ...item,
          total: Number(item.total ?? item.Total ?? item.monto ?? item.Monto ?? 0) || 0,
          inicial: Number(item.inicial ?? item.Inicial ?? item.total ?? 0) || 0,
          proveedor: item.proveedor || item.Proveedor || 'Proveedor Directo',
          fecha: item.fecha || item.Fecha || 'Reciente'
        }));

        if (normalized.length > 0) {
          setPurchases(normalized);
          try {
            localStorage.setItem(COMPRAS_CACHE_KEY, JSON.stringify(normalized));
          } catch (e) {}
        } else {
          setPurchases([]);
          try {
            localStorage.removeItem(COMPRAS_CACHE_KEY);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Error al cargar compras:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar lista de proveedores registrados para autocompletar en el modal
  useEffect(() => {
    fetchPurchases();

    api.proveedores.getAll().then(res => {
      if (Array.isArray(res)) setSuppliersList(res);
      else if (res && Array.isArray(res.data)) setSuppliersList(res.data);
    }).catch(() => {});
  }, []);

  const handleOpenModal = () => {
    setModalError('');
    setShowModal(true);
  };

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setModalError('Por favor ingresa un monto total válido para la factura.');
      return;
    }
    setSaving(true);
    setModalError('');

    try {
      const numTotal = parseFloat(amount) || 0;
      const cleanProv = supplier.trim() || 'Proveedor Directo';
      const todayDate = new Date().toISOString().split('T')[0];

      const res = await api.compras.create({
        proveedor: cleanProv,
        total: numTotal,
        inicial: numTotal,
        fecha: todayDate
      });

      const newPurchaseObj = {
        id: res?.id || res?.data?.id || Date.now(),
        uuid: res?.uuid || res?.data?.uuid || `com-${Date.now()}`,
        proveedor: cleanProv,
        total: numTotal,
        inicial: numTotal,
        fecha: todayDate
      };

      // Actualizar inmediatamente en estado y caché
      setPurchases(prev => {
        const updated = [newPurchaseObj, ...prev];
        try {
          localStorage.setItem(COMPRAS_CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setShowModal(false);
      setSupplier('');
      setAmount('');
      showNotification(`Factura de $${numTotal.toFixed(2)} USD registrada exitosamente.`);
      await fetchPurchases();
    } catch (err) {
      setModalError(err.message || 'No se pudo registrar la compra en la base de datos.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uuid, provName) => {
    if (!window.confirm(`¿Estás seguro de eliminar esta compra de ${provName}?`)) return;
    try {
      await api.compras.delete(uuid);
      setPurchases(prev => {
        const updated = prev.filter(p => (p.uuid || p.id) !== uuid);
        try {
          localStorage.setItem(COMPRAS_CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      showNotification('Factura de compra eliminada.');
    } catch (err) {
      showNotification(err.message || 'Error al eliminar factura.', 'error');
    }
  };

  const filtered = purchases.filter(p => {
    const prov = p.proveedor || '';
    const id = String(p.id || p.uuid || '');
    const term = search.toLowerCase();
    return prov.toLowerCase().includes(term) || id.toLowerCase().includes(term);
  });

  const totalSpent = purchases.reduce((sum, p) => {
    const t = Number(p.total ?? p.Total ?? p.monto ?? p.Monto ?? 0);
    return sum + (isNaN(t) ? 0 : t);
  }, 0);

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
            onClick={handleOpenModal}
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
                  <th className="py-3.5 px-4">Total en Bs (BCV)</th>
                  <th className="py-3.5 px-5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const total = Number(item.total ?? item.Total ?? item.monto ?? item.Monto ?? 0) || 0;
                  const totalBs = (total * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  const itemUuid = item.uuid || item.id;
                  const provName = item.proveedor || 'Proveedor Directo';

                  return (
                    <tr key={itemUuid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                        #{item.id ? String(item.id).padStart(4, '0') : (item.uuid ? String(item.uuid).substring(0, 8) : 'COMPRA')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{item.fecha || 'Reciente'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{provName}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">${total.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">Bs. {totalBs}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDelete(itemUuid, provName)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar factura de compra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

            {/* Error banner en el modal */}
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-[11px] text-rose-900">No se pudo guardar la compra</p>
                  <p className="text-[11px] leading-tight text-rose-700">{modalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddPurchase} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Proveedor / Distribuidor:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  list="suppliers-datalist"
                  placeholder="Ej. Distribuidora Santa Elena C.A."
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <datalist id="suppliers-datalist">
                  {suppliersList.map(s => (
                    <option key={s.uuid || s.id} value={s.nombre || s.name} />
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-400 mt-1 block">Selecciona uno registrado o escribe uno nuevo</span>
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

              {amount && !isNaN(parseFloat(amount)) && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 font-mono">
                  Monto en Bolívares (BCV): <strong className="font-extrabold text-emerald-900">Bs. {(parseFloat(amount) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
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
