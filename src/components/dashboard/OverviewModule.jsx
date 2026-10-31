import React, { useState, useEffect } from 'react';
import BcvExchangeWidget from './BcvExchangeWidget';
import { 
  TrendingUp, 
  ShoppingCart, 
  BookOpen, 
  Package, 
  RefreshCw,
  Clock,
  CheckCircle2,
  Users
} from 'lucide-react';
import api from '../../services/api';

export default function OverviewModule({ onNavigate, bcvRate = 884.75, user }) {
  const [counts, setCounts] = useState({ productos: 0, clientes: 0, ventas: 0 });
  const [recentSales, setRecentSales] = useState([]);
  const [lastSync, setLastSync] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayName = user?.nombre || user?.Nombre || user?.name || user?.email?.split('@')[0] || 'Administrador';
  const displayRole = user?.tipo || user?.Tipo || user?.rol || 'Administrador';
  const displayEmail = user?.email || user?.Email || '';

  const getUserInitials = (name, email) => {
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statusRes, ventasRes] = await Promise.allSettled([
        api.dashboard.getStatus(),
        api.ventas.getAll(1, 5)
      ]);

      if (statusRes.status === 'fulfilled' && statusRes.value.counts) {
        setCounts(statusRes.value.counts);
        setLastSync(statusRes.value.last_sync);
      }

      if (ventasRes.status === 'fulfilled' && Array.isArray(ventasRes.value)) {
        setRecentSales(ventasRes.value);
      }
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const userStats = [
    {
      title: 'Ventas Registradas',
      usd: `${counts.ventas} ventas`,
      ves: 'En base de datos',
      change: 'En tiempo real',
      positive: true,
      sub: 'Ventas sincronizadas móvil + web',
      icon: ShoppingCart,
      color: 'emerald',
      gradient: 'from-emerald-500/10 via-white to-white',
      border: 'border-emerald-200/90',
      iconBg: 'bg-emerald-500 text-white shadow-emerald-500/20',
      badgeColor: 'text-emerald-800 bg-emerald-100/90 border-emerald-300/60',
      action: () => onNavigate('ventas'),
    },
    {
      title: 'Productos en Catálogo',
      usd: `${counts.productos} artículos`,
      ves: 'Disponibles',
      change: 'Activos',
      positive: true,
      sub: 'Gestionables en Android y Web',
      icon: Package,
      color: 'blue',
      gradient: 'from-blue-500/10 via-white to-white',
      border: 'border-blue-200/90',
      iconBg: 'bg-blue-600 text-white shadow-blue-500/20',
      badgeColor: 'text-blue-800 bg-blue-100/90 border-blue-300/60',
      action: () => onNavigate('productos'),
    },
    {
      title: 'Clientes en Cartera',
      usd: `${counts.clientes} clientes`,
      ves: 'Registrados',
      change: 'Base activa',
      positive: true,
      sub: 'Directorio y libreta de fiado',
      icon: Users,
      color: 'amber',
      gradient: 'from-amber-500/10 via-white to-white',
      border: 'border-amber-200/90',
      iconBg: 'bg-amber-500 text-white shadow-amber-500/20',
      badgeColor: 'text-amber-900 bg-amber-100/90 border-amber-300/60',
      action: () => onNavigate('clientes'),
    },
    {
      title: 'Servidor MySQL',
      usd: 'Online (Cloud)',
      ves: lastSync ? `Última sync: ${new Date(lastSync.created_at).toLocaleTimeString()}` : 'Listo para sincronizar',
      change: 'Conectado',
      positive: true,
      sub: 'API REST Coolify activa',
      icon: CheckCircle2,
      color: 'emerald',
      gradient: 'from-emerald-500/10 via-white to-white',
      border: 'border-emerald-200/90',
      iconBg: 'bg-emerald-600 text-white shadow-emerald-600/20',
      badgeColor: 'text-emerald-900 bg-emerald-100/90 border-emerald-300/60',
      action: () => fetchDashboardData(),
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Saludo y Datos de la Sesión del Usuario */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/95 backdrop-blur-xs p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-blue-500/25 uppercase shrink-0">
            {getUserInitials(displayName, displayEmail)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                ¡Bienvenido, {displayName}!
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesión activa como <span className="font-bold text-slate-700">{displayRole}</span> {displayEmail ? `(${displayEmail})` : ''}
            </p>
          </div>
        </div>
        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4 flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-500">
          <span className="text-[11px] font-semibold text-slate-400">Terminal de Control</span>
          <span className="font-mono font-bold text-blue-600">Optimus360 Cloud</span>
        </div>
      </div>

      {/* 1. Real-time BCV, Euro and USDT Rates Widget */}
      <BcvExchangeWidget />

      {/* 2. User Stats & Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {userStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div 
              key={i} 
              onClick={stat.action}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} p-5 rounded-3xl border ${stat.border} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-9 h-9 rounded-2xl ${stat.iconBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs font-mono ${stat.badgeColor}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                  {stat.title}
                </div>
                <div className="text-xl font-extrabold tracking-tight text-slate-900 font-mono">
                  {stat.usd}
                </div>
                <div className="text-xs font-semibold text-slate-600 font-mono mt-0.5">
                  {stat.ves}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-200/50 text-[11px] text-slate-500 font-medium">
                {stat.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Ventas Recientes en Vivo */}
      <div className="bg-white/95 backdrop-blur-xs rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Ventas Recientes Registradas</h3>
            <p className="text-xs text-slate-500">Transacciones almacenadas en la base de datos central</p>
          </div>
          <button
            onClick={() => onNavigate('ventas')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            Ver todas →
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Consultando datos...</span>
          </div>
        ) : recentSales.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <ShoppingCart className="w-8 h-8 text-slate-200 mx-auto mb-2" />
            <p className="font-semibold text-slate-600">Aún no hay ventas registradas</p>
            <p className="text-[11px]">Las ventas registradas en la app Android o en la Web aparecerán aquí en vivo.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentSales.map((v) => (
              <div key={v.uuid || v.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{v.cliente || 'Consumidor Final'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{v.fecha || 'Reciente'}</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-slate-950 font-mono">${Number(v.total).toFixed(2)}</div>
                  <div className="text-[11px] text-emerald-800 font-mono font-bold">
                    Bs. {(Number(v.total) * bcvRate).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
