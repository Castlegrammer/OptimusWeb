import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  FolderTree, 
  Boxes, 
  BarChart3, 
  Users, 
  Truck, 
  LogOut, 
  X,
  Calculator
} from 'lucide-react';

export default function Sidebar({ currentModule, onChangeModule, onLogout, mobileOpen, onCloseMobile, onOpenCalculator }) {
  const modules = [
    { id: 'inicio', name: 'Dashboard / KPIs', icon: LayoutDashboard },
    { id: 'ventas', name: 'Ventas', icon: ShoppingCart, badge: 'POS' },
    { id: 'compras', name: 'Compras', icon: ShoppingBag },
    { id: 'productos', name: 'Productos', icon: Package },
    { id: 'categorias', name: 'Categorías', icon: FolderTree },
    { id: 'inventario', name: 'Inventario', icon: Boxes, badgeAlert: true },
    { id: 'reportes', name: 'Reportes', icon: BarChart3 },
    { id: 'clientes', name: 'Clientes', icon: Users },
    { id: 'proveedores', name: 'Proveedores', icon: Truck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-neutral-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Sidebar Header */}
        <div>
          <div className="h-16 px-5 border-b border-neutral-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center font-bold text-sm tracking-tight">
                360
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-neutral-950 text-sm tracking-tight leading-none">
                  Optimus360
                </span>
                <span className="text-[10px] text-neutral-400 font-medium mt-0.5">
                  Panel Administrativo Web
                </span>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="p-1 text-neutral-400 hover:text-neutral-900 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links for 8 Modules + Dashboard */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Módulos del Sistema
            </div>

            {modules.map((m) => {
              const Icon = m.icon;
              const isActive = currentModule === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onChangeModule(m.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-neutral-950 text-white shadow-2xs'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{m.name}</span>
                  </div>

                  {m.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isActive ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                    }`}>
                      {m.badge}
                    </span>
                  )}

                  {m.badgeAlert && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" title="Alertas de stock bajo" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-neutral-200/80 space-y-2">
          
          {/* Botón Acceso Rápido a Calculadora de Vuelto */}
          <button
            onClick={() => {
              if (onOpenCalculator) onOpenCalculator();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-200/80 text-xs font-bold transition-all shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Calculadora de Vuelto</span>
            </div>
            <span className="text-[10px] bg-emerald-200/70 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">
              Multitasa
            </span>
          </button>

          <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-neutral-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                JD
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-neutral-900 truncate">Comercial Los Andes</div>
                <div className="text-[10px] text-neutral-500 truncate">admin@losandes.ve</div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-neutral-100 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-400" />
            <span>Cerrar sesión</span>
          </button>
        </div>

      </aside>
    </>
  );
}
