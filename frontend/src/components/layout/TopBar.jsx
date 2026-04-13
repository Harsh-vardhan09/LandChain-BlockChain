import React from 'react';
import { Bell, Wallet } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import ConnectWallet from '../ConnectWallet';
import StatusBadge from '../ui/StatusBadge';

const TopBar = () => {
  const { account, isConnected, chainId } = useWallet();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case '0x7a69': return 'Hardhat';
      case '0xaa36a7': return 'Sepolia';
      default: return 'Unknown';
    }
  };

  return (
    <div className="h-16 bg-chain-panel border-b border-chain-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-chain-text">Welcome,</span>
            <StatusBadge status={user.role} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {isConnected && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-chain-green rounded-full"></div>
            <span className="text-chain-muted">{getNetworkName(chainId)}</span>
          </div>
        )}

        {user && (
          <button className="relative p-2 text-chain-muted hover:text-chain-cyan transition-colors">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-chain-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        )}

        <ConnectWallet />
      </div>
    </div>
  );
};

export default TopBar;