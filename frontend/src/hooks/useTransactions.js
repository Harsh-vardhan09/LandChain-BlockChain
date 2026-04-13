import { useState, useCallback } from 'react';
import { transactionsAPI } from '../services/apiService';

export function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination]     = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  // GET /api/transactions
  // query: { page, limit, type, status, landId }
  // returns: { transactions, pagination }
  // Users see only their own. Admin sees all.
  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await transactionsAPI.getAll(params);
      setTransactions(res.data.transactions || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transactions, pagination, loading, error,
    fetchTransactions,
  };
}
