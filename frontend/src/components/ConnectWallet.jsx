import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';

export default function ConnectWallet({ className = '' }) {
  const { signIn, logout, isAuthenticated, authError } = useAuth();
  const { account, isConnecting }                      = useWallet();
  const [loading, setLoading]   = useState(false);
  const [localError, setLocalError] = useState('');

  const handleClick = async () => {
    if (isAuthenticated) { logout(); return; }
    setLoading(true);
    setLocalError('');
    try {
      await signIn();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const short = account
    ? `${account.slice(0, 6)}...${account.slice(-4)}`
    : null;

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleClick}
        disabled={loading || isConnecting}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${isAuthenticated
            ? 'bg-green-500/20 border border-green-500 text-green-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400'
            : 'bg-cyan-500/10 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20'
          } disabled:opacity-50 ${className}`}
      >
        <span>🦊</span>
        {(loading || isConnecting) ? 'Connecting...'
          : isAuthenticated ? short
          : 'Connect Wallet'}
      </button>
      {(localError || authError) && (
        <p className="text-red-400 text-xs max-w-xs text-right">
          {localError || authError}
        </p>
      )}
    </div>
  );
}
