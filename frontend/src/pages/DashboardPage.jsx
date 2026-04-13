import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowRightLeft, Eye, CheckCircle, Clock, Users, FileText, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLands } from '../hooks/useLands';
import { useTransactions } from '../hooks/useTransactions';
import StatCard from '../components/ui/StatCard';
import LandCard from '../components/ui/LandCard';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const DashboardPage = () => {
  const { user, isAdmin, isRegistrar, isInspector } = useAuth();
  const { lands, loading: landsLoading, fetchLands } = useLands();
  const { transactions, loading: transactionsLoading, fetchTransactions } = useTransactions();

  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's own lands from /api/users/my-lands → { lands }
      const myLandsRes = await fetch('/api/users/my-lands', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const myLandsData = await myLandsRes.json();
      // useLands hook: set lands directly
      if (myLandsData.lands) {
        // pass to lands state via hook or set directly
      }

      // Fetch user stats from /api/users/stats
      // returns: { ownedLands, verifiedLands, landsForSale, unreadNotifications }
      const statsRes = await fetch('/api/users/stats', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const statsData = await statsRes.json();
      // Map to the shape the UI expects:
      setStats({
        myLandsCount: statsData.ownedLands || 0,
        pendingTransfersCount: 0,              // not in user stats — leave 0
        recentTransactionsCount: 0,            // not in user stats — leave 0
        // Admin-specific (populated below if admin)
        totalLands: 0,
        pendingVerification: 0,
        pendingTransfers: 0,
        totalUsers: 0,
      });

      // Admin extra: /api/admin/stats
      // returns: { users:{total,verified,unverified}, lands:{total,verified,unverified,forSale}, transactions:{total,pendingTransfers} }
      if (isAdmin) {
        const adminRes = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const adminData = await adminRes.json();
        setStats(prev => ({
          ...prev,
          totalLands:          adminData.lands?.total || 0,
          pendingVerification: adminData.lands?.unverified || 0,
          pendingTransfers:    adminData.transactions?.pendingTransfers || 0,
          totalUsers:          adminData.users?.total || 0,
        }));
        // No /api/admin/recent-activity endpoint exists — use transactions instead
        const txRes = await fetch('/api/transactions?limit=10', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const txData = await txRes.json();
        // Map transactions to activity format the UI expects
        const activities = (txData.transactions || []).map(tx => ({
          description: `${tx.type} — Land #${tx.landId} — ${tx.status}`,
          timestamp: new Date(tx.timestamp).toLocaleString()
        }));
        setRecentActivity(activities);
      }

      // Inspector extra: unverified land count from /api/admin/stats (if inspector)
      if (isInspector && !isAdmin) {
        const adminRes = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const adminData = await adminRes.json();
        setStats(prev => ({
          ...prev,
          landsToVerify: adminData.lands?.unverified || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const renderUserDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <h1 className="text-2xl font-orbitron text-chain-text mb-2">
          Welcome back, {user.name || 'User'}!
        </h1>
        <p className="text-chain-muted mb-4">
          Here's an overview of your land holdings and recent activity.
        </p>
        <StatusBadge status={user.role} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="My Lands"
          value={stats.myLandsCount || 0}
          icon={FileText}
        />
        <StatCard
          title="Pending Transfers"
          value={stats.pendingTransfersCount || 0}
          icon={Clock}
        />
        <StatCard
          title="Recent Transactions"
          value={stats.recentTransactionsCount || 0}
          icon={TrendingUp}
        />
      </div>

      {/* My Lands */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-orbitron text-chain-text">My Lands</h2>
          <Link
            to="/register-land"
            className="flex items-center gap-2 px-4 py-2 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium"
          >
            <Plus size={16} />
            Register Land
          </Link>
        </div>

        {landsLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : lands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lands.slice(0, 6).map((land) => (
              <LandCard
                key={land.id}
                land={land}
                onClick={() => window.location.href = `/lands/${land.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No lands registered yet"
            description="Start by registering your first property on the blockchain."
            action={
              <Link
                to="/register-land"
                className="px-4 py-2 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium"
              >
                Register Your First Land
              </Link>
            }
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/transfer"
          className="bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-chain-cyan/20 rounded-lg flex items-center justify-center">
              <ArrowRightLeft size={24} className="text-chain-cyan" />
            </div>
            <div>
              <h3 className="font-orbitron text-chain-text mb-1">Transfer Land</h3>
              <p className="text-chain-muted text-sm">Initiate a secure land transfer</p>
            </div>
          </div>
        </Link>

        <Link
          to="/explorer"
          className="bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-chain-cyan/20 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-chain-cyan" />
            </div>
            <div>
              <h3 className="font-orbitron text-chain-text mb-1">Explore Lands</h3>
              <p className="text-chain-muted text-sm">Browse available properties</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <h1 className="text-2xl font-orbitron text-chain-text mb-2">
          Admin Dashboard
        </h1>
        <p className="text-chain-muted mb-4">
          Manage the land registry system and oversee all transactions.
        </p>
        <StatusBadge status="admin" />
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Lands"
          value={stats.totalLands || 0}
          icon={FileText}
        />
        <StatCard
          title="Pending Verification"
          value={stats.pendingVerification || 0}
          icon={Clock}
        />
        <StatCard
          title="Pending Transfers"
          value={stats.pendingTransfers || 0}
          icon={ArrowRightLeft}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          icon={Users}
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <h2 className="text-xl font-orbitron text-chain-text mb-4">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-chain-dark rounded-lg">
                <CheckCircle size={16} className="text-chain-green" />
                <div className="flex-1">
                  <p className="text-chain-text text-sm">{activity.description}</p>
                  <p className="text-chain-muted text-xs">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No recent activity"
            description="Activity will appear here as users interact with the system."
          />
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin"
          className="bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-chain-gold/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-chain-gold" />
            </div>
            <div>
              <h3 className="font-orbitron text-chain-text mb-1">Admin Panel</h3>
              <p className="text-chain-muted text-sm">Manage users and verify lands</p>
            </div>
          </div>
        </Link>

        <Link
          to="/transactions"
          className="bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-chain-cyan/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-chain-cyan" />
            </div>
            <div>
              <h3 className="font-orbitron text-chain-text mb-1">Transaction History</h3>
              <p className="text-chain-muted text-sm">View all system transactions</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  const renderInspectorDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <h1 className="text-2xl font-orbitron text-chain-text mb-2">
          Inspector Dashboard
        </h1>
        <p className="text-chain-muted mb-4">
          Review and verify land registrations.
        </p>
        <StatusBadge status="inspector" />
      </div>

      {/* Inspector Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Lands to Verify"
          value={stats.landsToVerify || 0}
          icon={FileText}
        />
        <StatCard
          title="Verified Today"
          value={stats.verifiedToday || 0}
          icon={CheckCircle}
        />
        <StatCard
          title="Verified This Week"
          value={stats.verifiedThisWeek || 0}
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin"
          className="bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-chain-cyan/20 rounded-lg flex items-center justify-center">
              <CheckCircle size={24} className="text-chain-cyan" />
            </div>
            <div>
              <h3 className="font-orbitron text-chain-text mb-1">Verify Lands</h3>
              <p className="text-chain-muted text-sm">Review pending land registrations</p>
            </div>
          </div>
        </Link>

        <Link
          to="/transactions"
          className="bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-chain-gold/20 rounded-lg flex items-center justify-center">
              <Eye size={24} className="text-chain-gold" />
            </div>
            <div>
              <h3 className="font-orbitron text-chain-text mb-1">Verification History</h3>
              <p className="text-chain-muted text-sm">View your verification records</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      {isAdmin ? renderAdminDashboard() :
       isInspector ? renderInspectorDashboard() :
       renderUserDashboard()}
    </div>
  );
};

export default DashboardPage;