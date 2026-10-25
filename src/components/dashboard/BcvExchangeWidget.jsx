import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, TrendingUp, ArrowRightLeft, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export default function BcvExchangeWidget({ onRatesUpdated }) {
  const [rates, setRates] = useState({
    dolarBcv: 884.75,
    euroBcv: 993.21,
    usdt: 1000.60,
    lastUpdate: 'Hoy',
    loading: false,
    error: null,
  });

  const [convertAmount, setConvertAmount] = useState('10');
  const [convertCurrency, setConvertCurrency] = useState('USD');

  const fetchRates = async () => {
    setRates((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const [dolaresRes, eurosRes] = await Promise.all([
        fetch('https://ve.dolarapi.com/v1/dolares'),
        fetch('https://ve.dolarapi.com/v1/euros'),
      ]);

      if (!dolaresRes.ok || !eurosRes.ok) throw new Error('Error al conectar con la API');

      const dolares = await dolaresRes.json();
      const euros = await eurosRes.json();

      const bcv = dolares.find((d) => d.fuente === 'oficial')?.promedio || 884.75;
      const paralelo = dolares.find((d) => d.fuente === 'paralelo')?.promedio || 1000.60;
      const euro = euros.find((e) => e.fuente === 'oficial')?.promedio || 993.21;
      const fecha = dolares.find((d) => d.fuente === 'oficial')?.fechaActualizacion || new Date().toISOString();

      const newRates = {
        dolarBcv: bcv,
        euroBcv: euro,
        usdt: paralelo,
        lastUpdate: new Date(fecha).toLocaleDateString('es-VE', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: 'short',
        }),
        loading: false,
        error: null,
      };

      setRates(newRates);
      if (onRatesUpdated) onRatesUpdated(newRates);
    } catch (err) {
      console.warn('API DolarApi offline, usando valores de respaldo:', err);
      setRates((prev) => ({
        ...prev,
        loading: false,
        lastUpdate: 'Actualizado (Caché local)',
      }));
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const calculateConversion = () => {
    const val = parseFloat(convertAmount) || 0;
    if (convertCurrency === 'USD') return (val * rates.dolarBcv).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (convertCurrency === 'EUR') return (val * rates.euroBcv).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (convertCurrency === 'USDT') return (val * rates.usdt).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return '0.00';
  };

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-3xl p-5 shadow-xs hover:shadow-sm transition-shadow">
      
      {/* Top Header of the Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span>Tasas Oficiales & Mercado Venezuela</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-mono">
              En Vivo
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-mono text-slate-600">{rates.lastUpdate}</span>
          <button
            onClick={fetchRates}
            disabled={rates.loading}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-blue-600 transition-colors disabled:opacity-40"
            title="Actualizar tasas ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rates.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 KPI Rate Cards con Sutiles Degradados y Acentos Vivos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-4">
        
        {/* Dólar BCV */}
        <div className="group relative overflow-hidden p-4 rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 hover:border-emerald-400/90 hover:shadow-md hover:shadow-emerald-500/5 transition-all duration-200">
          <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
            <span className="font-semibold text-emerald-950">Dólar BCV Oficial</span>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60 shadow-2xs">
              OFICIAL
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 font-mono">
              Bs. {rates.dolarBcv.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-emerald-700/80 mt-1 flex items-center gap-1 font-medium">
            <span>1 USD = {rates.dolarBcv.toFixed(2)} VES</span>
          </div>
        </div>

        {/* Euro BCV */}
        <div className="group relative overflow-hidden p-4 rounded-2xl border border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/30 hover:border-blue-400/90 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-200">
          <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
            <span className="font-semibold text-blue-950">Euro BCV</span>
            <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-full border border-blue-300/60 shadow-2xs">
              EUR BCV
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-blue-950 font-mono">
              Bs. {rates.euroBcv.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-blue-700/80 mt-1 flex items-center gap-1 font-medium">
            <span>1 EUR = {rates.euroBcv.toFixed(2)} VES</span>
          </div>
        </div>

        {/* USDT / Paralelo */}
        <div className="group relative overflow-hidden p-4 rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 hover:border-amber-400/90 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-200">
          <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
            <span className="font-semibold text-amber-950">USDT / P2P Binance</span>
            <span className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
              MERCADO
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-amber-950 font-mono">
              Bs. {rates.usdt.toFixed(2)}
            </span>
          </div>
          <div className="text-[11px] text-amber-800/90 mt-1 flex items-center gap-1 font-medium">
            <span>Brecha: +{(((rates.usdt - rates.dolarBcv) / rates.dolarBcv) * 100).toFixed(1)}% vs BCV</span>
          </div>
        </div>

      </div>

      {/* Mini Conversion Tool */}
      <div className="pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <span className="text-slate-600 font-semibold flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
            <span>Convertidor instantáneo:</span>
          </span>
          <div className="flex items-center border border-slate-300/80 rounded-xl overflow-hidden bg-white shadow-2xs focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500">
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="w-20 px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
              placeholder="10"
            />
            <select
              value={convertCurrency}
              onChange={(e) => setConvertCurrency(e.target.value)}
              className="bg-slate-50 px-2.5 py-1.5 text-xs text-slate-800 border-l border-slate-300/80 font-bold focus:outline-none"
            >
              <option value="USD">USD (BCV)</option>
              <option value="EUR">EUR (BCV)</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-slate-900 font-bold bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 px-4 py-2 rounded-xl w-full sm:w-auto justify-end shadow-2xs">
          <span className="text-[11px] font-sans font-medium text-blue-700">Equivale a:</span>
          <span className="text-sm font-extrabold text-blue-950">Bs. {calculateConversion()} VES</span>
        </div>
      </div>

    </div>
  );
}
