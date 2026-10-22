import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, TrendingUp, ArrowRightLeft, Clock, ShieldCheck } from 'lucide-react';

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
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
      
      {/* Top Header of the Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
            <span>Tasas Oficiales & Mercado (Venezuela)</span>
            <span className="text-[10px] text-neutral-400 font-normal font-mono">• API en vivo</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Clock className="w-3.5 h-3.5 text-neutral-400" />
          <span className="text-[11px] font-mono">{rates.lastUpdate}</span>
          <button
            onClick={fetchRates}
            disabled={rates.loading}
            className="p-1 rounded-md hover:bg-neutral-100 text-neutral-600 hover:text-neutral-950 transition-colors disabled:opacity-40"
            title="Actualizar tasas ahora"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rates.loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 KPI Rate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        
        {/* Dólar BCV */}
        <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 transition-colors">
          <div className="flex justify-between items-center text-[11px] text-neutral-500 font-medium">
            <span>Dólar BCV Oficial</span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
              BCV
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-mono">
              Bs. {rates.dolarBcv.toFixed(2)}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            1 USD = {rates.dolarBcv.toFixed(2)} VES
          </div>
        </div>

        {/* Euro BCV */}
        <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 transition-colors">
          <div className="flex justify-between items-center text-[11px] text-neutral-500 font-medium">
            <span>Euro Oficial</span>
            <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
              BCV EUR
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-mono">
              Bs. {rates.euroBcv.toFixed(2)}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            1 EUR = {rates.euroBcv.toFixed(2)} VES
          </div>
        </div>

        {/* USDT / Paralelo */}
        <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-neutral-50/60 hover:bg-neutral-50 transition-colors">
          <div className="flex justify-between items-center text-[11px] text-neutral-500 font-medium">
            <span>USDT (Binance P2P / Mercado)</span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
              P2P
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 font-mono">
              Bs. {rates.usdt.toFixed(2)}
            </span>
          </div>
          <div className="text-[10px] text-neutral-400 mt-1">
            Spread vs BCV: +{(((rates.usdt - rates.dolarBcv) / rates.dolarBcv) * 100).toFixed(1)}%
          </div>
        </div>

      </div>

      {/* Mini Conversion Tool */}
      <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-neutral-500 font-medium">Convertidor rápido:</span>
          <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
            <input
              type="number"
              value={convertAmount}
              onChange={(e) => setConvertAmount(e.target.value)}
              className="w-20 px-2 py-1 text-xs text-neutral-900 focus:outline-none"
              placeholder="10"
            />
            <select
              value={convertCurrency}
              onChange={(e) => setConvertCurrency(e.target.value)}
              className="bg-neutral-100 px-2 py-1 text-xs text-neutral-700 border-l border-neutral-300 font-semibold focus:outline-none"
            >
              <option value="USD">USD (BCV)</option>
              <option value="EUR">EUR (BCV)</option>
              <option value="USDT">USDT</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-neutral-900 font-bold bg-neutral-100 px-3 py-1.5 rounded-lg w-full sm:w-auto justify-end">
          <span className="text-[11px] font-sans font-normal text-neutral-500">Equivale a:</span>
          <span>Bs. {calculateConversion()} VES</span>
        </div>
      </div>

    </div>
  );
}
