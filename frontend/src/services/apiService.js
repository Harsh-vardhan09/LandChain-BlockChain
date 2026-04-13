import axios from 'axios';

const api = axios.create({
  baseURL: '/api',       // Vite proxy → http://localhost:3000/api
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // key: 'token'
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/') window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
// POST /api/auth/connect-wallet  body: { walletAddress, signature, message }
// returns: { token, user: { walletAddress, role, isVerified } }
export const authAPI = {
  connectWallet: (walletAddress, signature, message) =>
    api.post('/auth/connect-wallet', { walletAddress, signature, message }),
  // GET /api/auth/me  returns flat user object (no wrapper)
  getMe: () => api.get('/auth/me'),
};

// ── Lands ─────────────────────────────────────────────────────────────────────
// GET /api/lands  query: { owner, verified, forSale, type, district, page, limit }
// returns: { lands, pagination }
// GET /api/lands/:landId  returns: { land, owner, transactions }
// POST /api/lands/register  multipart/form-data  roles: registrar
// POST /api/lands/:landId/verify  roles: inspector
// POST /api/lands/:landId/list-for-sale  body: { priceInEth }
// POST /api/lands/:landId/delist
export const landsAPI = {
  getAll:      (params) => api.get('/lands', { params }),
  getById:     (landId) => api.get(`/lands/${landId}`),
  register:    (formData) => api.post('/lands/register', formData, {
                               headers: { 'Content-Type': 'multipart/form-data' }
                             }),
  verify:      (landId) => api.post(`/lands/${landId}/verify`),
  listForSale: (landId, priceInEth) =>
                 api.post(`/lands/${landId}/list-for-sale`, { priceInEth }),
  delist:      (landId) => api.post(`/lands/${landId}/delist`),
};

// ── Users ─────────────────────────────────────────────────────────────────────
// GET /api/users/profile  returns: { user }
// PUT /api/users/profile  body: { name, email, phone, address }
// GET /api/users/my-lands  returns: { lands }
// GET /api/users/stats  returns: { ownedLands, verifiedLands, landsForSale, unreadNotifications }
// GET /api/users/notifications  query: { page, limit, unreadOnly }
// PUT /api/users/notifications/read-all
// PUT /api/users/notifications/:id/read
// DELETE /api/users/notifications/:id
export const usersAPI = {
  getProfile:      () => api.get('/users/profile'),
  updateProfile:   (data) => api.put('/users/profile', data),
  getMyLands:      () => api.get('/users/my-lands'),
  getStats:        () => api.get('/users/stats'),
  getNotifications:(params) => api.get('/users/notifications', { params }),
  markAllRead:     () => api.put('/users/notifications/read-all'),
  markOneRead:     (id) => api.put(`/users/notifications/${id}/read`),
  deleteNotif:     (id) => api.delete(`/users/notifications/${id}`),
};

// ── Transfers ─────────────────────────────────────────────────────────────
// POST /api/transfers/request  body: { landId, toAddress, reason }
// POST /api/transfers/:requestId/approve  roles: admin
// POST /api/transfers/:requestId/reject  body: { reason }  roles: admin
// GET /api/transfers/pending  roles: admin  returns: { transfers }
// GET /api/transfers/my-requests  returns: { requests }
export const transfersAPI = {
  request:       (landId, toAddress, reason) =>
                   api.post('/transfers/request', { landId, toAddress, reason }),
  approve:       (requestId) => api.post(`/transfers/${requestId}/approve`),
  reject:        (requestId, reason) =>
                   api.post(`/transfers/${requestId}/reject`, { reason }),
  getPending:    () => api.get('/transfers/pending'),
  getMyRequests: () => api.get('/transfers/my-requests'),
};

// ── Transactions ──────────────────────────────────────────────────────────────
// GET /api/transactions  query: { page, limit, type, status, landId }
// returns: { transactions, pagination }
// Users see only their own. Admin sees all.
// GET /api/transactions/:txHash  returns: { transaction }
// GET /api/transactions/stats/summary  roles: admin
export const transactionsAPI = {
  getAll:    (params) => api.get('/transactions', { params }),
  getByHash: (txHash) => api.get(`/transactions/${txHash}`),
  getSummary:() => api.get('/transactions/stats/summary'),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
// GET /api/admin/stats  roles: admin
// returns: { users:{total,verified,unverified}, lands:{total,verified,unverified,forSale}, transactions:{total,pendingTransfers} }
// GET /api/admin/users  query: { page, limit, role, verified }  returns: { users, pagination }
// PUT /api/admin/users/:walletAddress/verify
// PUT /api/admin/users/:walletAddress/role  body: { role, action:'add'|'remove' }
// GET /api/admin/lands  query: { page, limit, verified, forSale }  returns: { lands, pagination }
// PUT /api/admin/lands/:landId/verify
// DELETE /api/admin/users/:walletAddress
export const adminAPI = {
  getStats:      () => api.get('/admin/stats'),
  getUsers:      (params) => api.get('/admin/users', { params }),
  verifyUser:    (walletAddress) => api.put(`/admin/users/${walletAddress}/verify`),
  updateRole:    (walletAddress, role, action) =>
                   api.put(`/admin/users/${walletAddress}/role`, { role, action }),
  deleteUser:    (walletAddress) => api.delete(`/admin/users/${walletAddress}`),
  getLands:      (params) => api.get('/admin/lands', { params }),
  verifyLand:    (landId) => api.put(`/admin/lands/${landId}/verify`),
};
