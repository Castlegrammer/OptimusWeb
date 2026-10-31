import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginScreen from './components/LoginScreen';
import api from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('optimus360_auth_token', urlToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
      }
    } catch (e) {}
    return api.auth.isAuthenticated();
  });

  const handleLogout = () => {
    api.auth.logout();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <DashboardLayout 
      onLogout={handleLogout} 
    />
  );
}
