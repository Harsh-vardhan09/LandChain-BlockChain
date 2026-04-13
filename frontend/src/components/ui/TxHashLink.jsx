import React from 'react';
import { ExternalLink } from 'lucide-react';

const TxHashLink = ({ hash, className = '' }) => {
  const truncatedHash = `${hash.slice(0, 10)}...${hash.slice(-8)}`;
  const etherscanUrl = `https://sepolia.etherscan.io/tx/${hash}`;

  return (
    <a
      href={etherscanUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-chain-cyan hover:text-chain-blue transition-colors font-mono text-sm ${className}`}
      title={`View transaction ${hash} on Etherscan`}
    >
      <span>{truncatedHash}</span>
      <ExternalLink size={12} />
    </a>
  );
};

export default TxHashLink;