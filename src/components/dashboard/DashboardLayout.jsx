import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import OverviewModule from './OverviewModule';
import VentasModule from './VentasModule';
import ComprasModule from './ComprasModule';
import ProductosModule from './ProductosModule';
import CategoriasModule from './CategoriasModule';
import InventarioModule from './InventarioModule';
import ReportesModule from './ReportesModule';
import ClientesModule from './ClientesModule';
import ProveedoresModule from './ProveedoresModule';
import ChangeCalculatorModal from './ChangeCalculatorModal';
import { Menu, LogOut, Calculator, Sparkles } from 'lucide-react';

export default function DashboardLayout({ user, onLogout }) {
  const [currentModule, setCurrentModule] = useState('inicio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const displayName = user?.nombre || user?.Nombre || user?.name || user?.email?.split('@')[0] || 'Administrador';
  const displayRole = user?.tipo || user?.Tipo || user?.rol || 'Administrador';
  const displayEmail = user?.email || user?.Email || '';

  const getInitials = (name, email) => {
    if (name && typeof name === 'string' && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (email && typeof email === 'string' && email.trim()) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'OP';
  };

  // Tasas en vivo compartidas en todo el sistema
  const [rates, setRates] = useState({
    dolarBcv: 884.75,
    euroBcv: 993.21,
    usdt: 1000.60,
  });

  // Consultar tasas en vivo al iniciar
  useEffect(() => {
    const fetchLiveRates = async () => {
      try {
        const [dolaresRes, eurosRes] = await Promise.all([
          fetch('https://ve.dolarapi.com/v1/dolares'),
          fetch('https://ve.dolarapi.com/v1/euros'),
        ]);

        if (dolaresRes.ok && eurosRes.ok) {
          const dolares = await dolaresRes.json();
          const euros = await eurosRes.json();

          const bcv = dolares.find((d) => d.fuente === 'oficial')?.promedio || rates.dolarBcv;
          const paralelo = dolares.find((d) => d.fuente === 'paralelo')?.promedio || rates.usdt;
          const euro = euros.find((e) => e.fuente === 'oficial')?.promedio || rates.euroBcv;

          setRates({
            dolarBcv: bcv,
            euroBcv: euro,
            usdt: paralelo,
          });
        }
      } catch (err) {
        console.warn('Usando tasas locales por defecto:', err);
      }
    };

    fetchLiveRates();
  }, []);

  const bcvRate = rates.dolarBcv;

  const moduleTitles = {
    inicio: 'Panel General & KPIs',
    ventas: 'Ventas & Facturación (POS)',
    compras: 'Compras & Gastos',
    productos: 'Catálogo de Productos',
    categorias: 'Familias & Categorías',
    inventario: 'Control de Inventario & Stock',
    reportes: 'Reportes & Cierre de Caja',
    clientes: 'Clientes & Libreta de Fiado',
    proveedores: 'Proveedores & Cuentas por Pagar',
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* 8-Module Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onChangeModule={setCurrentModule}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenCalculator={() => setShowCalculator(true)}
        user={user}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-950 hover:bg-slate-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span>Optimus360</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-400 capitalize">{currentModule}</span>
              </div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                {moduleTitles[currentModule]}
              </h1>
            </div>
          </div>

          {/* Quick Rates Pill & User Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Botón Destacado: Calculadora de Vuelto Multitasa */}
            <button
              onClick={() => setShowCalculator(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
              title="Abrir calculadora de vuelto con múltiples tasas"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calculadora Vuelto</span>
              <span className="sm:hidden">Vuelto</span>
            </button>

            {/* Pastilla de Tasa BCV */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
              <span className="text-emerald-800 font-sans text-[11px] font-bold">BCV:</span>
              <strong className="text-emerald-950 font-bold">Bs. {bcvRate.toFixed(2)}</strong>
            </div>

            {/* Pastilla USDT */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-mono text-amber-950">
              <span className="text-amber-800 font-sans text-[11px] font-bold">USDT:</span>
              <strong className="font-bold">Bs. {rates.usdt.toFixed(2)}</strong>
            </div>

            {/* Pastilla de Usuario Logueado */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs shadow-2xs">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-xs uppercase">
                {getInitials(displayName, displayEmail)}
              </div>
              <div className="flex flex-col text-left leading-tight max-w-[120px]">
                <span className="font-extrabold text-slate-900 text-[11px] truncate" title={displayName}>
                  {displayName}
                </span>
                <span className="text-[9px] text-slate-500 font-medium truncate">
                  {displayRole}
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 border border-slate-200 rounded-xl hover:bg-rose-50/60 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>

            {/* Avatar en Navbar */}
            <div 
              className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-xs font-extrabold flex items-center justify-center shadow-md shadow-blue-500/20 uppercase"
              title={`${displayName} (${displayRole})`}
            >
              {getInitials(displayName, displayEmail)}
            </div>
          </div>
        </header>

        {/* Dynamic Module Rendering */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentModule === 'inicio' && <OverviewModule onNavigate={setCurrentModule} bcvRate={bcvRate} user={user} />}
          {currentModule === 'ventas' && <VentasModule bcvRate={bcvRate} onOpenCalculator={() => setShowCalculator(true)} />}
          {currentModule === 'compras' && <ComprasModule bcvRate={bcvRate} />}
          {currentModule === 'productos' && <ProductosModule bcvRate={bcvRate} />}
          {currentModule === 'categorias' && <CategoriasModule />}
          {currentModule === 'inventario' && <InventarioModule />}
          {currentModule === 'reportes' && <ReportesModule bcvRate={bcvRate} />}
          {currentModule === 'clientes' && <ClientesModule bcvRate={bcvRate} usdtRate={rates.usdt} />}
          {currentModule === 'proveedores' && <ProveedoresModule bcvRate={bcvRate} />}
        </main>

      </div>

      {/* Modal Omnipresente de Calculadora de Vuelto */}
      <ChangeCalculatorModal
        isOpen={showCalculator}
        onClose={() => setShowCalculator(false)}
        rates={rates}
      />

    </div>
  );
}
