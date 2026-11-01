import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, QrCode, X, Trash2, Edit2, RefreshCw, Loader2, Camera, AlertCircle, CheckCircle2, Barcode, Tag } from 'lucide-react';
import api from '../../services/api';
import BarcodeScannerModal from '../common/BarcodeScannerModal';

export default function ProductosModule({ bcvRate = 884.75 }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  
  // Modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [scannerTarget, setScannerTarget] = useState(null); // 'newSku' | 'editSku' | 'search' | null
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Form states (Nuevo Producto)
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newSupplier, setNewSupplier] = useState('');
  const [availableSuppliers, setAvailableSuppliers] = useState([]);
  const [newCost, setNewCost] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('');

  // Form states (Editar Producto)
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');

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

  // Cargar categorías guardadas en la base de datos por el usuario autenticado
  const fetchCategories = async () => {
    try {
      const cats = await api.categorias.getAll();
      if (Array.isArray(cats)) {
        setCategories(cats);
        if (cats.length > 0 && !newCategory) {
          setNewCategory(cats[0].nombre);
        }
      }
    } catch (err) {
      console.warn('Error al cargar categorías de BD:', err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const sups = await api.proveedores.getAll();
      setAvailableSuppliers(sups);
    } catch (e) {}
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      fetchProducts();
    }
  };

  // Manejo del código escaneado con la cámara
  const handleBarcodeDetected = (code) => {
    if (scannerTarget === 'newSku') {
      setNewSku(code);
      showNotification(`Código de barras escaneado: ${code}`);
    } else if (scannerTarget === 'editSku') {
      setEditSku(code);
      showNotification(`Código de barras escaneado: ${code}`);
    } else if (scannerTarget === 'search') {
      setSearch(code);
      showNotification(`Buscando código: ${code}`);
      api.productos.getAll(code, selectedCategory).then(data => setProducts(data)).catch(() => {});
    }
    setScannerTarget(null);
  };

  const handleOpenAddModal = () => {
    setModalError('');
    fetchCategories();
    fetchSuppliers();
    if (categories.length > 0 && !newCategory) {
      setNewCategory(categories[0].nombre);
    } else if (categories.length === 0) {
      setNewCategory('');
    }
    setShowAddModal(true);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    setSaving(true);
    setModalError('');

    try {
      const selectedCat = newCategory || (categories.length > 0 ? categories[0].nombre : 'General');
      const skuText = newSku.trim() ? `SKU: ${newSku.trim()}` : '';

      await api.productos.create({
        nombre: newName.trim(),
        descripcion: skuText,
        categoria: selectedCat,
        proveedor: newSupplier.trim(),
        costo: parseFloat(newCost) || 0,
        precio: parseFloat(newPrice) || 0,
        cantidad: parseFloat(newStock) || 0,
        unidad: 'Unidad'
      });

      const prodName = newName.trim();
      setShowAddModal(false);
      setNewName('');
      setNewSku('');
      setNewCategory(categories.length > 0 ? categories[0].nombre : 'General');
      setNewSupplier('');
      setNewCost('');
      setNewPrice('');
      setNewStock('');
      showNotification(`Producto "${prodName}" registrado exitosamente.`);
      await fetchProducts();
    } catch (err) {
      setModalError(err.message || 'No se pudo guardar el producto en la base de datos.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (item) => {
    fetchCategories();
    fetchSuppliers();
    setEditingProduct(item);
    setEditName(item.nombre || '');
    
    // Extraer SKU si viene en la descripción con formato "SKU: 123..."
    const desc = item.descripcion || '';
    const skuMatch = desc.match(/SKU:\s*([^\s,]+)/i);
    setEditSku(skuMatch ? skuMatch[1] : (desc.startsWith('SKU:') ? desc.replace('SKU:', '').trim() : desc));
    
    setEditCategory(item.categoria || (categories.length > 0 ? categories[0].nombre : 'General'));
    setEditSupplier(item.proveedor || '');
    setEditCost(String(item.costo || ''));
    setEditPrice(String(item.precio || ''));
    setEditStock(String(item.cantidad || ''));
    setModalError('');
  };

  const handleSaveEditProduct = async (e) => {
    e.preventDefault();
    if (!editName || !editPrice) return;
    setSaving(true);
    setModalError('');

    try {
      const targetUuid = editingProduct.uuid || editingProduct.id;
      const skuText = editSku.trim() ? `SKU: ${editSku.trim()}` : '';
      const selectedCat = editCategory || (categories.length > 0 ? categories[0].nombre : 'General');

      const updatePayload = {
        nombre: editName.trim(),
        descripcion: skuText,
        categoria: selectedCat,
        proveedor: editSupplier.trim(),
        costo: parseFloat(editCost) || 0,
        precio: parseFloat(editPrice) || 0,
        cantidad: parseFloat(editStock) || 0,
        unidad: 'Unidad'
      };

      await api.productos.update(targetUuid, updatePayload);

      setProducts(prev => prev.map(p => {
        if ((p.uuid || p.id) === targetUuid) {
          return { ...p, ...updatePayload };
        }
        return p;
      }));

      setEditingProduct(null);
      showNotification(`Producto "${editName.trim()}" actualizado correctamente.`);
      await fetchProducts();
    } catch (err) {
      setModalError(err.message || 'Error al actualizar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (uuid, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    try {
      await api.productos.delete(uuid);
      setProducts(products.filter(p => p.uuid !== uuid));
      showNotification(`Producto "${name}" eliminado correctamente.`);
    } catch (err) {
      showNotification(err.message || 'Error al eliminar producto.', 'error');
    }
  };

  const getCategoryBadge = (cat) => {
    if (!cat) return 'bg-slate-100 text-slate-700 border-slate-200';
    const c = cat.toLowerCase();
    if (c.includes('abarrote')) return 'bg-blue-50 text-blue-800 border-blue-200';
    if (c.includes('bebida')) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (c.includes('limpieza')) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (c.includes('charcut')) return 'bg-purple-50 text-purple-800 border-purple-200';
    if (c.includes('dulce') || c.includes('golosina')) return 'bg-rose-50 text-rose-800 border-rose-200';
    return 'bg-indigo-50 text-indigo-800 border-indigo-200';
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
            Artículos guardados en tu base de datos central. (Tasa Oficial BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
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
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              placeholder="Buscar por nombre o código... (Presione Enter)"
              className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
            />
          </div>

          {/* Botón de escanear código en la barra de búsqueda */}
          <button
            type="button"
            onClick={() => setScannerTarget('search')}
            className="p-2.5 bg-white border border-slate-300/80 hover:border-blue-500 text-slate-700 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all shadow-2xs flex items-center gap-1.5 shrink-0"
            title="Escanear código de barras para buscar producto"
          >
            <Camera className="w-4 h-4 text-blue-600" />
            <span className="hidden sm:inline text-xs font-bold">Escanear</span>
          </button>
        </div>

        {/* Filtro dinámico con las categorías del usuario en BD */}
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
              <option disabled value="">Sin categorías creadas</option>
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
            <p className="text-slate-400">Haz clic en "Nuevo Producto" para añadir tus artículos al catálogo.</p>
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
                  const itemUuid = item.uuid || item.id;

                  return (
                    <tr key={itemUuid} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{item.nombre}</span>
                        {item.descripcion && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {item.descripcion}
                          </span>
                        )}
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
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(itemUuid, item.nombre)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full relative shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Agregar Producto al Catálogo</h3>
                  <p className="text-[11px] text-slate-500">Se guardará en la base de datos central de tu cuenta</p>
                </div>
              </div>

              <button 
                onClick={() => setShowAddModal(false)}
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
                  <p className="font-bold text-[11px] text-rose-900">No se pudo guardar</p>
                  <p className="text-[11px] leading-tight text-rose-700">{modalError}</p>
                </div>
              </div>
            )}

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

              {/* Código de barras con botón de escanear destacado */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-blue-600" />
                    <span>Código de Barras / SKU:</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Lector USB o Cámara</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Ej. 7591234567890 o escanea aquí"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-8 py-2 text-slate-900 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    {newSku && (
                      <button
                        type="button"
                        onClick={() => setNewSku('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                        title="Borrar código"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannerTarget('newSku')}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all shrink-0 cursor-pointer text-xs"
                    title="Escanear con la cámara del dispositivo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Escanear</span>
                  </button>
                </div>
              </div>

              {/* Categoría desde la BD del usuario */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Categoría:</span>
                </label>
                <select
                  required
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs cursor-pointer"
                >
                  <option value="" disabled>-- Selecciona una categoría --</option>
                  {categories.length === 0 ? (
                    <option value="General">General (Sin categorías creadas en tu BD)</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.uuid || c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))
                  )}
                </select>
                {categories.length === 0 && (
                  <p className="text-[10px] text-amber-600 mt-1 font-medium">
                    Tip: Ve al módulo de Categorías para crear tus propias categorías en la base de datos.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proveedor / Distribuidor:</label>
                <input
                  type="text"
                  list="product-suppliers-datalist"
                  placeholder="Ej. Distribuidora Santa Elena C.A., Polar..."
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <datalist id="product-suppliers-datalist">
                  {availableSuppliers.map((s) => (
                    <option key={s.uuid || s.id} value={s.nombre || s.name} />
                  ))}
                </datalist>
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

      {/* Modal Editar Producto */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full relative shadow-2xl text-xs space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Editar Producto</h3>
                  <p className="text-[11px] text-slate-500">Se actualizará en MySQL y en el punto de venta</p>
                </div>
              </div>

              <button 
                onClick={() => setEditingProduct(null)}
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
                  <p className="font-bold text-[11px] text-rose-900">No se pudo actualizar</p>
                  <p className="text-[11px] leading-tight text-rose-700">{modalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nombre del Producto:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Código de barras con botón de escanear destacado */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <Barcode className="w-4 h-4 text-blue-600" />
                    <span>Código de Barras / SKU:</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">Lector USB o Cámara</span>
                </div>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Ej. 7591234567890 o escanea aquí"
                      value={editSku}
                      onChange={(e) => setEditSku(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-3.5 pr-8 py-2 text-slate-900 font-mono text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                    {editSku && (
                      <button
                        type="button"
                        onClick={() => setEditSku('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                        title="Borrar código"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannerTarget('editSku')}
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 transition-all shrink-0 cursor-pointer text-xs"
                    title="Escanear con la cámara del dispositivo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Escanear</span>
                  </button>
                </div>
              </div>

              {/* Categoría desde la BD del usuario */}
              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-indigo-600" />
                  <span>Categoría:</span>
                </label>
                <select
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs cursor-pointer"
                >
                  <option value="" disabled>-- Selecciona una categoría --</option>
                  {categories.length === 0 ? (
                    <option value="General">General (Sin categorías creadas en tu BD)</option>
                  ) : (
                    categories.map((c) => (
                      <option key={c.uuid || c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Proveedor / Distribuidor:</label>
                <input
                  type="text"
                  list="product-suppliers-datalist-edit"
                  placeholder="Ej. Distribuidora Santa Elena C.A., Polar..."
                  value={editSupplier}
                  onChange={(e) => setEditSupplier(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <datalist id="product-suppliers-datalist-edit">
                  {availableSuppliers.map((s) => (
                    <option key={s.uuid || s.id} value={s.nombre || s.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Costo ($ USD):</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1.00"
                    value={editCost}
                    onChange={(e) => setEditCost(e.target.value)}
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
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Stock Actual:</label>
                  <input
                    type="number"
                    placeholder="20"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
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
                  <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Escáner de Código de Barras con la Cámara */}
      <BarcodeScannerModal
        isOpen={scannerTarget !== null}
        onClose={() => setScannerTarget(null)}
        onScan={handleBarcodeDetected}
        title={
          scannerTarget === 'search'
            ? 'Escanear para Buscar Producto'
            : 'Escanear Código de Barras del Producto'
        }
      />

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
