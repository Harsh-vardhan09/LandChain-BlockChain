import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const AddressChip = ({ address, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const truncatedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-chain-panel border border-chain-border rounded-full text-sm font-mono text-chain-text hover:bg-chain-navy transition-colors ${className}`}>
      <span className="font-space-mono">{truncatedAddress}</span>
      <button
        onClick={copyToClipboard}
        className="text-chain-muted hover:text-chain-cyan transition-colors"
        title="Copy full address"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
};

export default AddressChip;