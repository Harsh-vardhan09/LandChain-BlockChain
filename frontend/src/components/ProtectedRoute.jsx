import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

/**
 * ProtectedRoute component that restricts access to authenticated users
 */
const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isConnected || !user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
