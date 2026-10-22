import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@comercial.ve');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* Brand */}
        <div className="mb-6 text-center">
          <div className="w-10 h-10 rounded-xl bg-neutral-950 text-white font-bold flex items-center justify-center text-sm mx-auto mb-3 shadow-2xs">
            360
          </div>
          <h1 className="text-xl font-bold tracking-tight text-neutral-950">
            Optimus360 Web
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Panel administrativo y terminal de ventas
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-neutral-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 focus:outline-none focus:border-neutral-950"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-neutral-700">Contraseña</label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-[11px] text-neutral-400 hover:text-neutral-900">
                ¿La olvidaste?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-neutral-300 rounded-xl px-3.5 py-2.5 text-neutral-900 pr-9 focus:outline-none focus:border-neutral-950"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 p-1"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-neutral-950 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Acceso seguro protegido con cifrado TLS</span>
        </div>

      </div>
    </div>
  );
}
