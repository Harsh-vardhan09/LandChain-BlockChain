import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, User, FileText, ArrowRight, ExternalLink } from 'lucide-react';
import { ethers } from 'ethers';
import { useLands } from '../hooks/useLands';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { useContract } from '../hooks/useContract';
import LandMap from '../components/map/LandMap';
import StatusBadge from '../components/ui/StatusBadge';
import AddressChip from '../components/ui/AddressChip';
import TxHashLink from '../components/ui/TxHashLink';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';

const LandDetailsPage = () => {
  const { landId } = useParams();
  const { user, isAdmin } = useAuth();
  const { account } = useWallet();
  const { contract, executeTransaction } = useContract();
  const { fetchLandById } = useLands();

  const [land, setLand] = useState(null);
  const [transferHistory, setTransferHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    loadLandDetails();
  }, [landId]);

  const loadLandDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from API
      const landData = await fetchLandById(landId);
      setLand(landData);

      // Fetch transfer history from contract
      if (contract) {
        const history = await contract.getTransferHistory(landId);
        setTransferHistory(history);
      }
    } catch (err) {
      setError(err.message || 'Failed to load land details');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyLand = async () => {
    if (!land?.isForSale || !land?.salePrice) return;

    try {
      setBuying(true);
      await executeTransaction(
        contract.buyLand,
        landId,
        ethers.parseEther(land.salePrice.toString())
      );

      // Refresh land data
      await loadLandDetails();
      setShowBuyModal(false);
    } catch (err) {
      console.error('Failed to buy land:', err);
    } finally {
      setBuying(false);
    }
  };

  const handleVerifyLand = async () => {
    try {
      await executeTransaction(contract.verifyLand, landId);
      await loadLandDetails();
    } catch (err) {
      console.error('Failed to verify land:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !land) {
    return (
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-chain-red text-lg">{error || 'Land not found'}</p>
        <Link
          to="/explorer"
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium"
        >
          Back to Explorer
        </Link>
      </div>
    );
  }

  const isOwner = account && land.owner.toLowerCase() === account.toLowerCase();
  const canBuy = land.isForSale && !isOwner;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-orbitron text-chain-text mb-2">{land.title}</h1>
            <p className="text-chain-muted">Land ID: {landId}</p>
          </div>
          <div className="flex gap-3">
            {land.isVerified && <StatusBadge status="verified" />}
            {land.isForSale && <StatusBadge status="for_sale" />}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Land Info */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h2 className="text-xl font-orbitron text-chain-text mb-4">Land Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-chain-muted text-sm">Area</label>
                  <p className="text-chain-text font-medium">{land.areaSqFt.toLocaleString()} sq ft</p>
                </div>
                <div>
                  <label className="text-chain-muted text-sm">Type</label>
                  <p className="text-chain-text font-medium capitalize">{land.landType || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-chain-muted text-sm">District</label>
                  <p className="text-chain-text font-medium">{land.district || 'Not specified'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-chain-muted text-sm">State</label>
                  <p className="text-chain-text font-medium">{land.state || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-chain-muted text-sm">Registered Date</label>
                  <p className="text-chain-text font-medium">
                    {new Date(Number(land.registeredAt) * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-chain-muted text-sm">Last Transfer</label>
                  <p className="text-chain-text font-medium">
                    {land.lastTransferAt ? new Date(Number(land.lastTransferAt) * 1000).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-lg font-orbitron text-chain-text mb-4 flex items-center gap-2">
              <User size={20} />
              Owner Information
            </h3>
            <div className="flex items-center gap-3">
              <AddressChip address={land.owner} />
              <Link
                to={`/profile/${land.owner}`}
                className="text-chain-cyan hover:text-cyan-600 transition-colors text-sm"
              >
                View Profile
              </Link>
            </div>
          </div>

          {/* Document Info */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-lg font-orbitron text-chain-text mb-4 flex items-center gap-2">
              <FileText size={20} />
              Document Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-chain-muted text-sm">IPFS Hash</label>
                <p className="text-chain-text font-mono text-sm break-all">{land.documentHash}</p>
              </div>
              <a
                href={`https://ipfs.io/ipfs/${land.documentHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-chain-cyan hover:text-cyan-600 transition-colors"
              >
                View Document
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Transfer History */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-lg font-orbitron text-chain-text mb-4">Transfer History</h3>
            {transferHistory.length > 0 ? (
              <div className="space-y-3">
                {transferHistory.map((transfer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-chain-dark rounded-lg">
                    <div className="flex items-center gap-3">
                      <AddressChip address={transfer.from} className="scale-90" />
                      <ArrowRight size={16} className="text-chain-muted" />
                      <AddressChip address={transfer.to} className="scale-90" />
                    </div>
                    <div className="text-right">
                      <p className="text-chain-text text-sm">
                        {new Date(Number(transfer.requestedAt) * 1000).toLocaleDateString()}
                      </p>
                      {transfer.txHash && <TxHashLink hash={transfer.txHash} />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-chain-muted">No transfer history available</p>
            )}
          </div>
        </div>

        {/* Right Column - Actions & Map */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-lg font-orbitron text-chain-text mb-4">Actions</h3>
            <div className="space-y-3">
              {canBuy && (
                <button
                  onClick={() => setShowBuyModal(true)}
                  className="w-full px-4 py-3 bg-chain-gold text-chain-dark rounded-lg hover:bg-yellow-600 transition-colors font-orbitron font-medium"
                >
                  Buy This Land ({land.salePrice} ETH)
                </button>
              )}

              {isOwner && (
                <Link
                  to={`/transfer?landId=${landId}`}
                  className="block w-full px-4 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium text-center"
                >
                  Transfer Land
                </Link>
              )}

              {isAdmin && !land.isVerified && (
                <button
                  onClick={handleVerifyLand}
                  className="w-full px-4 py-3 bg-chain-green text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Verify Land
                </button>
              )}
            </div>
          </div>

          {/* Mini Map */}
          <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
            <h3 className="text-lg font-orbitron text-chain-text mb-4 flex items-center gap-2">
              <MapPin size={20} />
              Location
            </h3>
            <div className="h-48 rounded-lg overflow-hidden">
              <LandMap
                lands={[land]}
                center={[land.latitude || 20.5937, land.longitude || 78.9629]}
                zoom={10}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Buy Modal */}
      <Modal
        isOpen={showBuyModal}
        onClose={() => setShowBuyModal(false)}
        title="Confirm Purchase"
      >
        <div className="space-y-4">
          <p className="text-chain-text">
            Are you sure you want to buy <strong>{land.title}</strong> for <strong>{land.salePrice} ETH</strong>?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowBuyModal(false)}
              className="flex-1 px-4 py-2 border border-chain-border text-chain-text rounded-lg hover:bg-chain-dark transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuyLand}
              disabled={buying}
              className="flex-1 px-4 py-2 bg-chain-gold text-chain-dark rounded-lg hover:bg-yellow-600 transition-colors font-medium disabled:opacity-50"
            >
              {buying ? 'Processing...' : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LandDetailsPage;