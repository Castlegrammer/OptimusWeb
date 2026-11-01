import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Calculator,
  Receipt, 
  X, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Trash2,
  Package,
  Tag,
  Boxes,
  User
} from 'lucide-react';
import api from '../../services/api';

export default function VentasModule({ bcvRate = 884.75, onOpenCalculator }) {
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modal de Venta
  const [showNewSaleModal, setShowNewSaleModal] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Datos para la venta
  const [newClient, setNewClient] = useState('Consumidor Final');
  const [availableClients, setAvailableClients] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Producto actualmente seleccionado para agregar
  const [selectedProductUuid, setSelectedProductUuid] = useState('');
  const [selectedProductCustom, setSelectedProductCustom] = useState('');
  const [itemQuantity, setItemQuantity] = useState('1');
  const [itemPrice, setItemPrice] = useState('');

  // Lista de items agregados al ticket de venta
  const [saleItems, setSaleItems] = useState([]);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await api.ventas.getAll();
      setSalesList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar ventas:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClients = async () => {
    try {
      const cls = await api.clientes.getAll();
      setAvailableClients(Array.isArray(cls) ? cls : []);
    } catch (e) {}
  };

  const fetchAvailableProducts = async () => {
    try {
      const prods = await api.productos.getAll();
      setAvailableProducts(Array.isArray(prods) ? prods : []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchSales();
    fetchAvailableClients();
    fetchAvailableProducts();
  }, []);

  const handleOpenNewSaleModal = () => {
    setModalError('');
    setSaleItems([]);
    setSelectedProductUuid('');
    setSelectedProductCustom('');
    setItemQuantity('1');
    setItemPrice('');
    if (!newClient) setNewClient('Consumidor Final');
    fetchAvailableProducts();
    fetchAvailableClients();
    setShowNewSaleModal(true);
  };

  // Al seleccionar un producto en el select
  const handleSelectProduct = (prodIdOrUuid) => {
    setSelectedProductUuid(prodIdOrUuid);
    setModalError('');

    if (!prodIdOrUuid) {
      setItemPrice('');
      return;
    }

    if (prodIdOrUuid === 'manual') {
      setItemPrice('');
      setItemQuantity('1');
      return;
    }

    const prod = availableProducts.find(p => String(p.uuid || p.id) === String(prodIdOrUuid));
    if (prod) {
      setItemPrice(String(prod.precio || ''));
      if (!itemQuantity || parseFloat(itemQuantity) <= 0) {
        setItemQuantity('1');
      }
    }
  };

  // Obtener producto seleccionado actual
  const currentSelectedProd = availableProducts.find(
    p => String(p.uuid || p.id) === String(selectedProductUuid)
  );

  // Agregar producto actual al ticket
  const handleAddItemToTicket = () => {
    if (!selectedProductUuid) {
      setModalError('Por favor selecciona un producto de la lista.');
      return;
    }

    const qty = parseFloat(itemQuantity);
    if (!qty || qty <= 0) {
      setModalError('La cantidad a vender debe ser mayor a 0.');
      return;
    }

    const price = parseFloat(itemPrice);
    if (isNaN(price) || price < 0) {
      setModalError('Por favor ingresa un precio unitario válido.');
      return;
    }

    let prodName = '';
    let prodUuid = null;
    let prodId = null;
    let currentStock = null;

    if (selectedProductUuid === 'manual') {
      if (!selectedProductCustom.trim()) {
        setModalError('Por favor escribe el nombre o concepto del producto manual.');
        return;
      }
      prodName = selectedProductCustom.trim();
    } else {
      if (!currentSelectedProd) return;
      prodName = currentSelectedProd.nombre;
      prodUuid = currentSelectedProd.uuid || null;
      prodId = currentSelectedProd.id || null;
      currentStock = Number(currentSelectedProd.cantidad) || 0;
    }

    // Verificar si ya está en el ticket para sumar cantidad
    const existingIndex = saleItems.findIndex(
      item => (item.producto_uuid && item.producto_uuid === prodUuid) || (item.producto_id && item.producto_id === prodId)
    );

    if (existingIndex >= 0 && selectedProductUuid !== 'manual') {
      const updated = [...saleItems];
      const newQty = updated[existingIndex].cantidad + qty;
      updated[existingIndex].cantidad = newQty;
      updated[existingIndex].total = newQty * updated[existingIndex].precio;
      setSaleItems(updated);
    } else {
      const newItem = {
        id: Date.now() + Math.random(),
        producto_uuid: prodUuid,
        producto_id: prodId,
        producto: prodName,
        cantidad: qty,
        precio: price,
        total: qty * price,
        stock_actual: currentStock
      };
      setSaleItems(prev => [...prev, newItem]);
    }

    // Limpiar selector para agregar más productos
    setSelectedProductUuid('');
    setSelectedProductCustom('');
    setItemQuantity('1');
    setItemPrice('');
    setModalError('');
  };

  const handleRemoveItem = (itemId) => {
    setSaleItems(prev => prev.filter(i => i.id !== itemId));
  };

  // Calcular total de la venta actual
  const calculateTotal = () => {
    let sum = saleItems.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

    // Si aún no agregó al ticket pero hay un producto seleccionado con cantidad y precio válidos:
    if (selectedProductUuid && itemPrice && itemQuantity) {
      const pendingQty = parseFloat(itemQuantity) || 0;
      const pendingPrice = parseFloat(itemPrice) || 0;
      if (pendingQty > 0 && pendingPrice >= 0) {
        sum += (pendingQty * pendingPrice);
      }
    }
    return sum;
  };

  const currentTotalUsd = calculateTotal();

  // Guardar la venta en la base de datos MySQL y descontar stock
  const handleCreateSale = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');

    try {
      let finalItems = [...saleItems];

      // Si el usuario seleccionó un producto pero no presionó "Agregar al Ticket", lo agregamos automáticamente
      if (selectedProductUuid) {
        const qty = parseFloat(itemQuantity) || 0;
        const price = parseFloat(itemPrice) || 0;
        
        if (qty > 0 && price >= 0) {
          let pName = 'Venta Mostrador';
          let pUuid = null;
          let pId = null;

          if (selectedProductUuid === 'manual') {
            pName = selectedProductCustom.trim() || 'Concepto manual';
          } else if (currentSelectedProd) {
            pName = currentSelectedProd.nombre;
            pUuid = currentSelectedProd.uuid || null;
            pId = currentSelectedProd.id || null;
          }

          finalItems.push({
            id: Date.now(),
            producto_uuid: pUuid,
            producto_id: pId,
            producto: pName,
            cantidad: qty,
            precio: price,
            total: qty * price
          });
        }
      }

      if (finalItems.length === 0) {
        setModalError('Debes seleccionar al menos un producto e indicar su cantidad para registrar la venta.');
        setSaving(false);
        return;
      }

      const totalSale = finalItems.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

      await api.ventas.create({
        cliente: newClient.trim() || 'Consumidor Final',
        total: totalSale,
        inicial: totalSale,
        detalles: finalItems.map(item => ({
          producto_uuid: item.producto_uuid || null,
          producto_id: item.producto_id || null,
          producto: item.producto,
          cantidad: item.cantidad,
          precio: item.precio,
          total: item.total
        }))
      });

      // Descontar inventario de forma inmediata y directa en los productos de la BD
      for (const item of finalItems) {
        if (item.cantidad > 0) {
          const matchProd = availableProducts.find(p => 
            (item.producto_uuid && p.uuid === item.producto_uuid) ||
            (item.producto_id && p.id === item.producto_id) ||
            (p.nombre && p.nombre.toLowerCase() === item.producto.toLowerCase())
          );
          if (matchProd) {
            const currentStock = Number(matchProd.cantidad) || 0;
            const newStock = Math.max(0, currentStock - item.cantidad);
            try {
              const targetId = matchProd.uuid || matchProd.id;
              await api.productos.update(targetId, { cantidad: newStock });
            } catch (eStockUp) {
              console.warn('Actualización complementaria de stock:', eStockUp.message);
            }
          }
        }
      }

      setShowNewSaleModal(false);
      setNewClient('Consumidor Final');
      setSaleItems([]);
      setSelectedProductUuid('');
      setSelectedProductCustom('');
      setItemQuantity('1');
      setItemPrice('');
      showNotification(`Venta de $${totalSale.toFixed(2)} registrada con éxito e inventario descontado.`);
      
      // Recargar ventas y productos para ver el stock actualizado
      await fetchSales();
      await fetchAvailableProducts();
    } catch (err) {
      setModalError(err.message || 'No se pudo registrar la venta en la base de datos.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = salesList.filter(s => {
    const cli = s.cliente || '';
    const idStr = String(s.id || s.uuid || '');
    return cli.toLowerCase().includes(search.toLowerCase()) || idStr.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Ventas & Facturación (Caja POS)</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro transaccional en tiempo real con MySQL y descuento automático de stock (BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenCalculator && (
            <button
              type="button"
              onClick={onOpenCalculator}
              className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border border-emerald-300/80 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Calcular vuelto a diferentes tasas"
            >
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Calculadora de Vuelto</span>
            </button>
          )}

          <button
            onClick={() => {
              fetchSales();
              fetchAvailableProducts();
            }}
            disabled={loading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
            title="Recargar ventas e inventario"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenNewSaleModal}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Venta</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o número de ticket..."
          className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Consultando ventas en la base de datos...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <Receipt className="w-8 h-8 text-slate-300" />
            <p className="font-bold text-slate-700 text-sm">No hay ventas registradas aún</p>
            <p className="text-slate-400">Registra una venta desde la Web o sincroniza las ventas realizadas en tu app móvil.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Ticket / Ref</th>
                  <th className="py-3.5 px-4">Fecha</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Monto USD</th>
                  <th className="py-3.5 px-4">Equivalente BCV</th>
                  <th className="py-3.5 px-5 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s) => {
                  const total = Number(s.total) || 0;
                  const totalBs = (total * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                  return (
                    <tr key={s.uuid || s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-bold text-blue-600">
                        #{s.id ? String(s.id).padStart(4, '0') : (s.uuid ? s.uuid.substring(0, 8) : 'VENTA')}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{s.fecha || 'Reciente'}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.cliente || 'Consumidor Final'}</td>
                      <td className="py-3.5 px-4 font-mono font-extrabold text-slate-950 text-sm">${total.toFixed(2)}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">Bs. {totalBs}</td>
                      <td className="py-3.5 px-5 text-right">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 font-mono">
                          Registrado
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Registrar Venta con Select de Productos e Inventario */}
      {showNewSaleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 max-w-lg w-full relative shadow-2xl text-xs space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Registrar Venta</h3>
                  <p className="text-[11px] text-slate-500">Selecciona los productos y descuenta stock en vivo</p>
                </div>
              </div>

              <button 
                onClick={() => setShowNewSaleModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error banner en el modal */}
            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-[11px] text-rose-900">No se pudo registrar la venta</p>
                  <p className="text-[11px] leading-tight text-rose-700">{modalError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateSale} className="space-y-4">
              
              {/* Cliente (Select dinámico desde la Base de Datos) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Cliente (de tu Base de Datos):</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {availableClients.length} clientes en tu BD
                  </span>
                </div>
                <select
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs cursor-pointer"
                >
                  <option value="Consumidor Final">Consumidor Final (Venta Mostrador)</option>
                  {availableClients.map((c) => {
                    const cName = c.nombre || c.name;
                    const cTel = c.telefono ? ` • Tel: ${c.telefono}` : '';
                    const cZona = c.zona ? ` (${c.zona})` : '';
                    return (
                      <option key={c.uuid || c.id} value={cName}>
                        {cName}{cTel}{cZona}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selector de Producto desde la Base de Datos */}
              <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-900 font-bold flex items-center gap-1.5 text-xs">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <span>Seleccionar Producto a Vender:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {availableProducts.length} productos en BD
                  </span>
                </div>

                {/* Select de Productos de BD */}
                <select
                  value={selectedProductUuid}
                  onChange={(e) => handleSelectProduct(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs cursor-pointer"
                >
                  <option value="">-- Elige un producto del inventario --</option>
                  {availableProducts.map((p) => {
                    const price = Number(p.precio || 0).toFixed(2);
                    const stock = Number(p.cantidad || 0);
                    return (
                      <option key={p.uuid || p.id} value={p.uuid || p.id}>
                        {p.nombre} — ${price} (Stock: {stock} uds)
                      </option>
                    );
                  })}
                  <option value="manual">📝 Otro / Concepto manual</option>
                </select>

                {/* Si seleccionó concepto manual */}
                {selectedProductUuid === 'manual' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Concepto o Descripción:
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Servicio de delivery, Producto especial..."
                      value={selectedProductCustom}
                      onChange={(e) => setSelectedProductCustom(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                )}

                {/* Fila con Cantidad, Precio Unitario y Subtotal */}
                {selectedProductUuid && (
                  <div className="space-y-2 pt-1 border-t border-slate-200/60">
                    
                    {/* Alerta de Stock Disponible */}
                    {currentSelectedProd && (
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5 font-medium text-slate-600">
                          <Boxes className="w-3.5 h-3.5 text-slate-400" />
                          <span>Existencia en Inventario:</span>
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg font-mono font-bold ${
                          Number(currentSelectedProd.cantidad) <= 0
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : (parseFloat(itemQuantity) > Number(currentSelectedProd.cantidad))
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {Number(currentSelectedProd.cantidad)} uds disponibles
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Cantidad a Vender:
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseFloat(itemQuantity) || 1;
                              if (curr > 1) setItemQuantity(String(curr - 1));
                            }}
                            className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            step="any"
                            min="0.01"
                            required
                            value={itemQuantity}
                            onChange={(e) => setItemQuantity(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-center font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const curr = parseFloat(itemQuantity) || 0;
                              setItemQuantity(String(curr + 1));
                            }}
                            className="px-2 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold text-slate-700"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Precio Unitario ($):
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={itemPrice}
                          onChange={(e) => setItemPrice(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                        <button
                          type="button"
                          onClick={handleAddItemToTicket}
                          className="w-full py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                          title="Añadir este producto a la lista de venta"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Agregar al Ticket</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de Items Agregados al Ticket */}
              {saleItems.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                    <span>Productos en el Ticket ({saleItems.length}):</span>
                    <button
                      type="button"
                      onClick={() => setSaleItems([])}
                      className="text-rose-600 hover:underline text-[10px]"
                    >
                      Vaciar ticket
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-36 overflow-y-auto bg-white">
                    {saleItems.map((item) => (
                      <div key={item.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate text-xs">{item.producto}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {item.cantidad} uds × ${Number(item.precio).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-slate-900 text-xs">
                            ${Number(item.total).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar del ticket"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Banner de Total Calculado */}
              <div className="p-3.5 bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 rounded-2xl border border-emerald-300/80 shadow-2xs space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-950">Total Venta (USD):</span>
                  <span className="font-mono font-extrabold text-base text-emerald-950">
                    ${currentTotalUsd.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200/60">
                  <span className="text-emerald-800 font-semibold">Total en Bolívares (BCV):</span>
                  <strong className="font-mono font-extrabold text-emerald-950">
                    Bs. {(currentTotalUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewSaleModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || currentTotalUsd <= 0}
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Guardando...' : `Confirmar Venta ($${currentTotalUsd.toFixed(2)})`}</span>
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
