import React from 'react';
import { MapPin, Calendar, User } from 'lucide-react';
import { ethers } from 'ethers';
import StatusBadge from './StatusBadge';
import AddressChip from './AddressChip';

const LandCard = ({ land, onClick, className = '' }) => {
  const formatDate = (timestamp) => {
    return new Date(Number(timestamp) * 1000).toLocaleDateString();
  };

  const formatArea = (area) => {
    return `${area.toLocaleString()} sq ft`;
  };

  return (
    <div
      className={`bg-chain-panel border border-chain-border rounded-xl p-4 hover:bg-chain-navy transition-colors cursor-pointer animate-slide-up ${className}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-orbitron text-chain-text text-lg truncate">{land.title}</h3>
        <div className="flex gap-2">
          {land.isVerified && <StatusBadge status="verified" />}
          {land.isForSale && <StatusBadge status="for_sale" />}
        </div>
      </div>

      <div className="space-y-2 text-sm text-chain-muted">
        <div className="flex items-center gap-2">
          <MapPin size={14} />
          <span>{land.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium text-chain-text">Area:</span>
          <span>{formatArea(land.areaSqFt)}</span>
        </div>

        <div className="flex items-center gap-2">
          <User size={14} />
          <span className="font-medium text-chain-text">Owner:</span>
          <AddressChip address={land.owner} className="scale-90" />
        </div>

        {land.isForSale && land.salePrice && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-chain-gold">Price:</span>
            <span className="text-chain-gold font-mono">
              {ethers.formatEther(land.salePrice)} ETH
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span>Registered: {formatDate(land.registeredAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default LandCard;