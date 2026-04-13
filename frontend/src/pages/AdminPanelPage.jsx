import React, { useState, useEffect } from 'react';
import { BarChart3, Users, MapPin, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, transfersAPI, transactionsAPI } from '../services/apiService';
import StatusBadge from '../components/ui/StatusBadge';
import AddressChip from '../components/ui/AddressChip';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LandCard from '../components/ui/LandCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminPanelPage = () => {
  const { user, isAdmin } = useAuth();
  const [lands, setLands] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalLands: 0,
    verifiedLands: 0,
    pendingLands: 0,
    totalUsers: 0,
    totalTransactions: 0,
    monthlyGrowth: 0
  });

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      // GET /api/admin/stats → { users:{total,verified,unverified}, lands:{total,verified,unverified,forSale}, transactions:{total,pendingTransfers} }
      const statsRes = await adminAPI.getStats();
      const adminStats = statsRes.data;
      
      // GET /api/admin/lands?verified=false
      const landsRes = await adminAPI.getLands({ verified: false });
      setLands(landsRes.data.lands || []);
      
      // GET /api/transfers/pending
      const transfersRes = await transfersAPI.getPending();
      setTransfers(transfersRes.data.transfers || []);

      const txRes = await transactionsAPI.getAll();

      // ✅ MAP BACKEND → FRONTEND SAFE FORMAT
      const formattedTx = (txRes.data.transactions || []).map(tx => ({
        id: tx._id || tx.id,
        type: tx.type || tx.transactionType || 'verification',
        timestamp: tx.timestamp || tx.createdAt,
        landId: tx.landId || tx.land?._id || 'N/A',
        status: tx.status || 'completed'
      }));

      setTransactions(formattedTx);


      setStats({
        totalLands:        adminStats.lands?.total || 0,
        verifiedLands:     adminStats.lands?.verified || 0,
        pendingLands:      adminStats.lands?.unverified || 0,
        totalUsers:        adminStats.users?.total || 0,
        totalTransactions: adminStats.transactions?.total || 0,
        monthlyGrowth:     12.5 // mock
      });
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLand = async (landId) => {
    try {
      setLoading(true);
      // PUT /api/admin/lands/:landId/verify
      await adminAPI.verifyLand(landId);
      loadAdminData();
    } catch (error) {
      console.error('Failed to verify land:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransfer = async (requestId) => {
    try {
      setLoading(true);
      // POST /api/transfers/:requestId/approve
      await transfersAPI.approve(requestId);
      loadAdminData();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTransfer = async (requestId, reason) => {
    try {
      setLoading(true);
      // POST /api/transfers/:requestId/reject  body: { reason }
      await transfersAPI.reject(requestId, reason);
      loadAdminData();
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewTab = () => {
    const chartData = [
      { name: 'Verified', value: stats.verifiedLands, color: '#00D4FF' },
      { name: 'Pending', value: stats.pendingLands, color: '#FFD700' },
      { name: 'Rejected', value: lands.filter(land => land.status === 'rejected').length, color: '#FF6B6B' }
    ];

    const monthlyData = [
      { month: 'Jan', lands: 12, transactions: 8 },
      { month: 'Feb', lands: 19, transactions: 12 },
      { month: 'Mar', lands: 15, transactions: 15 },
      { month: 'Apr', lands: 25, transactions: 18 },
      { month: 'May', lands: 22, transactions: 22 },
      { month: 'Jun', lands: stats.totalLands, transactions: stats.totalTransactions }
    ];

    return (
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <MapPin className="w-8 h-8 text-chain-cyan" />
              <TrendingUp className="w-5 h-5 text-chain-green" />
            </div>
            <div className="text-2xl font-orbitron text-chain-cyan mb-1">{stats.totalLands}</div>
            <div className="text-chain-muted text-sm">Total Lands</div>
            <div className="text-chain-green text-xs mt-1">+{stats.monthlyGrowth}% this month</div>
          </div>

          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <CheckCircle className="w-8 h-8 text-chain-green" />
            </div>
            <div className="text-2xl font-orbitron text-chain-green mb-1">{stats.verifiedLands}</div>
            <div className="text-chain-muted text-sm">Verified Lands</div>
            <div className="text-chain-green text-xs mt-1">
              {stats.totalLands > 0 ? Math.round((stats.verifiedLands / stats.totalLands) * 100) : 0}% of total
            </div>
          </div>

          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="w-8 h-8 text-chain-yellow" />
            </div>
            <div className="text-2xl font-orbitron text-chain-yellow mb-1">{stats.pendingLands}</div>
            <div className="text-chain-muted text-sm">Pending Verification</div>
            <div className="text-chain-yellow text-xs mt-1">Requires attention</div>
          </div>

          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-chain-purple" />
            </div>
            <div className="text-2xl font-orbitron text-chain-purple mb-1">{stats.totalUsers}</div>
            <div className="text-chain-muted text-sm">Active Users</div>
            <div className="text-chain-purple text-xs mt-1">Unique landowners</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Land Status Distribution */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-xl font-orbitron text-chain-text mb-6">Land Status Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-chain-text text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Activity */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-xl font-orbitron text-chain-text mb-6">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="lands" fill="#00D4FF" name="Lands Registered" />
                <Bar dataKey="transactions" fill="#FFD700" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
          <h3 className="text-xl font-orbitron text-chain-text mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {(transactions||[]).slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3 border-b border-chain-border last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-chain-cyan rounded-full flex items-center justify-center text-sm">
                    {tx.type === 'registration' ? '📝' : tx.type === 'transfer' ? '↔️' : '✅'}
                  </div>
                  <div>
                    <p className="text-chain-text font-medium">
                      {tx.type === 'registration' ? 'Land Registration' :
                       tx.type === 'transfer' ? 'Land Transfer' : 'Land Verification'}
                    </p>
                    <p className="text-chain-muted text-sm">
                      {new Date(tx.timestamp).toLocaleDateString()} • Land #{tx.landId}
                    </p>
                  </div>
                </div>
                <StatusBadge status={tx.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderVerifyLandsTab = () => {
    const pendingLands = lands.filter(land => !land.isVerified && land.status !== 'rejected');

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-orbitron text-chain-text">Pending Land Verifications</h3>
          <p className="text-chain-muted">Review and verify land registration requests</p>
        </div>

        {pendingLands.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingLands.map((land) => (
              <div key={land.id} className="bg-chain-panel border border-chain-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron text-chain-text">Land #{land.id}</h4>
                  <StatusBadge status="pending" />
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <span className="text-chain-muted">Owner:</span>
                    <AddressChip address={land.owner} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-chain-muted">Title:</span>
                    <p className="text-chain-text mt-1">{land.title}</p>
                  </div>
                  <div>
                    <span className="text-chain-muted">Area:</span>
                    <p className="text-chain-text mt-1">{land.areaSqFt} sq ft</p>
                  </div>
                  <div>
                    <span className="text-chain-muted">Location:</span>
                    <p className="text-chain-text mt-1">{land.location}</p>
                  </div>
                  <div>
                    <span className="text-chain-muted">Submitted:</span>
                    <p className="text-chain-text mt-1">
                      {new Date(land.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerifyLand(land.id)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-chain-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Verify Land
                  </button>
                  <button
                    onClick={() => handleRejectLand(land.id, 'Administrative review required')}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-chain-red text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-chain-green mx-auto mb-4" />
            <h3 className="text-xl font-orbitron text-chain-text mb-2">All Caught Up!</h3>
            <p className="text-chain-muted">No pending land verifications at this time.</p>
          </div>
        )}
      </div>
    );
  };

  const renderTransfersTab = () => {
    // Mock transfer requests - in real app this would come from API
    const transferRequests = [
      {
        id: 1,
        landId: 101,
        from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        to: '0x8ba1f109551bD432803012645261768497dD6610',
        reason: 'Property sale',
        status: 'pending',
        requestedAt: new Date(Date.now() - 86400000)
      },
      {
        id: 2,
        landId: 102,
        from: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        to: '0x8ba1f109551bD432803012645261768497dD6610',
        reason: 'Inheritance transfer',
        status: 'approved',
        requestedAt: new Date(Date.now() - 172800000)
      }
    ];

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-orbitron text-chain-text">Transfer Requests</h3>
          <p className="text-chain-muted">Manage land transfer approvals</p>
        </div>

        {transferRequests.length > 0 ? (
          <div className="space-y-4">
            {transferRequests.map((request) => (
              <div key={request.id} className="bg-chain-panel border border-chain-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron text-chain-text">Transfer Request #{request.id}</h4>
                  <StatusBadge status={request.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-chain-muted">Land ID:</span>
                    <p className="text-chain-text mt-1">#{request.landId}</p>
                  </div>
                  <div>
                    <span className="text-chain-muted">Requested:</span>
                    <p className="text-chain-text mt-1">{request.requestedAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-chain-muted">From:</span>
                    <AddressChip address={request.from} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-chain-muted">To:</span>
                    <AddressChip address={request.to} className="mt-1" />
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-chain-muted">Reason:</span>
                  <p className="text-chain-text mt-1">{request.reason}</p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      disabled={loading}
                      className="px-4 py-2 bg-chain-green text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      disabled={loading}
                      className="px-4 py-2 bg-chain-red text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 text-chain-yellow mx-auto mb-4" />
            <h3 className="text-xl font-orbitron text-chain-text mb-2">No Transfer Requests</h3>
            <p className="text-chain-muted">No pending transfer requests to review.</p>
          </div>
        )}
      </div>
    );
  };

  const renderUsersTab = () => {
    // Mock users data - in real app this would come from API
    const users = [
      {
        id: 1,
        address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
        name: 'John Doe',
        role: 'user',
        landsCount: 3,
        isActive: true,
        joinedAt: new Date(Date.now() - 2592000000)
      },
      {
        id: 2,
        address: '0x8ba1f109551bD432803012645261768497dD6610',
        name: 'Jane Smith',
        role: 'registrar',
        landsCount: 0,
        isActive: true,
        joinedAt: new Date(Date.now() - 5184000000)
      }
    ];

    return (
      <div>
        <div className="mb-6">
          <h3 className="text-xl font-orbitron text-chain-text">User Management</h3>
          <p className="text-chain-muted">Manage user accounts and permissions</p>
        </div>

        <div className="bg-chain-panel border border-chain-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-chain-dark">
                <tr>
                  <th className="px-6 py-4 text-left text-chain-text font-medium">User</th>
                  <th className="px-6 py-4 text-left text-chain-text font-medium">Role</th>
                  <th className="px-6 py-4 text-left text-chain-text font-medium">Lands</th>
                  <th className="px-6 py-4 text-left text-chain-text font-medium">Status</th>
                  <th className="px-6 py-4 text-left text-chain-text font-medium">Joined</th>
                  <th className="px-6 py-4 text-left text-chain-text font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chain-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-chain-dark transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-chain-text font-medium">{user.name}</p>
                        <AddressChip address={user.address} className="mt-1 scale-90" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        user.role === 'admin' ? 'bg-chain-red text-white' :
                        user.role === 'registrar' ? 'bg-chain-cyan text-black' :
                        user.role === 'inspector' ? 'bg-chain-yellow text-black' :
                        'bg-chain-green text-black'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-chain-text">{user.landsCount}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-6 py-4 text-chain-text">
                      {user.joinedAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-chain-cyan hover:text-cyan-600 transition-colors text-sm">
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-chain-red mx-auto mb-4" />
        <h1 className="text-2xl font-orbitron text-chain-text mb-2">Access Denied</h1>
        <p className="text-chain-muted">You don't have permission to access the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-chain-text mb-2">Admin Panel</h1>
        <p className="text-chain-muted">Manage the land registry system</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-chain-border mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('verify')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'verify'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Verify Lands ({lands.filter(land => !land.isVerified).length})
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transfers'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Transfers
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'users'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <Users className="w-4 h-4" />
          Users
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'verify' && renderVerifyLandsTab()}
          {activeTab === 'transfers' && renderTransfersTab()}
          {activeTab === 'users' && renderUsersTab()}
        </>
      )}
    </div>
  );
};

export default AdminPanelPage;