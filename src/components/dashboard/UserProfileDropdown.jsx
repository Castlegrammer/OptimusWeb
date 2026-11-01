import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Settings, 
  Coins, 
  LogOut, 
  ChevronDown, 
  Edit3, 
  Check, 
  X, 
  Loader2, 
  ShieldCheck, 
  Sparkles,
  DollarSign
} from 'lucide-react';
import api from '../../services/api';

const AVAILABLE_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense (USD $)' },
  { code: 'VES', symbol: 'Bs.', name: 'Bolívares (VES Bs.)' },
  { code: 'EUR', symbol: '€', name: 'Euros (EUR €)' },
  { code: 'COP', symbol: 'COP$', name: 'Pesos Colombianos (COP)' },
];

export default function UserProfileDropdown({ user, onUpdateUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
  const [showEditCurrency, setShowEditCurrency] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [newCurrency, setNewCurrency] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const dropdownRef = useRef(null);

  const displayName = user?.nombre || user?.Nombre || user?.name || user?.email?.split('@')[0] || 'Administrador';
  const displayRole = user?.tipo || user?.Tipo || user?.rol || 'Administrador';
  const displayEmail = user?.email || user?.Email || '';
  const currentCurrency = (user?.moneda || user?.Moneda || 'USD').toUpperCase();

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

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowEditName(false);
        setShowEditCurrency(false);
        setMessage(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenEditName = () => {
    setNewName(displayName);
    setShowEditName(true);
    setShowEditCurrency(false);
    setMessage(null);
  };

  const handleOpenEditCurrency = () => {
    setNewCurrency(currentCurrency);
    setShowEditCurrency(true);
    setShowEditName(false);
    setMessage(null);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      const updated = await api.auth.updateProfile({ nombre: newName.trim() });
      if (onUpdateUser && updated) {
        onUpdateUser(updated);
      }
      setMessage({ type: 'success', text: 'Nombre de usuario actualizado' });
      setTimeout(() => {
        setShowEditName(false);
        setMessage(null);
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el nombre' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCurrency = async (selectedCode) => {
    setSaving(true);
    setMessage(null);

    try {
      const updated = await api.auth.updateProfile({ moneda: selectedCode });
      if (onUpdateUser && updated) {
        onUpdateUser(updated);
      }
      setMessage({ type: 'success', text: `Moneda configurada a ${selectedCode}` });
      setTimeout(() => {
        setShowEditCurrency(false);
        setMessage(null);
      }, 1200);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al cambiar la moneda' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón único de perfil en Navbar */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowEditName(false);
          setShowEditCurrency(false);
          setMessage(null);
        }}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/90 text-xs shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        title="Perfil de usuario y ajustes"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-extrabold flex items-center justify-center text-xs shadow-md shadow-blue-500/20 uppercase shrink-0">
          {getInitials(displayName, displayEmail)}
        </div>

        <div className="hidden sm:flex flex-col text-left leading-tight max-w-[120px]">
          <span className="font-extrabold text-slate-900 text-xs truncate group-hover:text-blue-600 transition-colors">
            {displayName}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {displayRole}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Menú Dropdown Exclusivo */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header de Información del Usuario */}
          <div className="p-3 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/25 uppercase shrink-0">
                {getInitials(displayName, displayEmail)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-slate-900 text-xs truncate leading-tight">
                  {displayName}
                </h4>
                {displayEmail && (
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {displayEmail}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] bg-blue-100/80 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                    {displayRole}
                  </span>
                  <span className="text-[10px] bg-emerald-100/80 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    En línea
                  </span>
                </div>
              </div>
            </div>

            {/* Moneda actual del sistema */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Moneda principal:</span>
              <span className="font-extrabold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs font-mono">
                {currentCurrency} ({AVAILABLE_CURRENCIES.find(c => c.code === currentCurrency)?.symbol || '$'})
              </span>
            </div>
          </div>

          {/* Mensajes de notificación */}
          {message && (
            <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {message.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span className="truncate">{message.text}</span>
            </div>
          )}

          {/* Formulario Inline: Cambiar Nombre */}
          {showEditName && (
            <form onSubmit={handleSaveName} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-[11px] font-bold text-slate-700">
                Nuevo Nombre de Usuario:
              </label>
              <input
                type="text"
                autoFocus
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ingresa tu nombre o empresa"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowEditName(false)}
                  className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-200/70 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || !newName.trim()}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 disabled:opacity-50 shadow-xs"
                >
                  {saving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>{saving ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Selector Inline: Cambiar Moneda */}
          {showEditCurrency && (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-slate-700">
                  Selecciona la Moneda Principal:
                </label>
                <button
                  type="button"
                  onClick={() => setShowEditCurrency(false)}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {AVAILABLE_CURRENCIES.map((curr) => {
                  const isSelected = currentCurrency === curr.code;
                  return (
                    <button
                      key={curr.code}
                      type="button"
                      disabled={saving}
                      onClick={() => handleSaveCurrency(curr.code)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {curr.symbol}
                        </span>
                        <span>{curr.name}</span>
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="space-y-1 border-t border-slate-100 pt-2">
            
            {/* Opción 1: Cambiar Nombre */}
            <button
              onClick={handleOpenEditName}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50/80 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-blue-600" />
              <span>Cambiar Nombre de usuario</span>
            </button>

            {/* Opción 2: Cambiar Moneda */}
            <button
              onClick={handleOpenEditCurrency}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition-colors cursor-pointer"
            >
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Cambiar Moneda</span>
            </button>
          </div>

          {/* Opción 3: Cerrar Sesión (Única en el sistema) */}
          <div className="border-t border-slate-100 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}