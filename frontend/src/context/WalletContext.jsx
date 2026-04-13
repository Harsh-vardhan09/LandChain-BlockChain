import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);
export const useWallet = () => useContext(WalletContext);

export function WalletProvider({ children }) {
  const [account, setAccount]         = useState(null);
  const [provider, setProvider]       = useState(null);
  const [signer, setSigner]           = useState(null);
  const [chainId, setChainId]         = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Auto-reconnect if already authorized
  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then(accounts => {
      if (accounts.length > 0) _init(accounts[0]);
    });
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) _disconnect();
      else _init(accounts[0]);
    });
    window.ethereum.on('chainChanged', () => window.location.reload());
  }, []);

  const _init = async (address) => {
    const p = new ethers.BrowserProvider(window.ethereum);
    const s = await p.getSigner();
    const n = await p.getNetwork();
    setProvider(p);
    setSigner(s);
    setAccount(address.toLowerCase());
    setChainId(Number(n.chainId));
  };

  const _disconnect = () => {
    setAccount(null); setProvider(null);
    setSigner(null); setChainId(null);
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setWalletError('MetaMask not found. Install from metamask.io');
      return null;
    }
    setIsConnecting(true);
    setWalletError(null);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await _init(accounts[0]);
      return accounts[0].toLowerCase();
    } catch (err) {
      setWalletError(err.message);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Sign a message for auth
  const signMessage = useCallback(async (message) => {
    if (!signer) throw new Error('Wallet not connected');
    return await signer.signMessage(message);
  }, [signer]);

  return (
    <WalletContext.Provider value={{
      account, provider, signer, chainId,
      isConnecting, walletError,
      isConnected: !!account,
      connectWallet,
      disconnect: _disconnect,
      signMessage,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
