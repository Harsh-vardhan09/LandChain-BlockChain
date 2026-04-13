import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import api from '../services/apiService';

const HomePage = () => {
  const [stats, setStats] = useState({
    totalLands: 0,
    totalTransfers: 0,
    verifiedProperties: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // No public stats endpoint exists on this backend.
    // Show zeros — they will populate once user logs in and visits dashboard.
    setStats({ totalLands: 0, totalTransfers: 0, verifiedProperties: 0 });
    setLoading(false);

    // If user is already logged in, try fetching admin stats
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setStats({
            totalLands:        data.lands?.total || 0,
            totalTransfers:    data.transactions?.total || 0,
            verifiedProperties: data.lands?.verified || 0,
          });
        }
      })
      .catch(() => {}); // silently fail — stats are decorative on homepage
    }
  };

  return (
    <div className="min-h-screen bg-chain-dark">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-chain-cyan/20 via-transparent to-chain-blue/20"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300d4ff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-chain-cyan to-chain-blue mb-6 animate-fade-in">
              Decentralized Land Registry
            </h1>
            <p className="text-xl md:text-2xl text-chain-text mb-8 max-w-3xl mx-auto">
              Immutable. Transparent. Trustless.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/explorer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-chain-cyan hover:bg-cyan-600 text-chain-dark rounded-lg font-orbitron font-bold text-lg transition-all transform hover:scale-105"
              >
                Explore Lands
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-chain-cyan text-chain-cyan hover:bg-chain-cyan hover:text-chain-dark rounded-lg font-orbitron font-bold text-lg transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-orbitron font-bold text-chain-cyan mb-2">
              {loading ? '...' : stats.totalLands.toLocaleString()}
            </div>
            <div className="text-chain-text">Registered Lands</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-orbitron font-bold text-chain-cyan mb-2">
              {loading ? '...' : stats.totalTransfers.toLocaleString()}
            </div>
            <div className="text-chain-text">Total Transfers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-orbitron font-bold text-chain-cyan mb-2">
              {loading ? '...' : stats.verifiedProperties.toLocaleString()}
            </div>
            <div className="text-chain-text">Verified Properties</div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-orbitron font-bold text-center text-chain-text mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-chain-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-chain-cyan" />
            </div>
            <h3 className="text-xl font-orbitron text-chain-text mb-2">Register</h3>
            <p className="text-chain-muted">
              Submit your land details with supporting documents. Our registrar reviews and registers your property on the blockchain.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-chain-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap size={32} className="text-chain-cyan" />
            </div>
            <h3 className="text-xl font-orbitron text-chain-text mb-2">Verify</h3>
            <p className="text-chain-muted">
              Government inspectors verify the authenticity of your documents and land details through our secure platform.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-chain-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={32} className="text-chain-cyan" />
            </div>
            <h3 className="text-xl font-orbitron text-chain-text mb-2">Transfer</h3>
            <p className="text-chain-muted">
              Transfer ownership securely and transparently. All transactions are recorded immutably on the blockchain.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-chain-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-chain-muted mb-4 md:mb-0">
              © 2024 LandChain. Built on Ethereum.
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-chain-muted hover:text-chain-cyan transition-colors"
              >
                GitHub
              </a>
              <a
                href={`https://sepolia.etherscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-chain-muted hover:text-chain-cyan transition-colors font-mono text-sm"
              >
                Contract: 0x1234...5678
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;