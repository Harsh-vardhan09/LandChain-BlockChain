import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({
  icon: Icon = FileX,
  title = 'No data found',
  description = 'There are no items to display at the moment.',
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 bg-chain-panel border border-chain-border rounded-full flex items-center justify-center mb-4">
        <Icon size={32} className="text-chain-muted" />
      </div>
      <h3 className="text-lg font-orbitron text-chain-text mb-2">{title}</h3>
      <p className="text-chain-muted mb-6 max-w-md">{description}</p>
      {action && (
        <div className="flex gap-3">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;