import React from 'react';
import { BarChart3, Download, Calendar, DollarSign, PieChart, ArrowUpRight, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ReportesModule({ bcvRate = 884.75 }) {
  const paymentBreakdown = [
    { method: 'Pago Móvil (Bs - Tasa BCV)', usd: 540.00, percentage: '43.2%', count: 16, barColor: 'bg-emerald-500' },
    { method: 'Efectivo Divisas ($ USD)', usd: 380.00, percentage: '30.4%', count: 11, barColor: 'bg-blue-500' },
    { method: 'Punto de Venta Débito (Bs)', usd: 215.50, percentage: '17.2%', count: 7, barColor: 'bg-indigo-500' },
    { method: 'Binance USDT / Cripto', usd: 113.00, percentage: '9.2%', count: 3, barColor: 'bg-amber-500' },
  ];

  const totalToday = paymentBreakdown.reduce((sum, p) => sum + p.usd, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Reportes Financieros & Cierre de Turno</h2>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Arqueo de dinero ingresado por cada método de cobro y cálculo de ganancia neta real para la casa
          </p>
        </div>

        <button
          onClick={() => alert("Generando informe consolidado en PDF y Excel...")}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Informe Contable</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Ingresado */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white p-5 rounded-3xl border border-emerald-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Ingresado en Caja Hoy</div>
          <div className="text-3xl font-extrabold font-mono text-slate-900 mt-1.5">${totalToday.toFixed(2)} USD</div>
          <div className="text-xs text-emerald-800 font-mono font-bold mt-1">
            Bs. {(totalToday * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} VES (BCV)
          </div>
        </div>

        {/* Costo Mercancía */}
        <div className="bg-gradient-to-br from-slate-500/10 via-white to-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Costo de Mercancía Vendida</div>
          <div className="text-3xl font-extrabold font-mono text-slate-700 mt-1.5">$830.50 USD</div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">Costo de reposición al mayorista</div>
        </div>

        {/* Ganancia Limpia */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-5 rounded-3xl shadow-md shadow-blue-500/20 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-300" />
              <span>Utilidad Neta Líquida</span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-1.5">
              ${(totalToday - 830.50).toFixed(2)} USD
            </div>
          </div>
          <div className="text-[11px] text-emerald-300 font-mono font-bold mt-2">
            Margen de ganancia limpio del 33.5%
          </div>
        </div>

      </div>

      {/* Breakdown by Payment Method */}
      <div className="bg-white/95 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Arqueo de Caja por Método de Cobro (Cierre de Turno)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">Tasa BCV: Bs. {bcvRate.toFixed(2)}</span>
        </div>

        <div className="space-y-4">
          {paymentBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-medium">
                <span className="text-slate-900 font-bold">{item.method}</span>
                <div className="text-right font-mono">
                  <span className="font-extrabold text-slate-950">${item.usd.toFixed(2)}</span>
                  <span className="text-slate-400 ml-2 font-bold">({item.percentage})</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`${item.barColor} h-full rounded-full transition-all duration-500`} 
                  style={{ width: item.percentage }} 
                />
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between font-mono font-medium">
                <span>{item.count} tickets cobrados</span>
                <span>Bs. {(item.usd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 1 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
