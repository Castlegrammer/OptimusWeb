import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  ArrowRightLeft, 
  DollarSign, 
  Coins, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export default function ChangeCalculatorModal({ 
  isOpen, 
  onClose, 
  rates = { dolarBcv: 884.75, euroBcv: 993.21, usdt: 1000.60 } 
}) {
  // Configuración de tasa activa
  const [selectedRateType, setSelectedRateType] = useState('bcv'); // 'bcv', 'usdt', 'euro', 'custom'
  const [customRateValue, setCustomRateValue] = useState(rates.dolarBcv ? rates.dolarBcv.toString() : '884.75');

  // Monto a cobrar
  const [chargeCurrency, setChargeCurrency] = useState('USD'); // 'USD' o 'VES'
  const [chargeAmount, setChargeAmount] = useState('12.50');

  // Montos recibidos (soporta pago mixto)
  const [receivedUsd, setReceivedUsd] = useState('');
  const [receivedVes, setReceivedVes] = useState('');

  const [copied, setCopied] = useState(false);

  // Obtener la tasa activa numérica
  const getActiveRate = () => {
    if (selectedRateType === 'bcv') return rates.dolarBcv || 884.75;
    if (selectedRateType === 'usdt') return rates.usdt || 1000.60;
    if (selectedRateType === 'euro') return rates.euroBcv || 993.21;
    if (selectedRateType === 'custom') return parseFloat(customRateValue) || rates.dolarBcv || 884.75;
    return rates.dolarBcv || 884.75;
  };

  const currentRate = getActiveRate();

  // Calcular el total a cobrar en USD
  const totalChargeUsd = chargeCurrency === 'USD' 
    ? (parseFloat(chargeAmount) || 0)
    : ((parseFloat(chargeAmount) || 0) / (currentRate || 1));

  // Total recibido en USD equivalente (combinando USD en mano + Bs recibidos)
  const valUsd = parseFloat(receivedUsd) || 0;
  const valVes = parseFloat(receivedVes) || 0;
  const totalReceivedUsd = valUsd + (currentRate > 0 ? valVes / currentRate : 0);

  // Diferencia / Vuelto
  const differenceUsd = totalReceivedUsd - totalChargeUsd;
  const isPaidEnough = differenceUsd >= -0.009;
  const isExact = Math.abs(differenceUsd) < 0.01;
  const changeUsd = Math.max(0, differenceUsd);

  // Vuelto en las distintas tasas
  const changeBcvVes = changeUsd * (rates.dolarBcv || 884.75);
  const changeUsdtVes = changeUsd * (rates.usdt || 1000.60);
  const changeCurrentVes = changeUsd * currentRate;

  // Monto faltante si no llega
  const missingUsd = Math.abs(Math.min(0, differenceUsd));
  const missingVes = missingUsd * currentRate;

  // Botones de billetes rápidos
  const handleQuickCash = (bill) => {
    setReceivedUsd((prev) => {
      const current = parseFloat(prev) || 0;
      return (current + bill).toString();
    });
  };

  const handleSetExact = () => {
    if (chargeCurrency === 'USD') {
      setReceivedUsd((parseFloat(chargeAmount) || 0).toString());
      setReceivedVes('');
    } else {
      setReceivedVes((parseFloat(chargeAmount) || 0).toString());
      setReceivedUsd('');
    }
  };

  const handleReset = () => {
    setChargeAmount('');
    setReceivedUsd('');
    setReceivedVes('');
  };

  const handleCopySummary = () => {
    const text = `*Resumen de Cobro - Optimus360*\n` +
      `Total cuenta: $${totalChargeUsd.toFixed(2)} USD (Bs. ${(totalChargeUsd * currentRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})\n` +
      `Tasa aplicada: Bs. ${currentRate.toFixed(2)} (${selectedRateType.toUpperCase()})\n` +
      `Recibido: ${valUsd > 0 ? `$${valUsd.toFixed(2)} USD ` : ''}${valVes > 0 ? `+ Bs. ${valVes.toLocaleString('es-VE')} ` : ''}\n` +
      (isExact 
        ? `Pago exacto. ¡Sin vuelto!` 
        : `Vuelto a entregar:\n• En Dólares: $${changeUsd.toFixed(2)} USD\n• En Pago Móvil / Bs (Tasa BCV): Bs. ${changeBcvVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n• En Bs (Tasa USDT): Bs. ${changeUsdtVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-slate-900">Calculadora de Vuelto Multitasa</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  Bodega & Caja
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Calcula el cambio exacto en $ o en Bs a cualquier tasa oficial o de mercado
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* 1. Selector de Tasas (SIN FONDOS NEGROS) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Selecciona la Tasa a aplicar para esta venta:
              </label>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Tasa actual: Bs. {currentRate.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Tasa BCV */}
              <button
                type="button"
                onClick={() => setSelectedRateType('bcv')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedRateType === 'bcv'
                    ? 'border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-800">
                    BCV Oficial
                  </span>
                  {selectedRateType === 'bcv' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </div>
                <div className="text-sm font-mono font-extrabold mt-1">
                  Bs. {(rates.dolarBcv || 884.75).toFixed(2)}
                </div>
              </button>

              {/* Tasa USDT */}
              <button
                type="button"
                onClick={() => setSelectedRateType('usdt')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedRateType === 'usdt'
                    ? 'border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-800">
                    USDT / P2P
                  </span>
                  {selectedRateType === 'usdt' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <div className="text-sm font-mono font-extrabold mt-1">
                  Bs. {(rates.usdt || 1000.60).toFixed(2)}
                </div>
              </button>

              {/* Tasa Euro */}
              <button
                type="button"
                onClick={() => setSelectedRateType('euro')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedRateType === 'euro'
                    ? 'border-blue-500 bg-blue-50/90 text-blue-950 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-800">
                    Euro BCV
                  </span>
                  {selectedRateType === 'euro' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-sm font-mono font-extrabold mt-1">
                  Bs. {(rates.euroBcv || 993.21).toFixed(2)}
                </div>
              </button>

              {/* Tasa Personalizada */}
              <button
                type="button"
                onClick={() => setSelectedRateType('custom')}
                className={`p-3 rounded-2xl text-left border transition-all ${
                  selectedRateType === 'custom'
                    ? 'border-purple-500 bg-purple-50/90 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-800">
                    Mi Tasa
                  </span>
                  {selectedRateType === 'custom' && <Check className="w-3.5 h-3.5 text-purple-600" />}
                </div>
                <div className="text-sm font-mono font-extrabold mt-1">
                  Bs. {parseFloat(customRateValue || 0).toFixed(2)}
                </div>
              </button>
            </div>

            {selectedRateType === 'custom' && (
              <div className="mt-2.5 p-3 bg-purple-50/60 rounded-2xl border border-purple-200 flex items-center gap-3">
                <span className="text-xs text-purple-900 font-bold shrink-0">Escribe tu tasa propia:</span>
                <input
                  type="number"
                  step="0.01"
                  value={customRateValue}
                  onChange={(e) => setCustomRateValue(e.target.value)}
                  placeholder="Ej. 950.00"
                  className="bg-white border border-purple-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-purple-600 w-32 shadow-2xs"
                />
                <span className="text-[11px] text-purple-700 font-medium">Bs. por cada $1 USD</span>
              </div>
            )}
          </div>

          {/* 2. Monto a cobrar */}
          <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/90">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-900" />
                <span>2. Total de la Cuenta (A cobrar):</span>
              </label>

              {/* Selector de moneda */}
              <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 text-[11px] font-bold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setChargeCurrency('USD')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    chargeCurrency === 'USD' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  $ USD
                </button>
                <button
                  type="button"
                  onClick={() => setChargeCurrency('VES')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    chargeCurrency === 'VES' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bs. VES
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-2.5 text-2xl font-mono font-extrabold text-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-2xs"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {chargeCurrency}
              </span>
            </div>

            {/* Equivalencias directas a las diferentes tasas */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className="text-slate-500 font-medium">Equivalencias de esta cuenta:</span>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-slate-800">
                  Total USD: <strong>${totalChargeUsd.toFixed(2)}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-800 font-bold">
                  Al BCV: <strong>Bs. {(totalChargeUsd * (rates.dolarBcv || 884.75)).toLocaleString('es-VE', { maximumFractionDigits: 2 })}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-800 font-bold">
                  Al USDT: <strong>Bs. {(totalChargeUsd * (rates.usdt || 1000.60)).toLocaleString('es-VE', { maximumFractionDigits: 2 })}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Monto Recibido del Cliente */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-slate-900" />
                <span>3. ¿Con cuánto paga el cliente? (Soporta Pago Mixto):</span>
              </label>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSetExact}
                  className="text-[11px] text-blue-600 hover:underline font-bold"
                >
                  Paga exacto
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 font-medium"
                  title="Reiniciar montos"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              </div>
            </div>

            {/* Billetes rápidos en USD */}
            <div className="mb-3">
              <div className="text-[10px] text-slate-500 mb-1.5 font-bold uppercase tracking-wider">Billetes en USD rápidos:</div>
              <div className="flex flex-wrap gap-1.5">
                {[1, 5, 10, 20, 50, 100].map((bill) => (
                  <button
                    key={bill}
                    type="button"
                    onClick={() => handleQuickCash(bill)}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-xs font-mono font-bold text-slate-800 transition-colors shadow-2xs"
                  >
                    +${bill}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs de pago */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">
                  En Divisas / Efectivo USD:
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={receivedUsd}
                    onChange={(e) => setReceivedUsd(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-3.5 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-600 font-bold block mb-1">
                  En Bolívares (Pago Móvil / Punto / Efectivo):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Bs.</span>
                  <input
                    type="number"
                    step="0.01"
                    value={receivedVes}
                    onChange={(e) => setReceivedVes(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3.5 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Total recibido sumado */}
            <div className="mt-2 text-right text-xs text-slate-500 font-mono">
              Total entregado: <strong className="text-slate-950 font-extrabold">${totalReceivedUsd.toFixed(2)} USD</strong> (Bs. {(totalReceivedUsd * currentRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })})
            </div>
          </div>

          {/* 4. RESULTADO DEL VUELTO (LIMPIO Y CLARO, SIN FONDO NEGRO) */}
          <div className="rounded-3xl overflow-hidden border border-slate-200">
            {totalChargeUsd <= 0 ? (
              <div className="p-4 bg-slate-50 text-center text-xs text-slate-400 font-medium">
                Ingresa el monto a cobrar arriba para calcular el vuelto
              </div>
            ) : !isPaidEnough ? (
              // Falta dinero
              <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-900 space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Dinero insuficiente. Aún falta por pagar:</span>
                </div>
                <div className="flex items-baseline gap-2 font-mono pl-6">
                  <span className="text-xl font-extrabold text-rose-700">
                    Faltan ${missingUsd.toFixed(2)} USD
                  </span>
                  <span className="text-xs text-rose-600 font-semibold">
                    (o Bs. {missingVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </span>
                </div>
              </div>
            ) : isExact ? (
              // Pago Exacto
              <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="font-bold text-xs">¡Pago Exacto!</div>
                    <div className="text-[11px] text-emerald-800">No se requiere entregar vuelto al cliente.</div>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-mono font-bold">
                  $0.00
                </span>
              </div>
            ) : (
              // Vuelto a entregar con desglose multimoneda (FONDO CLARO ELEGANTE)
              <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-teal-50/40 p-5 rounded-3xl border border-emerald-300/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Vuelto a entregar al cliente:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200 transition-colors shadow-2xs"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copied ? 'Copiado' : 'Copiar detalle'}</span>
                  </button>
                </div>

                {/* Vuelto Principal en USD */}
                <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">Vuelto en Divisas ($ USD):</div>
                  <div className="text-3xl font-mono font-extrabold text-emerald-950 mt-0.5">
                    ${changeUsd.toFixed(2)} <span className="text-sm font-bold text-emerald-800">USD</span>
                  </div>
                </div>

                {/* Vuelto si se entrega en Bolívares */}
                <div>
                  <div className="text-[11px] text-slate-600 mb-2 font-bold">
                    O si vas a dar vuelto en Bolívares (Pago Móvil / Efectivo):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* A tasa BCV */}
                    <div className="p-3.5 rounded-2xl bg-white border border-emerald-200/90 shadow-2xs">
                      <div className="text-[10px] text-emerald-800 font-bold flex items-center justify-between">
                        <span>A Tasa Oficial BCV</span>
                        <span className="font-mono text-slate-400">Bs. {(rates.dolarBcv || 884.75).toFixed(2)}</span>
                      </div>
                      <div className="text-lg font-mono font-extrabold text-emerald-950 mt-1">
                        Bs. {changeBcvVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* A tasa USDT / Paralelo */}
                    <div className="p-3.5 rounded-2xl bg-white border border-amber-200/90 shadow-2xs">
                      <div className="text-[10px] text-amber-800 font-bold flex items-center justify-between">
                        <span>A Tasa USDT / P2P</span>
                        <span className="font-mono text-slate-400">Bs. {(rates.usdt || 1000.60).toFixed(2)}</span>
                      </div>
                      <div className="text-lg font-mono font-extrabold text-amber-950 mt-1">
                        Bs. {changeUsdtVes.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 pt-2 border-t border-emerald-200/80 flex items-center justify-between">
                  <span>Tasa activa aplicada para el cálculo:</span>
                  <span className="font-mono font-bold text-slate-900">Bs. {currentRate.toFixed(2)} ({selectedRateType.toUpperCase()})</span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            Consejo: Puedes dar vuelto mixto (ej. billete de $1 y el resto por Pago Móvil)
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
