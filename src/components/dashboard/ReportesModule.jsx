import React from 'react';
import { BarChart3, Download, Calendar, DollarSign, PieChart, ArrowUpRight } from 'lucide-react';

export default function ReportesModule({ bcvRate = 884.75 }) {
  const paymentBreakdown = [
    { method: 'Pago Móvil (Bs - Tasa BCV)', usd: 540.00, percentage: '43.2%', count: 16 },
    { method: 'Efectivo Divisas ($ USD)', usd: 380.00, percentage: '30.4%', count: 11 },
    { method: 'Punto de Venta Débito (Bs)', usd: 215.50, percentage: '17.2%', count: 7 },
    { method: 'Binance USDT / Cripto', usd: 113.00, percentage: '9.2%', count: 3 },
  ];

  const totalToday = paymentBreakdown.reduce((sum, p) => sum + p.usd, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <div>
          <h2 className="text-base font-bold text-neutral-950">Reportes Financieros & Cierre de Caja</h2>
          <p className="text-xs text-neutral-500">Desglose exacto de dinero ingresado por cada método de pago y cálculo de ganancia real</p>
        </div>

        <button
          onClick={() => alert("Generando informe consolidado en PDF y Excel...")}
          className="px-4 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-2xs"
        >
          <Download className="w-4 h-4" />
          <span>Exportar Informe Contable</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500">Total Ingresado en Caja Hoy</div>
          <div className="text-2xl font-bold font-mono text-neutral-950 mt-1">${totalToday.toFixed(2)} USD</div>
          <div className="text-xs text-neutral-500 font-mono mt-0.5">
            Bs. {(totalToday * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 0 })} VES
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-neutral-500">Costo de Mercancía Vendida</div>
          <div className="text-2xl font-bold font-mono text-neutral-600 mt-1">$830.50 USD</div>
          <div className="text-[11px] text-neutral-400 mt-1">Costo reposición de inventario</div>
        </div>

        <div className="bg-neutral-950 text-white p-5 rounded-2xl shadow-sm">
          <div className="text-xs font-semibold text-neutral-400">Utilidad Neta Líquida</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">${(totalToday - 830.50).toFixed(2)} USD</div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">Margen real del 33.5%</div>
        </div>
      </div>

      {/* Breakdown by Payment Method */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/90 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4">
          Arqueo de Caja por Método de Cobro (Cierre de Turno)
        </h3>

        <div className="space-y-4">
          {paymentBreakdown.map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex justify-between items-center font-medium">
                <span className="text-neutral-900 font-semibold">{item.method}</span>
                <div className="text-right font-mono">
                  <span className="font-bold text-neutral-950">${item.usd.toFixed(2)}</span>
                  <span className="text-neutral-400 ml-2">({item.percentage})</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-neutral-900 h-full rounded-full" 
                  style={{ width: item.percentage }} 
                />
              </div>

              <div className="text-[10px] text-neutral-400 flex justify-between font-mono">
                <span>{item.count} operaciones</span>
                <span>Bs. {(item.usd * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 1 })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
