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
  ChevronRight
} from 'lucide-react';

export default function OverviewModule({ onNavigate, bcvRate = 884.75 }) {
  const userStats = [
    {
      title: 'Ventas de hoy',
      usd: '$1,248.50',
      ves: `Bs. ${(1248.50 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      change: '+14.2%',
      positive: true,
      sub: '28 tickets cobrados',
    },
    {
      title: 'Utilidad neta estimada',
      usd: '$418.00',
      ves: `Bs. ${(418.00 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      change: '+8.5%',
      positive: true,
      sub: 'Margen promedio: 33.4%',
    },
    {
      title: 'Cuentas por cobrar (Fiado)',
      usd: '$513.50',
      ves: `Bs. ${(513.50 * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })}`,
      change: '4 clientes',
      positive: false,
      sub: '2 con vencimiento hoy',
      action: () => onNavigate('clientes'),
    },
    {
      title: 'Alertas de inventario',
      usd: '6 productos',
      ves: 'Por agotarse',
      change: 'Crítico',
      positive: false,
      sub: 'Reponer hoy en bodega',
      action: () => onNavigate('inventario'),
    },
  ];

  const recentSales = [
    { id: 'FAC-0089', client: 'Carlos Silva', items: '4 productos', totalUsd: 42.50, method: 'Pago Móvil (BCV)', time: 'Hace 4 min' },
    { id: 'FAC-0088', client: 'Consumidor Final', items: '2 productos', totalUsd: 14.00, method: 'Efectivo USD', time: 'Hace 18 min' },
    { id: 'FAC-0087', client: 'Panadería La Espiga', items: '12 productos', totalUsd: 185.00, method: 'USDT Binance', time: 'Hace 35 min' },
    { id: 'FAC-0086', client: 'Marta Rivas (Crédito)', items: '6 productos', totalUsd: 38.00, method: 'Fiado a 7 días', time: 'Hace 1 hora' },
  ];

  return (
    <div className="space-y-6">
      
      {/* 1. Real-time BCV, Euro and USDT Rates Widget */}
      <BcvExchangeWidget />

      {/* 2. User Stats & Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, i) => (
          <div 
            key={i} 
            onClick={stat.action}
            className={`bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col justify-between ${
              stat.action ? 'cursor-pointer hover:border-neutral-900 transition-colors' : ''
            }`}
          >
            <div>
              <div className="flex justify-between items-start text-xs font-semibold text-neutral-500 mb-1">
                <span>{stat.title}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  stat.positive ? 'text-emerald-700 bg-emerald-50' : 'text-amber-800 bg-amber-50'
                }`}>
                  {stat.change}
                </span>
              </div>

              <div className="text-2xl font-bold tracking-tight text-neutral-950 font-mono mt-1">
                {stat.usd}
              </div>
              
              <div className="text-xs text-neutral-500 font-mono mt-0.5">
                {stat.ves}
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
              <span>{stat.sub}</span>
              {stat.action && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Operational Grid: Recent Sales & Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Sales Column */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="flex justify-between items-center pb-3 border-b border-neutral-100 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Últimas ventas procesadas
              </h3>
              <p className="text-xs text-neutral-500">Transacciones de caja registradas hoy</p>
            </div>
            <button
              onClick={() => onNavigate('ventas')}
              className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
            >
              <span>Ver todas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100 text-xs">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-3 flex items-center justify-between hover:bg-neutral-50/60 px-2 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neutral-900">{sale.id}</span>
                    <span className="text-neutral-400">•</span>
                    <span className="font-semibold text-neutral-900">{sale.client}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-0.5">
                    {sale.items} • {sale.method} • <span className="text-neutral-400">{sale.time}</span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="font-bold text-neutral-950 text-sm">
                    ${sale.totalUsd.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Bs. {(sale.totalUsd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 1 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between items-center">
            <span className="text-xs text-neutral-500">Total tickets hoy: <strong>28</strong></span>
            <button
              onClick={() => onNavigate('ventas')}
              className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva venta express</span>
            </button>
          </div>
        </div>

        {/* Shortcuts & Quick Actions Column */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
              Accesos a Módulos
            </h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => onNavigate('ventas')}
                className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-950 text-left transition-colors bg-white hover:bg-neutral-50"
              >
                <div className="font-bold text-neutral-950">Ventas</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Cobro multimoneda</div>
              </button>

              <button
                onClick={() => onNavigate('productos')}
                className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-950 text-left transition-colors bg-white hover:bg-neutral-50"
              >
                <div className="font-bold text-neutral-950">Productos</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Precios al BCV</div>
              </button>

              <button
                onClick={() => onNavigate('inventario')}
                className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-950 text-left transition-colors bg-white hover:bg-neutral-50"
              >
                <div className="font-bold text-neutral-950">Inventario</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Kardex y alertas</div>
              </button>

              <button
                onClick={() => onNavigate('clientes')}
                className="p-3 rounded-xl border border-neutral-200 hover:border-neutral-950 text-left transition-colors bg-white hover:bg-neutral-50"
              >
                <div className="font-bold text-neutral-950">Clientes</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">Cobranza de fiados</div>
              </button>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="bg-neutral-950 text-white p-5 rounded-2xl shadow-sm space-y-2">
            <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Sincronización con la App Móvil
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Toda venta registrada desde tu teléfono celular o terminal bluetooth se refleja al instante aquí en tu panel web.
            </p>
            <div className="pt-2 text-[11px] text-emerald-400 font-mono">
              ● Estado: Sincronizado en tiempo real
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
