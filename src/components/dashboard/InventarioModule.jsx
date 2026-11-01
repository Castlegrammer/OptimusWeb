import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  Search, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  AlertCircle, 
  X,
  FileText,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShoppingCart,
  ShoppingBag,
  Filter,
  Plus
} from 'lucide-react';
import api from '../../services/api';

export default function InventarioModule({ bcvRate = 884.75 }) {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'kardex'
  
  // Estados para Existencias
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  // Estados para Kardex
  const [kardexMovements, setKardexMovements] = useState([]);
  const [kardexLoading, setKardexLoading] = useState(false);
  const [kardexFilter, setKardexFilter] = useState('todos'); // 'todos' | 'ventas' | 'compras'
  const [kardexSearch, setKardexSearch] = useState('');

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStock = async () => {
    setLoading(true);
    try {
      const data = await api.productos.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar inventario de MySQL:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar movimientos para el Kardex
  const fetchKardexData = async () => {
    setKardexLoading(true);
    try {
      const [ventasRes, comprasRes] = await Promise.allSettled([
        api.ventas.getAll(1, 300),
        api.compras.getAll()
      ]);

      const sales = (ventasRes.status === 'fulfilled' && Array.isArray(ventasRes.value)) ? ventasRes.value : [];
      const purchases = (comprasRes.status === 'fulfilled' && Array.isArray(comprasRes.value)) ? comprasRes.value : [];

      const movements = [];

      // Mapear ventas (Salida de mercancía + Ingreso monetario)
      for (const v of sales) {
        const totalUsd = Number(v.total) || 0;
        movements.push({
          id: `v-${v.uuid || v.id}`,
          tipo: 'VENTA',
          subtipo: 'Salida de Inventario / Ingreso en Caja',
          fecha: v.fecha || v.created_at || 'Reciente',
          timestamp: new Date(v.fecha || v.created_at || Date.now()).getTime(),
          comprobante: v.id ? `#V-${String(v.id).padStart(4, '0')}` : `#V-${String(v.uuid || '').substring(0, 6)}`,
          tercero: v.cliente || 'Consumidor Final',
          rolTercero: 'Cliente',
          montoUsd: totalUsd,
          montoBs: totalUsd * bcvRate,
          signo: '+',
          badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          impacto: 'Salida de Stock'
        });
      }

      // Mapear compras (Entrada de mercancía + Egreso monetario)
      for (const c of purchases) {
        const totalUsd = Number(c.total ?? c.Total ?? c.monto ?? 0);
        movements.push({
          id: `c-${c.uuid || c.id}`,
          tipo: 'COMPRA',
          subtipo: 'Entrada de Inventario / Egreso de Caja',
          fecha: c.fecha || c.created_at || 'Reciente',
          timestamp: new Date(c.fecha || c.created_at || Date.now()).getTime(),
          comprobante: c.id ? `#C-${String(c.id).padStart(4, '0')}` : `#C-${String(c.uuid || '').substring(0, 6)}`,
          tercero: c.proveedor || c.Proveedor || 'Proveedor General',
          rolTercero: 'Proveedor',
          montoUsd: totalUsd,
          montoBs: totalUsd * bcvRate,
          signo: '-',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          impacto: 'Entrada de Stock'
        });
      }

      // Ordenar por fecha cronológica descendente (más recientes primero)
      movements.sort((a, b) => b.timestamp - a.timestamp);
      setKardexMovements(movements);
    } catch (e) {
      console.error('Error cargando kardex:', e);
    } finally {
      setKardexLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    fetchKardexData();
  }, []);

  const handleAddStock = async (prod, amount) => {
    const current = Number(prod.cantidad) || 0;
    const next = current + amount;
    setUpdatingId(prod.uuid || prod.id);

    try {
      if (prod.uuid || prod.id) {
        await api.productos.update(prod.uuid || prod.id, { cantidad: next });
      }
      setProducts(prev => prev.map(p => {
        if ((p.uuid || p.id) === (prod.uuid || prod.id)) {
          return { ...p, cantidad: next };
        }
        return p;
      }));
      showNotification(`Stock de "${prod.nombre}" actualizado a ${next} unidades.`);
      fetchKardexData();
    } catch (err) {
      showNotification(err.message || 'Error al actualizar el stock.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(s => {
    const name = s.nombre || '';
    const desc = s.descripcion || '';
    const cat = s.categoria || '';
    const term = search.toLowerCase();
    return name.toLowerCase().includes(term) || desc.toLowerCase().includes(term) || cat.toLowerCase().includes(term);
  });

  const lowStockCount = products.filter(s => {
    const stock = Number(s.cantidad) || 0;
    const min = Number(s.minimo) || 5;
    return stock <= min * 1.5;
  }).length;

  // Filtrado de Kardex
  const filteredKardex = kardexMovements.filter(m => {
    if (kardexFilter === 'ventas' && m.tipo !== 'VENTA') return false;
    if (kardexFilter === 'compras' && m.tipo !== 'COMPRA') return false;
    if (kardexSearch) {
      const term = kardexSearch.toLowerCase();
      return (
        m.tercero.toLowerCase().includes(term) ||
        m.comprobante.toLowerCase().includes(term) ||
        m.fecha.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Métricas del Kardex
  const totalVentasUsd = kardexMovements.filter(m => m.tipo === 'VENTA').reduce((a, b) => a + b.montoUsd, 0);
  const totalComprasUsd = kardexMovements.filter(m => m.tipo === 'COMPRA').reduce((a, b) => a + b.montoUsd, 0);
  const balanceNetoUsd = totalVentasUsd - totalComprasUsd;

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Control de Inventario & Kardex</h2>
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" title="Conectado a MySQL" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitoreo en tiempo real de existencias, flujo de mercancía, ventas e ingresos (BCV: <strong>Bs. {bcvRate.toFixed(2)}</strong>)
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              fetchStock();
              fetchKardexData();
            }}
            disabled={loading || kardexLoading}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
            title="Recargar inventario y kardex desde MySQL"
          >
            <RefreshCw className={`w-4 h-4 ${(loading || kardexLoading) ? 'animate-spin' : ''}`} />
          </button>

          <span className="text-xs font-bold px-3 py-2 rounded-2xl bg-amber-50 text-amber-900 border border-amber-200/80 flex items-center gap-1.5 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{lowStockCount} artículos por agotarse</span>
          </span>
        </div>
      </div>

      {/* Tabs Selector: Existencias vs Kardex */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'stock'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Existencias de Productos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === 'stock' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {products.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('kardex');
            fetchKardexData();
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'kardex'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Kardex de Movimientos (Ventas e Ingresos)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold font-mono">
            En vivo
          </span>
        </button>
      </div>

      {/* VISTA 1: EXISTENCIAS DE PRODUCTOS */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto en stock por nombre o categoría..."
              className="w-full bg-white border border-slate-300/80 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
            />
          </div>

          {/* Stock Table */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Consultando inventario en la base de datos...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <Boxes className="w-8 h-8 text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No hay productos registrados en el inventario</p>
                <p className="text-slate-400">Registra productos en el catálogo para monitorear sus existencias.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Producto</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Stock Actual</th>
                      <th className="py-3.5 px-4">Precio Venta</th>
                      <th className="py-3.5 px-4">Estado</th>
                      <th className="py-3.5 px-5 text-right">Ajuste / Reposición Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => {
                      const stock = Number(p.cantidad) || 0;
                      const min = Number(p.minimo) || 5;
                      const isCritical = stock <= 0;
                      const isLow = stock > 0 && stock <= min;
                      const isUpdating = updatingId === (p.uuid || p.id);

                      return (
                        <tr key={p.uuid || p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-slate-900 block">{p.nombre}</span>
                            {p.descripcion && (
                              <span className="text-[10px] text-slate-400 font-mono block truncate max-w-xs">
                                {p.descripcion}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-700 border-slate-200">
                              {p.categoria || 'General'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-extrabold ${
                              isCritical 
                                ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                : isLow 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {stock} uds
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            ${Number(p.precio || 0).toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4">
                            {isCritical ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Agotado</span>
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                <span>Stock Bajo</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Óptimo</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleAddStock(p, 5)}
                                    className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors cursor-pointer"
                                    title="Sumar 5 unidades al stock"
                                  >
                                    +5
                                  </button>
                                  <button
                                    onClick={() => handleAddStock(p, 10)}
                                    className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 rounded-lg transition-colors cursor-pointer"
                                    title="Sumar 10 unidades al stock"
                                  >
                                    +10
                                  </button>
                                  <button
                                    onClick={() => handleAddStock(p, 20)}
                                    className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
                                    title="Sumar 20 unidades al stock"
                                  >
                                    +20
                                  </button>
                                </>
                              )}
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
        </div>
      )}

      {/* VISTA 2: KARDEX DE MOVIMIENTOS (VENTAS E INGRESOS) */}
      {activeTab === 'kardex' && (
        <div className="space-y-4">
          
          {/* Métricas Principales del Kardex */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            
            {/* Card 1: Ingresos por Ventas */}
            <div className="p-4 bg-gradient-to-br from-emerald-50 via-white to-white rounded-3xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Total Ingresos (Ventas)
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                ${totalVentasUsd.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono font-bold text-emerald-800 mt-0.5">
                Bs. {(totalVentasUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Card 2: Egresos por Compras */}
            <div className="p-4 bg-gradient-to-br from-rose-50 via-white to-white rounded-3xl border border-rose-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  Total Compras (Mercancía)
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                ${totalComprasUsd.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono font-bold text-rose-800 mt-0.5">
                Bs. {(totalComprasUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Card 3: Balance Neto */}
            <div className={`p-4 bg-gradient-to-br from-white to-slate-50 rounded-3xl border shadow-xs ${
              balanceNetoUsd >= 0 ? 'border-emerald-200' : 'border-rose-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                  Balance Neto en Caja
                </span>
                <div className={`w-8 h-8 rounded-xl text-white flex items-center justify-center shadow-xs ${
                  balanceNetoUsd >= 0 ? 'bg-emerald-600' : 'bg-rose-600'
                }`}>
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-lg font-mono font-extrabold ${balanceNetoUsd >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {balanceNetoUsd >= 0 ? '+' : ''}${balanceNetoUsd.toFixed(2)}
              </div>
              <div className="text-[11px] font-mono font-bold text-slate-500 mt-0.5">
                Bs. {(balanceNetoUsd * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Card 4: Total de Registros */}
            <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-white rounded-3xl border border-blue-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  Movimientos Kardex
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900">
                {kardexMovements.length}
              </div>
              <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                Transacciones registradas en BD
              </div>
            </div>

          </div>

          {/* Filtros del Kardex */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            
            {/* Botones de filtro de tipo */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setKardexFilter('todos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  kardexFilter === 'todos'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({kardexMovements.length})
              </button>

              <button
                type="button"
                onClick={() => setKardexFilter('ventas')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  kardexFilter === 'ventas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Solo Ventas / Ingresos</span>
              </button>

              <button
                type="button"
                onClick={() => setKardexFilter('compras')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  kardexFilter === 'compras'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Solo Compras / Egresos</span>
              </button>
            </div>

            {/* Input de búsqueda del Kardex */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={kardexSearch}
                onChange={(e) => setKardexSearch(e.target.value)}
                placeholder="Buscar por cliente, proveedor o ticket..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Tabla de Movimientos Kardex */}
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
            {kardexLoading ? (
              <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400 text-xs">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Cargando movimientos del Kardex...</span>
              </div>
            ) : filteredKardex.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
                <FileText className="w-8 h-8 text-slate-300" />
                <p className="font-bold text-slate-700 text-sm">No se encontraron movimientos registrados</p>
                <p className="text-slate-400">Registra ventas o compras para que aparezcan en el historial del Kardex.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Fecha / Hora</th>
                      <th className="py-3.5 px-4">Operación</th>
                      <th className="py-3.5 px-4">Comprobante</th>
                      <th className="py-3.5 px-4">Cliente / Proveedor</th>
                      <th className="py-3.5 px-4">Impacto de Inventario</th>
                      <th className="py-3.5 px-4">Monto USD ($)</th>
                      <th className="py-3.5 px-5 text-right">Equivalente BCV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKardex.map((m) => {
                      const isVenta = m.tipo === 'VENTA';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-5 font-mono text-[11px] text-slate-500">
                            {m.fecha}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${m.badgeColor}`}>
                              {isVenta ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownLeft className="w-3.5 h-3.5" />}
                              <span>{m.tipo}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                            {m.comprobante}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-900 block">{m.tercero}</span>
                            <span className="text-[10px] text-slate-400">{m.rolTercero}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold ${
                              isVenta 
                                ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                                : 'bg-blue-50 text-blue-900 border border-blue-200'
                            }`}>
                              {m.impacto}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`font-mono font-extrabold text-sm ${
                              isVenta ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {m.signo}${m.montoUsd.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800">
                            Bs. {m.montoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
