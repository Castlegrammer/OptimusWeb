import React, { useState } from 'react';
import { X, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLoggedIn(true);
      setTimeout(() => {
        setLoggedIn(false);
        onClose();
        if (onLoginSuccess) onLoginSuccess();
      }, 700);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 max-w-sm w-full relative shadow-xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-lg bg-neutral-950 text-white font-bold flex items-center justify-center text-xs mb-3">
            360
          </div>
          <h3 className="text-xl font-bold tracking-tight text-neutral-950">
            Acceso a Optimus360 Web
          </h3>
          <p className="text-xs text-neutral-500 mt-1">
            Ingresa a tu panel administrativo o terminal web desde cualquier navegador.
          </p>
        </div>

        {loggedIn ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-sm font-bold">
              ✓
            </div>
            <div className="text-sm font-bold text-neutral-900">Sesión iniciada con éxito</div>
            <div className="text-xs text-neutral-500">Cargando módulos y tasas oficiales...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Correo electrónico o teléfono
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@negocio.com"
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-neutral-700">
                  Contraseña
                </label>
                <a
                  href="#recuperar"
                  onClick={(e) => { e.preventDefault(); alert("Te enviaremos un enlace de recuperación a tu correo."); }}
                  className="text-[11px] text-neutral-500 hover:text-neutral-900 transition-colors"
                >
                  ¿La olvidaste?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 transition-all pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-600 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="rounded border-neutral-300 text-neutral-950 focus:ring-neutral-950"
              />
              <label htmlFor="remember" className="select-none cursor-pointer">
                Mantener sesión abierta en este equipo
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Verificando...' : 'Entrar al panel web'}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>
        )}

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-500 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-600" />
          <span>Acceso seguro cifrado con TLS 1.3</span>
        </div>

      </div>
    </div>
  );
}
