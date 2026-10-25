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
  Calculator,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ currentModule, onChangeModule, onLogout, mobileOpen, onCloseMobile, onOpenCalculator }) {
  const modules = [
    { id: 'inicio', name: 'Dashboard / KPIs', icon: LayoutDashboard },
    { id: 'ventas', name: 'Ventas & Caja', icon: ShoppingCart, badge: 'POS' },
    { id: 'clientes', name: 'Clientes', icon: Users, badge: 'Fiado', badgeColor: 'bg-amber-100 text-amber-900' },
    { id: 'productos', name: 'Productos', icon: Package },
    { id: 'inventario', name: 'Inventario', icon: Boxes, badgeAlert: true },
    { id: 'compras', name: 'Compras', icon: ShoppingBag },
    { id: 'categorias', name: 'Categorías', icon: FolderTree },
    { id: 'reportes', name: 'Reportes & Cierre', icon: BarChart3 },
    { id: 'proveedores', name: 'Proveedores', icon: Truck },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Sidebar Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-md shadow-blue-500/25">
                360
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 text-sm tracking-tight leading-none">
                    Optimus360
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Bodega & Punto de Venta
                </span>
              </div>
            </div>

            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links for Modules */}
          <div className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{m.name}</span>
                  </div>

                  {m.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shadow-2xs ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : (m.badgeColor || 'bg-slate-100 text-slate-700')
                    }`}>
                      {m.badge}
                    </span>
                  )}

                  {m.badgeAlert && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]" title="Alertas de stock bajo" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          
          {/* Botón Acceso Rápido a Calculadora de Vuelto */}
          <button
            onClick={() => {
              if (onOpenCalculator) onOpenCalculator();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-950 border border-emerald-300/80 text-xs font-bold transition-all shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-700" />
              <span>Calculadora Vuelto</span>
            </div>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-mono font-bold shadow-2xs">
              Multitasa
            </span>
          </button>

          {/* User / Business Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-white via-slate-50 to-blue-50/40 border border-slate-200/90 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white text-xs font-extrabold flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
                BO
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-900 truncate leading-tight">
                  Bodega Mi Esfuerzo
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="font-semibold text-slate-600">Caja Principal • Activa</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>

      </aside>
    </>
  );
}
