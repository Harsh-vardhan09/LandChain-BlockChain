import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { transfersAPI, usersAPI } from '../services/apiService';
import AddressChip from '../components/ui/AddressChip';
import StatusBadge from '../components/ui/StatusBadge';
import TxHashLink from '../components/ui/TxHashLink';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const TransferPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedLandId = searchParams.get('landId');

  const { user, isAdmin } = useAuth();
  const { account } = useWallet();
  const [myLands, setMyLands] = useState([]);
  const [transferRequests, setTransferRequests] = useState({
    outgoing: [],
    pending: []
  });

  const [activeTab, setActiveTab] = useState('initiate');
  const [transferData, setTransferData] = useState({
    landId: preselectedLandId || '',
    recipientAddress: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // GET /api/users/my-lands → { lands }
      const landsRes = await usersAPI.getMyLands();
      setMyLands(landsRes.data.lands || []);

      // GET /api/transfers/my-requests → { requests }
      const myReqsRes = await transfersAPI.getMyRequests();
      
      // GET /api/transfers/pending → { transfers } — admin only
      let adminTransfers = [];
      if (isAdmin) {
        const pendingRes = await transfersAPI.getPending();
        adminTransfers = pendingRes.data.transfers || [];
      }

      setTransferRequests({
        outgoing: myReqsRes.data.requests || [],
        pending: adminTransfers
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const handleInitiateTransfer = async () => {
    try {
      setLoading(true);
      // POST /api/transfers/request  body: { landId, toAddress, reason }
      const res = await transfersAPI.request(
        parseInt(transferData.landId),
        transferData.recipientAddress,
        transferData.reason
      );
      console.log('Transfer request created:', res.data);

      // Reset form and reload
      setTransferData({ landId: '', recipientAddress: '', reason: '' });
      setActiveTab('pending');
      loadUserData();
    } catch (error) {
      console.error('Failed to initiate transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransfer = async (requestId) => {
    try {
      setLoading(true);
      // POST /api/transfers/:requestId/approve
      await transfersAPI.approve(requestId);
      loadUserData();
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectTransfer = async () => {
    try {
      setLoading(true);
      // POST /api/transfers/:requestId/reject  body: { reason }
      await transfersAPI.reject(selectedRequest.id, rejectReason);
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectReason('');
      loadUserData();
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLandTitle = (landId) => {
    const land = [...myLands].find(l => l.id === landId);
    return land?.title || `Land ${landId}`;
  };

  const renderInitiateTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-chain-text font-medium mb-2">Select Your Land</label>
        <select
          value={transferData.landId}
          onChange={(e) => setTransferData(prev => ({ ...prev, landId: e.target.value }))}
          className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
        >
          <option value="">Choose a land parcel</option>
          {myLands.map((land) => (
            <option key={land.id} value={land.id}>
              {land.title} - {land.areaSqFt} sq ft
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-chain-text font-medium mb-2">Recipient Wallet Address</label>
        <input
          type="text"
          value={transferData.recipientAddress}
          onChange={(e) => setTransferData(prev => ({ ...prev, recipientAddress: e.target.value }))}
          className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan font-mono"
          placeholder="0x..."
        />
      </div>

      <div>
        <label className="block text-chain-text font-medium mb-2">Reason for Transfer</label>
        <textarea
          value={transferData.reason}
          onChange={(e) => setTransferData(prev => ({ ...prev, reason: e.target.value }))}
          className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan resize-none"
          rows={4}
          placeholder="Enter the reason for this transfer"
        />
      </div>

      {transferData.landId && transferData.recipientAddress && (
        <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
          <h3 className="text-lg font-orbitron text-chain-text mb-4">Transfer Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-chain-muted">Land:</span>
              <span className="text-chain-text">{getLandTitle(transferData.landId)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-chain-muted">From:</span>
              <AddressChip address={account} className="scale-90" />
            </div>
            <div className="flex justify-between">
              <span className="text-chain-muted">To:</span>
              <AddressChip address={transferData.recipientAddress} className="scale-90" />
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleInitiateTransfer}
        disabled={loading || !transferData.landId || !transferData.recipientAddress}
        className="w-full px-6 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-orbitron font-medium disabled:opacity-50"
      >
        {loading ? 'Requesting Transfer...' : 'Request Transfer'}
      </button>
    </div>
  );

  const renderPendingTab = () => (
    <div className="space-y-8">
      {/* Requests I Made */}
      <div>
        <h3 className="text-xl font-orbitron text-chain-text mb-4">Requests I Made</h3>
        {transferRequests.outgoing.length > 0 ? (
          <div className="space-y-4">
            {transferRequests.outgoing.map((request) => (
              <div key={request.id} className="bg-chain-panel border border-chain-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron text-chain-text">{getLandTitle(request.landId)}</h4>
                  <StatusBadge status={request.status} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-chain-muted">To:</span>
                    <AddressChip address={request.to} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-chain-muted">Requested:</span>
                    <p className="text-chain-text">{new Date(request.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {request.reason && (
                  <div className="mb-4">
                    <span className="text-chain-muted">Reason:</span>
                    <p className="text-chain-text mt-1">{request.reason}</p>
                  </div>
                )}
                {request.txHash && <TxHashLink hash={request.txHash} />}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-chain-muted">No outgoing transfer requests</p>
        )}
      </div>

      {/* Requests For My Lands */}
      <div>
        <h3 className="text-xl font-orbitron text-chain-text mb-4">Requests For My Lands</h3>
        {transferRequests.incoming.length > 0 ? (
          <div className="space-y-4">
            {transferRequests.incoming.map((request) => (
              <div key={request.id} className="bg-chain-panel border border-chain-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron text-chain-text">{getLandTitle(request.landId)}</h4>
                  <StatusBadge status={request.status} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-chain-muted">From:</span>
                    <AddressChip address={request.from} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-chain-muted">Requested:</span>
                    <p className="text-chain-text">{new Date(request.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {request.reason && (
                  <div className="mb-4">
                    <span className="text-chain-muted">Reason:</span>
                    <p className="text-chain-text mt-1">{request.reason}</p>
                  </div>
                )}
                {request.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApproveTransfer(request.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-chain-green text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowRejectModal(true);
                      }}
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
          <p className="text-chain-muted">No incoming transfer requests</p>
        )}
      </div>

      {/* Admin Queue */}
      {isAdmin && transferRequests.adminQueue.length > 0 && (
        <div>
          <h3 className="text-xl font-orbitron text-chain-text mb-4">Admin Approval Queue</h3>
          <div className="space-y-4">
            {transferRequests.adminQueue.map((request) => (
              <div key={request.id} className="bg-chain-panel border border-chain-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-orbitron text-chain-text">{getLandTitle(request.landId)}</h4>
                  <StatusBadge status="pending" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <span className="text-chain-muted">From:</span>
                    <AddressChip address={request.from} className="mt-1" />
                  </div>
                  <div>
                    <span className="text-chain-muted">To:</span>
                    <AddressChip address={request.to} className="mt-1" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApproveTransfer(request.id)}
                    disabled={loading}
                    className="px-4 py-2 bg-chain-green text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowRejectModal(true);
                    }}
                    disabled={loading}
                    className="px-4 py-2 bg-chain-red text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-chain-text mb-2">Land Transfers</h1>
        <p className="text-chain-muted">Manage land transfer requests and approvals</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-chain-border mb-8">
        <button
          onClick={() => setActiveTab('initiate')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'initiate'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          Initiate Transfer
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'pending'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          Pending Requests
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'initiate' ? renderInitiateTab() : renderPendingTab()}

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="Reject Transfer Request"
      >
        <div className="space-y-4">
          <p className="text-chain-text">
            Please provide a reason for rejecting this transfer request.
          </p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan resize-none"
            rows={4}
            placeholder="Enter rejection reason"
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowRejectModal(false)}
              className="flex-1 px-4 py-2 border border-chain-border text-chain-text rounded-lg hover:bg-chain-dark transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRejectTransfer}
              disabled={loading || !rejectReason.trim()}
              className="flex-1 px-4 py-2 bg-chain-red text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject Transfer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TransferPage;