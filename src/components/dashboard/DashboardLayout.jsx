import React, { useState } from 'react';
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
import { Menu, LogOut, ExternalLink } from 'lucide-react';

export default function DashboardLayout({ onLogout }) {
  const [currentModule, setCurrentModule] = useState('inicio');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bcvRate, setBcvRate] = useState(884.75);

  const moduleTitles = {
    inicio: 'Panel General & KPIs',
    ventas: 'Ventas & Facturación (POS)',
    compras: 'Compras & Gastos',
    productos: 'Catálogo de Productos',
    categorias: 'Familias & Categorías',
    inventario: 'Control de Inventario & Stock',
    reportes: 'Reportes & Cierre de Caja',
    clientes: 'Clientes & Cuentas por Cobrar',
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
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-50 border border-neutral-200 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-neutral-500">BCV:</span>
              <strong className="text-neutral-900">Bs. {bcvRate.toFixed(2)}</strong>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>

            <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center">
              AD
            </div>
          </div>
        </header>

        {/* Dynamic Module Rendering */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {currentModule === 'inicio' && <OverviewModule onNavigate={setCurrentModule} bcvRate={bcvRate} />}
          {currentModule === 'ventas' && <VentasModule bcvRate={bcvRate} />}
          {currentModule === 'compras' && <ComprasModule bcvRate={bcvRate} />}
          {currentModule === 'productos' && <ProductosModule bcvRate={bcvRate} />}
          {currentModule === 'categorias' && <CategoriasModule />}
          {currentModule === 'inventario' && <InventarioModule />}
          {currentModule === 'reportes' && <ReportesModule bcvRate={bcvRate} />}
          {currentModule === 'clientes' && <ClientesModule bcvRate={bcvRate} />}
          {currentModule === 'proveedores' && <ProveedoresModule bcvRate={bcvRate} />}
        </main>

      </div>

    </div>
  );
}
