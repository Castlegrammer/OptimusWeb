import React, { useState } from 'react';
import { Package, Plus, Search, Filter, QrCode } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Catálogo Maestro de Productos</h2>
          <p className="text-xs text-neutral-500">
            Fijación de precios en USD con equivalencia automática en Bolívares (Tasa BCV oficial: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o código de barras (SKU)..."
            className="w-full bg-white border border-neutral-200 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-700 font-semibold focus:outline-none w-full sm:w-auto"
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
      <div className="bg-white rounded-2xl border border-neutral-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 text-[11px] font-semibold">
              <tr>
                <th className="py-3 px-4">Producto</th>
                <th className="py-3 px-4">Código (SKU)</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Costo USD</th>
                <th className="py-3 px-4">PVP USD ($)</th>
                <th className="py-3 px-4">PVP en Bs (Tasa BCV)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((item) => {
                const margin = (((item.price - item.cost) / item.price) * 100).toFixed(0);
                const priceBs = (item.price * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                return (
                  <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3 px-4 font-semibold text-neutral-950">{item.name}</td>
                    <td className="py-3 px-4 font-mono text-neutral-400 text-[11px] flex items-center gap-1">
                      <QrCode className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{item.sku}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-500">${item.cost.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-neutral-950">${item.price.toFixed(2)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800 bg-emerald-50/40">
                      Bs. {priceBs}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      <span className={item.stock <= 10 ? 'text-amber-800' : 'text-neutral-900'}>
                        {item.stock} uds
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-neutral-600 font-semibold">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 max-w-md w-full relative shadow-xl text-xs space-y-3">
            <h3 className="text-base font-bold text-neutral-950">Agregar Producto al Catálogo</h3>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Leche Condensada 395g"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Código de barras (SKU)</label>
                  <input
                    type="text"
                    placeholder="759..."
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Categoría</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 focus:outline-none focus:border-neutral-950"
                  >
                    <option value="Abarrotes">Abarrotes</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Charcutería">Charcutería</option>
                    <option value="Ferretería">Ferretería</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Costo ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={newCost}
                    onChange={(e) => setNewCost(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">PVP ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="1.50"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-white border border-neutral-300 rounded-xl px-3 py-2 text-neutral-900 font-mono focus:outline-none focus:border-neutral-950"
                  />
                </div>
              </div>

              {newPrice && (
                <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-600 font-mono">
                  Precio calculado en Bolívares (BCV): <strong className="text-neutral-950">Bs. {(parseFloat(newPrice) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-neutral-600 hover:text-neutral-950 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl font-semibold"
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
