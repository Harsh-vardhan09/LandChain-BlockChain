import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-chain-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="text-8xl font-orbitron text-chain-cyan mb-4 animate-pulse">
            404
          </div>
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-chain-cyan rounded-full opacity-20 animate-ping"></div>
            <div className="relative w-full h-full bg-chain-dark border-2 border-chain-cyan rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-chain-cyan" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-orbitron text-chain-text mb-4">
          Page Not Found
        </h1>
        <p className="text-chain-muted mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track with your land management journey.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => navigate('/')}
            className="w-full px-6 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-orbitron font-medium flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full px-6 py-2 border border-chain-border text-chain-text rounded-lg hover:bg-chain-dark transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-chain-border">
          <p className="text-chain-muted text-sm mb-4">
            Need help finding something?
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <button
              onClick={() => navigate('/lands')}
              className="p-3 bg-chain-panel border border-chain-border rounded-lg hover:border-chain-cyan transition-colors"
            >
              <div className="text-chain-cyan font-medium">Browse Lands</div>
              <div className="text-chain-muted">Explore registered parcels</div>
            </button>
            <button
              onClick={() => navigate('/register')}
              className="p-3 bg-chain-panel border border-chain-border rounded-lg hover:border-chain-cyan transition-colors"
            >
              <div className="text-chain-cyan font-medium">Register Land</div>
              <div className="text-chain-muted">Add new property</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-chain-muted text-xs">
          <p>Chain Registry - Land Management System</p>
          <p className="mt-1">Securing property rights on the blockchain</p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;