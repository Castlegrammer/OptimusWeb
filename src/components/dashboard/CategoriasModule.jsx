import React, { useState } from 'react';
import { FolderTree, Plus, Search, Layers } from 'lucide-react';

export default function CategoriasModule() {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Abarrotes & Víveres', count: 142, desc: 'Harinas, arroces, pastas, aceites y granos secos' },
    { id: 2, name: 'Bebidas & Refrescos', count: 68, desc: 'Aguas, jugos, maltas, gaseosas y energizantes' },
    { id: 3, name: 'Charcutería & Lácteos', count: 35, desc: 'Quesos nacionales, jamones, salchichas y mantequillas' },
    { id: 4, name: 'Artículos de Limpieza', count: 52, desc: 'Detergentes, cloro, jabones, desinfectantes' },
    { id: 5, name: 'Golosinas & Snacks', count: 84, desc: 'Chocolates, galletas, chucherías y caramelos' },
    { id: 6, name: 'Ferretería Liviana', count: 40, desc: 'Tornillería, herramientas manuales, cintas' },
  ]);

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name) return;
    setCategories([...categories, { id: Date.now(), name, count: 0, desc: desc || 'Sin descripción' }]);
    setName('');
    setDesc('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Familias & Categorías de Productos</h2>
          <p className="text-xs text-neutral-500">Organización del inventario para búsquedas rápidas en el punto de venta</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-neutral-950 text-sm">{cat.name}</span>
                <span className="text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full font-mono">
                  {cat.count} productos
                </span>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {cat.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center text-xs text-neutral-400">
              <span>Categoría activa</span>
              <button 
                onClick={() => alert(`Editando categoría: ${cat.name}`)}
                className="text-neutral-900 font-semibold hover:underline"
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-sm w-full relative shadow-xl text-xs space-y-3">
            <h3 className="text-base font-bold text-neutral-950">Nueva Categoría</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cuidado Personal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Descripción</label>
                <textarea
                  rows="2"
                  placeholder="Descripción de los productos que agrupa..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
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
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
