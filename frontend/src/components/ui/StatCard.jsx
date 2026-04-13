import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend, className = '' }) => {
  return (
    <div className={`bg-chain-panel border border-chain-border rounded-xl p-6 hover:bg-chain-navy transition-colors ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-chain-muted text-sm font-medium mb-1">{title}</p>
          <p className="text-2xl font-orbitron text-chain-text">{value}</p>
          {trend && (
            <p className={`text-sm mt-1 ${trend.isPositive ? 'text-chain-green' : 'text-chain-red'}`}>
              {trend.isPositive ? '+' : ''}{trend.value} {trend.label}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-12 h-12 bg-chain-cyan/20 rounded-lg flex items-center justify-center">
            <Icon size={24} className="text-chain-cyan" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;