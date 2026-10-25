import React from 'react';
import BcvExchangeWidget from './BcvExchangeWidget';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  CreditCard, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus, 
  Printer, 
  ChevronRight,
  BookOpen,
  Package,
  Sparkles
} from 'lucide-react';

export default function OverviewModule({ onNavigate, bcvRate = 884.75 }) {
  const userStats = [
    {
      title: 'Ventas de hoy',
      usd: '$1,248.50',
      ves: `Bs. ${(1248.50 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      change: '+14.2%',
      positive: true,
      sub: '28 tickets cobrados en mostrador',
      icon: ShoppingCart,
      color: 'emerald',
      gradient: 'from-emerald-500/10 via-white to-white',
      border: 'border-emerald-200/90',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/20',
      badgeColor: 'text-emerald-800 bg-emerald-100/90 border-emerald-300/60',
      action: () => onNavigate('ventas'),
    },
    {
      title: 'Utilidad neta estimada',
      usd: '$418.00',
      ves: `Bs. ${(418.00 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      change: '+8.5%',
      positive: true,
      sub: 'Margen promedio limpio: 33.4%',
      icon: TrendingUp,
      color: 'blue',
      gradient: 'from-blue-500/10 via-white to-white',
      border: 'border-blue-200/90',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
      badgeColor: 'text-blue-800 bg-blue-100/90 border-blue-300/60',
      action: () => onNavigate('reportes'),
    },
    {
      title: 'Cuentas por cobrar (Fiado)',
      usd: '$513.50',
      ves: `Bs. ${(513.50 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      change: '4 clientes',
      positive: false,
      sub: '2 clientes con vencimiento esta semana',
      icon: BookOpen,
      color: 'amber',
      gradient: 'from-amber-500/10 via-white to-white',
      border: 'border-amber-200/90',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
      badgeColor: 'text-amber-900 bg-amber-100/90 border-amber-300/60',
      action: () => onNavigate('clientes'),
    },
    {
      title: 'Alertas de inventario',
      usd: '6 productos',
      ves: 'Bajo el mínimo',
      change: 'Crítico',
      positive: false,
      sub: 'Reponer hoy al ir al mayorista',
      icon: AlertTriangle,
      color: 'rose',
      gradient: 'from-rose-500/10 via-white to-white',
      border: 'border-rose-200/90',
      iconBg: 'bg-rose-500 text-white shadow-rose-500/20',
      badgeColor: 'text-rose-800 bg-rose-100/90 border-rose-300/60',
      action: () => onNavigate('inventario'),
    },
  ];

  const recentSales = [
    { 
      id: 'FAC-0089', 
      client: 'Carlos Silva', 
      items: '4 productos (Harina, Café...)', 
      totalUsd: 42.50, 
      method: 'Pago Móvil (BCV)', 
      methodType: 'pago-movil',
      time: 'Hace 4 min' 
    },
    { 
      id: 'FAC-0088', 
      client: 'Consumidor Final', 
      items: '2 productos', 
      totalUsd: 14.00, 
      method: 'Efectivo USD', 
      methodType: 'usd',
      time: 'Hace 18 min' 
    },
    { 
      id: 'FAC-0087', 
      client: 'Panadería La Espiga', 
      items: '12 productos (Bultos)', 
      totalUsd: 185.00, 
      method: 'USDT Binance', 
      methodType: 'usdt',
      time: 'Hace 35 min' 
    },
    { 
      id: 'FAC-0086', 
      client: 'Marta Rivas (Libreta)', 
      items: '6 productos (Fiado)', 
      totalUsd: 38.00, 
      method: 'Fiado a 7 días', 
      methodType: 'fiado',
      time: 'Hace 1 hora' 
    },
  ];

  const getMethodBadge = (type) => {
    switch (type) {
      case 'pago-movil':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'usd':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'usdt':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'fiado':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Real-time BCV, Euro and USDT Rates Widget */}
      <BcvExchangeWidget />

      {/* 2. User Stats & Business KPIs (Lively & Colorful Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              onClick={stat.action}
              className={`group relative overflow-hidden bg-gradient-to-br ${stat.gradient} p-5 rounded-3xl border ${stat.border} shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between cursor-pointer`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${stat.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${stat.badgeColor}`}>
                    {stat.change}
                  </span>
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {stat.title}
                </div>

                <div className="text-2xl font-extrabold tracking-tight text-slate-900 font-mono mt-1">
                  {stat.usd}
                </div>
                
                <div className="text-xs font-bold text-slate-500 font-mono mt-0.5">
                  {stat.ves}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{stat.sub}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Operational Grid: Recent Sales & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Sales Column */}
        <div className="lg:col-span-8 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Últimas Ventas Procesadas
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Movimientos en caja registrados hoy</p>
            </div>
            
            <button
              onClick={() => onNavigate('ventas')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentSales.map((sale) => (
              <div 
                key={sale.id} 
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-2xl transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {sale.id}
                    </span>
                    <span className="font-bold text-slate-900 text-xs">{sale.client}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{sale.items}</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold border text-[10px] ${getMethodBadge(sale.methodType)}`}>
                      {sale.method}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono">{sale.time}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-extrabold text-slate-900 text-sm">
                    ${sale.totalUsd.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    Bs. {(sale.totalUsd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 1 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-medium">Total tickets emitidos hoy: <strong>28 cobros</strong></span>
            
            <button
              onClick={() => onNavigate('ventas')}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Venta Express</span>
            </button>
          </div>
        </div>

        {/* Shortcuts & Quick Actions Column */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Accesos Directos
              </h3>
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </div>
            
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              
              {/* Ventas */}
              <button
                onClick={() => onNavigate('ventas')}
                className="group p-3 rounded-2xl border border-slate-200/80 hover:border-emerald-400 text-left transition-all bg-gradient-to-br from-emerald-50/40 to-white hover:shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <ShoppingCart className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-slate-900">Ventas & POS</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Cobro multimoneda</div>
              </button>

              {/* Productos */}
              <button
                onClick={() => onNavigate('productos')}
                className="group p-3 rounded-2xl border border-slate-200/80 hover:border-blue-400 text-left transition-all bg-gradient-to-br from-blue-50/40 to-white hover:shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-slate-900">Productos</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Precios y catálogo</div>
              </button>

              {/* Clientes & Fiado */}
              <button
                onClick={() => onNavigate('clientes')}
                className="group p-3 rounded-2xl border border-slate-200/80 hover:border-amber-400 text-left transition-all bg-gradient-to-br from-amber-50/40 to-white hover:shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-slate-900">Clientes</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Directorio & Libreta</div>
              </button>

              {/* Inventario */}
              <button
                onClick={() => onNavigate('inventario')}
                className="group p-3 rounded-2xl border border-slate-200/80 hover:border-purple-400 text-left transition-all bg-gradient-to-br from-purple-50/40 to-white hover:shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <div className="font-bold text-slate-900">Inventario</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Alertas de quiebre</div>
              </button>

            </div>
          </div>

          {/* Resumen Operativo de Fondos en Caja */}
          <div className="bg-white/95 backdrop-blur-xs p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Fondos en Caja (Turno Actual)
                </h3>
                <p className="text-[11px] text-slate-500">Desglose de cobros de hoy</p>
              </div>
              <button
                onClick={() => onNavigate('reportes')}
                className="text-[11px] font-bold text-blue-600 hover:underline"
              >
                Ver arqueo
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Efectivo Divisas ($):</span>
                <span className="font-mono font-bold text-slate-900">$380.00 USD</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Pago Móvil (Bs):</span>
                <span className="font-mono font-bold text-emerald-800">Bs. {(540 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Punto Débito (Bs):</span>
                <span className="font-mono font-bold text-blue-800">Bs. {(215.5 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Estado: Caja abierta</span>
              <button
                onClick={() => onNavigate('reportes')}
                className="font-semibold text-slate-800 hover:text-slate-950 underline"
              >
                Cerrar turno
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
