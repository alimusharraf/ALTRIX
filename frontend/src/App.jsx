import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import UserAlerts from './pages/UserAlerts';
import UserFileExplorer from './pages/UserFileExplorer';
import AdminDashboard from './pages/AdminDashboard';
import UserIntelligence from './pages/UserIntelligence';
import IncidentManagement from './pages/IncidentManagement';
import SensitiveAccessControl from './pages/SensitiveAccessControl';
import ThreatSimulation from './pages/ThreatSimulation';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('altrix_user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored user session:', error);
      return null;
    }
  });

  const isUserRole = user?.role?.toLowerCase() === 'user';
  const isAdminRole = user?.role?.toLowerCase() === 'admin';

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('altrix_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('altrix_user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/dashboard" 
          element={
            isUserRole ? (
              <UserDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route
          path="/user-alerts"
          element={
            isUserRole ? (
              <UserAlerts user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/user-file-explorer"
          element={
            isUserRole ? (
              <UserFileExplorer user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route 
          path="/admin" 
          element={
            isAdminRole ? (
              <AdminDashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/user-intelligence" 
          element={
            isAdminRole ? (
              <UserIntelligence user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/incident-management" 
          element={
            isAdminRole ? (
              <IncidentManagement user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/sensitive-access" 
          element={
            isAdminRole ? (
              <SensitiveAccessControl user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/threat-simulation" 
          element={
            isAdminRole ? (
              <ThreatSimulation user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
