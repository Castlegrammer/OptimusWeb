import React, { useState } from 'react';
import { Package, Plus, Search, Filter, QrCode, Sparkles, X, Tag } from 'lucide-react';

export default function ProductosModule({ bcvRate = 884.75 }) {
  const [products, setProducts] = useState([
    { id: 'PROD-01', name: 'Harina de Maíz Blanco 1kg', sku: '75910110012', category: 'Abarrotes', cost: 0.95, price: 1.40, stock: 45 },
    { id: 'PROD-02', name: 'Aceite Vegetal Comestible 1L', sku: '75910110025', category: 'Abarrotes', cost: 1.80, price: 2.70, stock: 12 },
    { id: 'PROD-03', name: 'Arroz Blanco Extra 1kg', sku: '75910110038', category: 'Abarrotes', cost: 0.85, price: 1.30, stock: 60 },
    { id: 'PROD-04', name: 'Café Molido Gourmet 250g', sku: '75910110041', category: 'Bebidas', cost: 2.80, price: 4.50, stock: 24 },
    { id: 'PROD-05', name: 'Refresco Cola 1.5L', sku: '75910110056', category: 'Bebidas', cost: 1.10, price: 1.75, stock: 18 },
    { id: 'PROD-06', name: 'Detergente Polvo 1kg', sku: '75910110069', category: 'Limpieza', cost: 2.10, price: 3.20, stock: 9 },
    { id: 'PROD-07', name: 'Queso Blanco Llanero Duro (kg)', sku: '75910110072', category: 'Charcutería', cost: 4.20, price: 6.00, stock: 15 },
  ]);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('Abarrotes');
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const item = {
      id: `PROD-0${products.length + 1}`,
      name: newName,
      sku: newSku || '759' + Math.floor(10000000 + Math.random() * 90000000),
      category: newCategory,
      cost: parseFloat(newCost) || 0,
      price: parseFloat(newPrice) || 0,
      stock: parseInt(newStock) || 0,
    };
    setProducts([...products, item]);
    setShowAddModal(false);
    setNewName('');
    setNewSku('');
    setNewCost('');
    setNewPrice('');
    setNewStock('');
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.includes(search);
    const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

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
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fijación de precios en USD con equivalencia automática al BCV (Tasa Oficial: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre de producto o código de barras (SKU)..."
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
            <option value="Abarrotes">Abarrotes</option>
            <option value="Bebidas">Bebidas</option>
            <option value="Limpieza">Limpieza</option>
            <option value="Charcutería">Charcutería</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Producto</th>
                <th className="py-3.5 px-4">Código (SKU)</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Costo USD</th>
                <th className="py-3.5 px-4">PVP USD ($)</th>
                <th className="py-3.5 px-4">PVP en Bs (BCV)</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-5 text-right">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const margin = item.price > 0 ? (((item.price - item.cost) / item.price) * 100).toFixed(0) : 0;
                const priceBs = (item.price * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                const isLow = item.stock <= 10;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.sku}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(item.category)}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">${item.cost.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">${item.price.toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      Bs. {priceBs}
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold ${
                        isLow ? 'bg-amber-100 text-amber-900 border border-amber-300/80' : 'text-slate-800'
                      }`}>
                        {item.stock} uds
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-blue-700">
                      +{margin}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
                  <p className="text-[11px] text-slate-500">Crea un artículo y calcula el precio al BCV</p>
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
                  placeholder="Ej. Leche Condensada 395g"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Código de barras (SKU):</label>
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
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Charcutería">Charcutería</option>
                    <option value="Ferretería">Ferretería</option>
                  </select>
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
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
