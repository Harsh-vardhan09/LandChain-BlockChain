import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { authAPI } from '../services/apiService';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const { account, connectWallet, signMessage, disconnect } = useWallet();
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore session from localStorage on page load
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser  = localStorage.getItem('user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Silently verify token is still valid
        // /api/auth/me returns flat object: { walletAddress, name, email, role, isVerified, ... }
        authAPI.getMe()
          .then(res => {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          })
          .catch(() => _logout());
      } catch {
        _logout();
      }
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async () => {
    setAuthError(null);
    try {
      // 1. Connect wallet if needed
      let address = account;
      if (!address) {
        address = await connectWallet();
        if (!address) throw new Error('Wallet connection cancelled');
      }

      // 2. Sign message
      const message = `Welcome to LandChain!\n\nWallet: ${address}\nTimestamp: ${Date.now()}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
      const signature = await signMessage(message);

      // 3. POST /api/auth/connect-wallet
      // Backend returns: { token, user: { walletAddress, role, isVerified } }
      const res = await authAPI.connectWallet(address, signature, message);
      const { token: newToken, user: newUser } = res.data;

      // 4. Persist
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Sign in failed';
      setAuthError(msg);
      throw new Error(msg);
    }
  }, [account, connectWallet, signMessage]);

  const _logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    disconnect();
  }, [disconnect]);

  // Role helpers — backend uses user.role (string) and user.roles (array)
  // Handle both shapes safely
  const hasRole = (role) => {
    if (!user) return false;
    if (user.role === role) return true;
    if (Array.isArray(user.roles) && user.roles.includes(role)) return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, authError,
      signIn,
      logout: _logout,
      isAuthenticated: !!token && !!user,
      isAdmin:      hasRole('admin'),
      isRegistrar:  hasRole('registrar') || hasRole('admin'),
      isInspector:  hasRole('inspector') || hasRole('admin'),
      role: user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null) || 'user',
    }}>
      {children}
    </AuthContext.Provider>
  );
}