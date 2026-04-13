import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  FileText, 
  FlaskConical,
  LogOut,
  Shield
} from 'lucide-react';

const Sidebar = ({ onLogout, role = 'user', onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (onOpenChange) {
      onOpenChange(next);
    }
  };

  React.useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
  }, [isOpen, onOpenChange]);

  const menuItems = role === 'admin' ? [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Intelligence', path: '/user-intelligence' },
    { icon: AlertTriangle, label: 'Incident Management', path: '/incident-management' },
    { icon: FileText, label: 'Sensitive Access', path: '/sensitive-access' },
    { icon: FlaskConical, label: 'Threat Simulation', path: '/threat-simulation' },
  ] : [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: AlertTriangle, label: 'Alerts Feed', path: '/user-alerts' },
    { icon: FileText, label: 'File Explorer', path: '/user-file-explorer' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-dark-700 text-white hover:bg-gradient-pink-purple transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-dark-900 border-r border-primary-800 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full pt-20 px-4">
          {/* Logo */}
          <div className="mb-8 flex items-center gap-3">
            <Shield className="text-primary-500" size={32} />
            <h1 className="text-2xl font-bold bg-gradient-pink-purple bg-clip-text text-transparent">
              ALTRIX
            </h1>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-gradient-pink-purple text-white'
                    : 'text-gray-300 hover:bg-dark-700'
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-all mb-4"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Spacer */}
      <div className={`transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-0'}`} />
    </>
  );
};

export default Sidebar;
