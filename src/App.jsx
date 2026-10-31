import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginScreen from './components/LoginScreen';
import api from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(api.auth.isAuthenticated());

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
