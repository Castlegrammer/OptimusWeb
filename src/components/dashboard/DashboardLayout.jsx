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
import { Menu, LogOut, Calculator } from 'lucide-react';

export default function DashboardLayout({ onLogout }) {
  const [currentModule, setCurrentModule] = useState('inicio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

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
    clientes: 'Libreta de Fiado & Cuentas por Cobrar',
    proveedores: 'Proveedores & Cuentas por Pagar',
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex font-sans antialiased selection:bg-neutral-900 selection:text-white">
      
      {/* 8-Module Sidebar Navigation */}
      <Sidebar
        currentModule={currentModule}
        onChangeModule={setCurrentModule}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onOpenCalculator={() => setShowCalculator(true)}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-neutral-200/90 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">
                Optimus360 Web / {currentModule}
              </div>
              <h1 className="text-sm font-bold text-neutral-950 tracking-tight">
                {moduleTitles[currentModule]}
              </h1>
            </div>
          </div>

          {/* Quick Rates Pill & User Actions */}
          <div className="flex items-center gap-2.5">
            
            {/* Botón Destacado: Calculadora de Vuelto Multitasa */}
            <button
              onClick={() => setShowCalculator(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-xl transition-all shadow-2xs"
              title="Abrir calculadora de vuelto con múltiples tasas"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Calculadora de Vuelto</span>
              <span className="sm:hidden">Vuelto</span>
            </button>

            {/* Pastilla de Tasa BCV */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-500 font-sans text-[11px]">BCV:</span>
              <strong className="text-neutral-900">Bs. {bcvRate.toFixed(2)}</strong>
            </div>

            {/* Pastilla USDT */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-[11px] font-mono text-neutral-600">
              <span className="text-neutral-400 font-sans">USDT:</span>
              <strong>Bs. {rates.usdt.toFixed(2)}</strong>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-neutral-950 text-white text-xs font-bold flex items-center justify-center">
              360
            </div>
          </div>
        </header>

        {/* Dynamic Module Rendering */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentModule === 'inicio' && <OverviewModule onNavigate={setCurrentModule} bcvRate={bcvRate} />}
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
