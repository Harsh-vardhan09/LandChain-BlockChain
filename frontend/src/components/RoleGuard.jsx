import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

/**
 * RoleRoute component that restricts access based on user roles
 * Redirects to dashboard if user doesn't have required role
 */
const RoleRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAdmin, isRegistrar, isInspector } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const hasAccess = allowedRoles.some(role => {
    switch (role) {
      case 'admin': return isAdmin;
      case 'registrar': return isRegistrar;
      case 'inspector': return isInspector;
      case 'user': return true; // Any authenticated user
      default: return false;
    }
  });

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * RoleGuard component that conditionally renders content based on user role
 */
export const RoleGuard = ({ children, allowedRoles = [], fallback = null }) => {
  const { user, isAdmin, isRegistrar, isInspector } = useAuth();

  if (!user) return fallback;

  const hasAccess = allowedRoles.some(role => {
    switch (role) {
      case 'admin': return isAdmin;
      case 'registrar': return isRegistrar;
      case 'inspector': return isInspector;
      case 'user': return true;
      default: return false;
    }
  });

  return hasAccess ? children : fallback;
};

export default RoleRoute;
