import React, { useState } from 'react';
import { FolderTree, Plus, Search, Layers, X, Sparkles, FolderHeart } from 'lucide-react';

export default function CategoriasModule() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Abarrotes & Víveres', count: 142, desc: 'Harinas, arroces, pastas, aceites y granos secos', color: 'from-blue-500/10 to-indigo-500/10', border: 'border-blue-200/80', badge: 'bg-blue-100 text-blue-800' },
    { id: 2, name: 'Bebidas & Refrescos', count: 68, desc: 'Aguas, jugos, maltas, gaseosas y energizantes', color: 'from-amber-500/10 to-orange-500/10', border: 'border-amber-200/80', badge: 'bg-amber-100 text-amber-800' },
    { id: 3, name: 'Charcutería & Lácteos', count: 35, desc: 'Quesos nacionales, jamones, salchichas y mantequillas', color: 'from-purple-500/10 to-pink-500/10', border: 'border-purple-200/80', badge: 'bg-purple-100 text-purple-800' },
    { id: 4, name: 'Artículos de Limpieza', count: 52, desc: 'Detergentes, cloro, jabones, desinfectantes', color: 'from-emerald-500/10 to-teal-500/10', border: 'border-emerald-200/80', badge: 'bg-emerald-100 text-emerald-800' },
    { id: 5, name: 'Golosinas & Snacks', count: 84, desc: 'Chocolates, galletas, chucherías y caramelos', color: 'from-rose-500/10 to-red-500/10', border: 'border-rose-200/80', badge: 'bg-rose-100 text-rose-800' },
    { id: 6, name: 'Ferretería Liviana', count: 40, desc: 'Tornillería, herramientas manuales, pegamentos, cintas', color: 'from-slate-500/10 to-slate-400/10', border: 'border-slate-200/80', badge: 'bg-slate-100 text-slate-800' },
  ]);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    setCategories([...categories, { 
      id: Date.now(), 
      name, 
      count: 0, 
      desc: desc || 'Sin descripción',
      color: 'from-blue-500/10 to-indigo-500/10',
      border: 'border-blue-200/80',
      badge: 'bg-blue-100 text-blue-800'
    }]);
    setName('');
    setDesc('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Familias & Categorías de Productos</h2>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Organiza tus productos en grupos para encontrarlos de inmediato en el momento de la venta
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className={`group bg-gradient-to-br ${cat.color || 'from-slate-50 to-white'} bg-white/95 p-5 sm:p-6 rounded-3xl border ${cat.border || 'border-slate-200/80'} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="font-extrabold text-slate-900 text-sm">{cat.name}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-mono shadow-2xs ${cat.badge || 'bg-slate-100 text-slate-700'}`}>
                  {cat.count} productos
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                {cat.desc}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Activa en mostrador</span>
              </span>
              <button 
                onClick={() => alert(`Editando categoría: ${cat.name}`)}
                className="text-blue-600 font-bold hover:underline"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nueva Categoría */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Nueva Categoría</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
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
                  placeholder="Ej. Cuidado Personal, Condimentos..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Descripción (Opcional):</label>
                <textarea
                  rows="2"
                  placeholder="Productos que contiene este grupo..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
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
                  Guardar Categoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
