import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { initializeContract, getContract } from '../services/contractService';

export const useContract = () => {
  const { signer, isConnected } = useWallet();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isConnected && signer) {
      initializeContractInstance();
    } else {
      setContract(null);
    }
  }, [isConnected, signer]);

  const initializeContractInstance = async () => {
    try {
      setLoading(true);
      setError(null);
      const contractInstance = await initializeContract(signer);
      setContract(contractInstance);
    } catch (err) {
      setError(err.message);
      console.error('Failed to initialize contract:', err);
    } finally {
      setLoading(false);
    }
  };

  const executeTransaction = async (contractFunction, ...args) => {
    if (!contract) {
      throw new Error('Contract not initialized');
    }

    try {
      setLoading(true);
      setError(null);
      const tx = await contractFunction(...args);
      const receipt = await tx.wait();
      return receipt;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    contract,
    loading,
    error,
    executeTransaction,
    isReady: !!contract && isConnected
  };
};