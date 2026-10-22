import React, { useState } from 'react';
import DashboardLayout from './components/dashboard/DashboardLayout';
import LoginScreen from './components/LoginScreen';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <DashboardLayout 
      onLogout={() => setIsAuthenticated(false)} 
    />
  );
}
