import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, X, Trash2, RefreshCw, Loader2, Package, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const CATS_CACHE_KEY = 'optimus360_categories_cache_v1';

export default function CategoriasModule() {
  const [categories, setCategories] = useState(() => {
    try {
      const cached = localStorage.getItem(CATS_CACHE_KEY);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const colors = [
    { color: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-200/80', badge: 'bg-blue-100 text-blue-800' },
    { color: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200/80', badge: 'bg-amber-100 text-amber-800' },
    { color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-200/80', badge: 'bg-purple-100 text-purple-800' },
    { color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200/80', badge: 'bg-emerald-100 text-emerald-800' },
    { color: 'from-rose-500/10 to-red-500/10', border: 'border-rose-200/80', badge: 'bg-rose-100 text-rose-800' },
  ];

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.categorias.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data);
        try {
          localStorage.setItem(CATS_CACHE_KEY, JSON.stringify(data));
        } catch (e) {}
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = () => {
    setModalError('');
    setShowModal(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) {
      setModalError('Por favor ingresa un nombre para la categoría.');
      return;
    }
    setSaving(true);
    setModalError('');

    try {
      const cleanName = name.trim();
      const res = await api.categorias.create(cleanName);

      const newCategoryObj = {
        id: res?.id || Date.now(),
        uuid: res?.uuid || `cat-${Date.now()}`,
        nombre: cleanName,
        total_productos: 0
      };

      // Actualizar inmediatamente en pantalla y guardar en cache
      setCategories(prev => {
        const updated = [newCategoryObj, ...prev.filter(c => c.nombre.toLowerCase() !== cleanName.toLowerCase())];
        try {
          localStorage.setItem(CATS_CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setName('');
      setShowModal(false);
      showNotification(`Categoría "${cleanName}" creada exitosamente.`);
      await fetchCategories();
    } catch (err) {
      setModalError(err.message || 'No se pudo crear la categoría.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uuid, catName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${catName}"?`)) return;
    try {
      await api.categorias.delete(uuid);
      setCategories(prev => {
        const updated = prev.filter(c => (c.uuid || c.id) !== uuid && c.nombre !== catName);
        try {
          localStorage.setItem(CATS_CACHE_KEY, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      showNotification(`Categoría "${catName}" eliminada correctamente.`);
    } catch (err) {
      showNotification(err.message || 'Error al eliminar la categoría.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Familias & Categorías</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Grupos de productos registrados en la base de datos MySQL
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            title="Recargar categorías"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Categoría</span>
          </button>
        </div>
      </div>

      {/* Grid de Categorías */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs bg-white rounded-3xl border border-slate-200/80">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span>Consultando categorías en la base de datos...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-slate-200/80">
          <FolderTree className="w-8 h-8 text-slate-300" />
          <p className="font-bold text-slate-700 text-sm">No hay categorías registradas</p>
          <p className="text-slate-400">Crea tu primera categoría para organizar tus productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => {
            const style = colors[idx % colors.length];
            return (
              <div 
                key={cat.uuid || cat.id} 
                className={`group bg-gradient-to-br ${style.color} bg-white/95 p-5 sm:p-6 rounded-3xl border ${style.border} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-extrabold text-slate-900 text-sm">{cat.nombre}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono shadow-2xs ${style.badge}`}>
                      {cat.total_productos || 0} productos
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    Familia de artículos de catálogo
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/40 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Actualizado</span>
                  <button
                    onClick={() => handleDelete(cat.uuid, cat.nombre)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <FolderTree className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Nueva Categoría</h3>
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
                  <p className="font-bold text-[11px] text-rose-900">No se pudo crear la categoría</p>
                  <p className="text-[11px] leading-tight text-rose-700">{modalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre de la Categoría:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Abarrotes, Bebidas, Lácteos..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
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
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Guardando...' : 'Crear Categoría'}</span>
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
