import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, QrCode, X, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function ProductosModule({ bcvRate = 884.75 }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  // Cargar productos de la base de datos MySQL (vía API REST)
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.productos.getAll(search, selectedCategory);
      setProducts(data);
    } catch (err) {
      console.error('Error al cargar productos del servidor:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías disponibles
  const fetchCategories = async () => {
    try {
      const cats = await api.categorias.getAll();
      setCategories(cats);
    } catch (err) {
      console.warn('Categorías por defecto:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      fetchProducts();
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    setSaving(true);

    try {
      await api.productos.create({
        nombre: newName.trim(),
        descripcion: newSku ? `SKU: ${newSku}` : '',
        categoria: newCategory,
        costo: parseFloat(newCost) || 0,
        precio: parseFloat(newPrice) || 0,
        cantidad: parseFloat(newStock) || 0,
        unidad: 'Unidad'
      });

      setShowAddModal(false);
      setNewName('');
      setNewSku('');
      setNewCost('');
      setNewPrice('');
      setNewStock('');
      await fetchProducts();
    } catch (err) {
      alert(err.message || 'Error al guardar producto');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (uuid, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    try {
      await api.productos.delete(uuid);
      setProducts(products.filter(p => p.uuid !== uuid));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Abarrotes': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Bebidas': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Limpieza': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Charcutería': return 'bg-purple-50 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Catálogo de Productos & Precios</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Conectado a MySQL en vivo" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Datos reales en la nube sincronizados con Android. (Tasa Oficial BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            title="Recargar desde la base de datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
            placeholder="Buscar por nombre de producto... (Presione Enter)"
            className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-300/80 rounded-2xl px-3.5 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs w-full sm:w-auto"
          >
            <option value="Todas">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.uuid || c.id} value={c.nombre}>{c.nombre}</option>
            ))}
            {categories.length === 0 && (
              <>
                <option value="General">General</option>
                <option value="Abarrotes">Abarrotes</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Limpieza">Limpieza</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Consultando productos en la base de datos...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Package className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No hay productos registrados en la base de datos</p>
            <p className="text-slate-400">Puedes crear un producto nuevo aquí o sincronizar desde tu app móvil Android.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Costo USD</th>
                  <th className="py-3.5 px-4">PVP USD ($)</th>
                  <th className="py-3.5 px-4">PVP en Bs (BCV)</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((item) => {
                  const price = Number(item.precio) || 0;
                  const cost = Number(item.costo) || 0;
                  const stock = Number(item.cantidad) || 0;
                  const priceBs = (price * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  const isLow = stock <= 5;

                  return (
                    <tr key={item.uuid || item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        {item.nombre}
                        {item.tamano && <span className="text-[11px] text-slate-400 ml-1.5 font-normal">({item.tamano})</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(item.categoria)}`}>
                          {item.categoria || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">${cost.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">${price.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        Bs. {priceBs}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                          isLow ? 'bg-amber-100 text-amber-900 border border-amber-300/80' : 'text-slate-800'
                        }`}>
                          {stock} uds
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(item.uuid, item.nombre)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar producto"
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

      {/* Modal Nuevo Producto */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full relative shadow-2xl text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Agregar Producto al Catálogo</h3>
                  <p className="text-[11px] text-slate-500">Se guardará en MySQL y se sincronizará con Android</p>
                </div>
              </div>

              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre del Producto:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Harina de Maíz 1kg"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Código / SKU:</label>
                  <input
                    type="text"
                    placeholder="759..."
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Categoría:</label>
                  <input
                    type="text"
                    placeholder="Ej. Abarrotes"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Costo ($ USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">PVP ($ USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1.50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Inicial:</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {newPrice && (
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-950 font-mono">
                  Precio de venta en Bolívares (BCV): <strong className="font-extrabold text-emerald-900">Bs. {(parseFloat(newPrice) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                  <span>{saving ? 'Guardando...' : 'Guardar Producto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
