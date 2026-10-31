import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginScreen from './components/LoginScreen';
import api from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => api.auth.getUser());

  useEffect(() => {
    async function checkAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
          localStorage.setItem('optimus360_auth_token', urlToken);
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        const token = api.auth.getToken();
        if (!token) {
          setIsAuthenticated(false);
          setCurrentUser(null);
          setIsChecking(false);
          return;
        }

        // Si ya hay usuario en cache / token decodificado, cargarlo de inmediato
        const cachedUser = api.auth.getUser();
        if (cachedUser) {
          setCurrentUser(cachedUser);
        }

        // Validar token y usuario directamente con la base de datos a través de la API
        const user = await api.auth.verifySession();
        if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
        } else if (cachedUser) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (err) {
        if (!api.auth.getToken()) {
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkAuth();
  }, []);

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = (user) => {
    const activeUser = user || api.auth.getUser();
    setCurrentUser(activeUser);
    setIsAuthenticated(true);
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 text-white font-extrabold flex items-center justify-center text-base shadow-md shadow-blue-500/25">
            360
          </div>
          <div className="flex items-center gap-2 text-slate-600 text-xs font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Validando sesión...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <DashboardLayout 
      user={currentUser}
      onLogout={handleLogout} 
    />
  );
}
