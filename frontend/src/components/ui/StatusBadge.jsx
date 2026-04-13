import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
      case 'Verified':
        return {
          bg: 'bg-chain-green/20',
          border: 'border-chain-green',
          text: 'text-chain-green',
          label: 'Verified'
        };
      case 'pending':
      case 'Pending':
        return {
          bg: 'bg-chain-gold/20',
          border: 'border-chain-gold',
          text: 'text-chain-gold',
          label: 'Pending'
        };
      case 'unverified':
      case 'Unverified':
        return {
          bg: 'bg-chain-red/20',
          border: 'border-chain-red',
          text: 'text-chain-red',
          label: 'Unverified'
        };
      case 'for_sale':
      case 'For Sale':
        return {
          bg: 'bg-chain-cyan/20',
          border: 'border-chain-cyan',
          text: 'text-chain-cyan',
          label: 'For Sale'
        };
      case 'confirmed':
      case 'Confirmed':
        return {
          bg: 'bg-chain-green/20',
          border: 'border-chain-green',
          text: 'text-chain-green',
          label: 'Confirmed'
        };
      case 'failed':
      case 'Failed':
        return {
          bg: 'bg-chain-red/20',
          border: 'border-chain-red',
          text: 'text-chain-red',
          label: 'Failed'
        };
      default:
        return {
          bg: 'bg-chain-panel',
          border: 'border-chain-border',
          text: 'text-chain-text',
          label: status
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${config.bg} border ${config.border} ${config.text} rounded-full`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;