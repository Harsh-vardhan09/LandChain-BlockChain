import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Download, Filter, Search, Calendar, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { transactionsAPI } from '../services/apiService';
import AddressChip from '../components/ui/AddressChip';
import StatusBadge from '../components/ui/StatusBadge';
import TxHashLink from '../components/ui/TxHashLink';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const TransactionHistoryPage = () => {
  const { user } = useAuth();
  const { account } = useWallet();
  const [transactions, setTransactions] = useState([]);

  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadTransactions();
  }, [account]);

  useEffect(() => {
    filterAndSortTransactions();
  }, [transactions, searchTerm, statusFilter, typeFilter, dateRange, sortBy, sortOrder]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      // GET /api/transactions?page=1&limit=10&type=&status=
      // returns { transactions, pagination }
      // Note: non-admin users automatically see only their own transactions (backend filters by walletAddress)
      const res = await transactionsAPI.getAll({ page: 1, limit: 100 });
      setTransactions(res.data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.landId && tx.landId.toString().includes(searchTerm)) ||
        (tx.from && tx.from.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.to && tx.to.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(tx => new Date(tx.timestamp) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(tx => new Date(tx.timestamp) <= endDate);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'timestamp') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredTransactions(filtered);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Status', 'Land ID', 'From', 'To', 'Transaction Hash'];
    const csvData = filteredTransactions.map(tx => [
      format(new Date(tx.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      tx.type,
      tx.status,
      tx.landId || '',
      tx.from || '',
      tx.to || '',
      tx.txHash
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'registration':
        return '📝';
      case 'transfer':
        return '↔️';
      case 'verification':
        return '✅';
      case 'rejection':
        return '❌';
      default:
        return '🔗';
    }
  };

  const getTransactionDescription = (tx) => {
    switch (tx.type) {
      case 'registration':
        return `Land ${tx.landId} registered`;
      case 'transfer':
        return `Land ${tx.landId} transferred`;
      case 'verification':
        return `Land ${tx.landId} verified`;
      case 'rejection':
        return `Transfer for land ${tx.landId} rejected`;
      default:
        return tx.type;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-chain-text mb-2">Transaction History</h1>
        <p className="text-chain-muted">View and filter your blockchain transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-chain-muted w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
          >
            <option value="all">All Types</option>
            <option value="registration">Registration</option>
            <option value="transfer">Transfer</option>
            <option value="verification">Verification</option>
            <option value="rejection">Rejection</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Date Range */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm text-chain-muted mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-chain-muted mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-chain-panel border border-chain-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-chain-dark">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('timestamp')}
                      className="flex items-center gap-2 text-chain-text font-medium hover:text-chain-cyan transition-colors"
                    >
                      Date
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('type')}
                      className="flex items-center gap-2 text-chain-text font-medium hover:text-chain-cyan transition-colors"
                    >
                      Type
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-chain-border">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-chain-dark transition-colors">
                    <td className="px-6 py-4 text-chain-text">
                      {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTransactionIcon(tx.type)}</span>
                        <span className="text-chain-text capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-chain-text">
                      {getTransactionDescription(tx)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4">
                      <TxHashLink hash={tx.txHash} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No transactions found"
          description="Try adjusting your filters or check back later for new transactions."
        />
      )}

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
          <div className="text-2xl font-orbitron text-chain-cyan mb-2">
            {filteredTransactions.length}
          </div>
          <div className="text-chain-muted">Total Transactions</div>
        </div>
        <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
          <div className="text-2xl font-orbitron text-chain-green mb-2">
            {filteredTransactions.filter(tx => tx.status === 'success').length}
          </div>
          <div className="text-chain-muted">Successful</div>
        </div>
        <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
          <div className="text-2xl font-orbitron text-chain-yellow mb-2">
            {filteredTransactions.filter(tx => tx.status === 'pending').length}
          </div>
          <div className="text-chain-muted">Pending</div>
        </div>
        <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
          <div className="text-2xl font-orbitron text-chain-red mb-2">
            {filteredTransactions.filter(tx => tx.status === 'failed').length}
          </div>
          <div className="text-chain-muted">Failed</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryPage;