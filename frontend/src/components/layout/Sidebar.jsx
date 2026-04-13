import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Map,
  FileText,
  ArrowRightLeft,
  History,
  User,
  Settings,
  Shield,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const Sidebar = () => {
  const { user, isAdmin, isRegistrar, isInspector } = useAuth();
  const { unreadCount } = useNotifications();

  const navigationItems = [
    { to: '/', label: 'Home', icon: Home, public: true },
    { to: '/dashboard', label: 'Dashboard', icon: Settings, requiresAuth: true },
    { to: '/explorer', label: 'Land Explorer', icon: Map, public: true },
    { to: '/register-land', label: 'Register Land', icon: FileText, roles: ['registrar', 'admin'] },
    { to: '/transfer', label: 'Transfer Land', icon: ArrowRightLeft, requiresAuth: true },
    { to: '/transactions', label: 'Transaction History', icon: History, requiresAuth: true },
    { to: '/profile', label: 'Profile', icon: User, requiresAuth: true },
    { to: '/admin', label: 'Admin Panel', icon: Shield, roles: ['admin'] },
  ];

  const canAccessItem = (item) => {
    if (item.public) return true;
    if (item.requiresAuth && !user) return false;
    if (item.roles && !item.roles.some(role => {
      if (role === 'admin') return isAdmin;
      if (role === 'registrar') return isRegistrar;
      if (role === 'inspector') return isInspector;
      return false;
    })) return false;
    return true;
  };

  return (
    <div className="w-64 bg-chain-dark border-r border-chain-border h-full overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-orbitron text-chain-cyan mb-8">LandChain</h1>

        <nav className="space-y-2">
          {navigationItems
            .filter(canAccessItem)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-chain-cyan text-chain-dark font-medium'
                      : 'text-chain-text hover:bg-chain-panel hover:text-chain-cyan'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.to === '/profile' && unreadCount > 0 && (
                  <span className="ml-auto bg-chain-red text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;