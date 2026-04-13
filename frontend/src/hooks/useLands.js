import { useState, useCallback } from 'react';
import { landsAPI, usersAPI } from '../services/apiService';

export function useLands() {
  const [lands, setLands]         = useState([]);
  const [land, setLand]           = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  // GET /api/lands?owner=&verified=&forSale=&page=&limit=
  // returns { lands, pagination }
  const fetchLands = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await landsAPI.getAll(params);
      setLands(res.data.lands || []);
      setPagination(res.data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // GET /api/lands/:landId
  // returns { land, owner, transactions }
  const fetchLandById = useCallback(async (landId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await landsAPI.getById(landId);
      setLand(res.data.land);
      return res.data; // { land, owner, transactions }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // GET /api/users/my-lands
  // returns { lands }
  const fetchMyLands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await usersAPI.getMyLands();
      setLands(res.data.lands || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    lands, land, pagination, loading, error,
    fetchLands, fetchLandById, fetchMyLands,
  };
}