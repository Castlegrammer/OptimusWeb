import React, { useState, useEffect } from 'react';
import { FolderTree, Plus, X, Trash2, RefreshCw, Loader2, Package } from 'lucide-react';
import api from '../../services/api';

export default function CategoriasModule() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(false);

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
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !name.trim()) return;
    setSaving(true);

    try {
      await api.categorias.create(name.trim());
      setName('');
      setShowModal(false);
      await fetchCategories();
    } catch (err) {
      alert(err.message || 'Error al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uuid, catName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${catName}"?`)) return;
    try {
      await api.categorias.delete(uuid);
      setCategories(categories.filter(c => c.uuid !== uuid));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
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
            onClick={() => setShowModal(true)}
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

    </div>
  );
}
