import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin } from 'lucide-react';
import { useLands } from '../hooks/useLands';
import LandMap from '../components/map/LandMap';
import LandCard from '../components/ui/LandCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const LandExplorerPage = () => {
  const navigate = useNavigate();
  const { lands, loading, error, fetchLands } = useLands();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all', // all, for_sale, verified, unverified
    landType: '',
    state: '',
    district: ''
  });
  const [selectedLand, setSelectedLand] = useState(null);

  useEffect(() => {
    fetchLands();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchFilters = {
      ...filters,
      search: searchTerm
    };
    fetchLands(searchFilters);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    fetchLands({ ...newFilters, search: searchTerm });
  };

  const handleLandClick = (land) => {
    navigate(`/lands/${land.id}`);
  };

  const handleMapLandClick = (land) => {
    setSelectedLand(land);
    // Scroll to land card or highlight it
  };

  const filteredLands = lands.filter(land => {
    if (filters.status === 'for_sale' && !land.isForSale) return false;
    if (filters.status === 'verified' && !land.isVerified) return false;
    if (filters.status === 'unverified' && land.isVerified) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-chain-text mb-2">Land Explorer</h1>
        <p className="text-chain-muted">Discover and explore registered land parcels across India</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-chain-muted" />
            <input
              type="text"
              placeholder="Search by title, district, or owner address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-chain-muted" />
            <span className="text-chain-text font-medium">Status:</span>
          </div>

          {[
            { value: 'all', label: 'All' },
            { value: 'for_sale', label: 'For Sale' },
            { value: 'verified', label: 'Verified' },
            { value: 'unverified', label: 'Unverified' }
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => handleFilterChange('status', status.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filters.status === status.value
                  ? 'bg-chain-cyan text-chain-dark'
                  : 'bg-chain-dark text-chain-text hover:bg-chain-navy'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <select
            value={filters.landType}
            onChange={(e) => handleFilterChange('landType', e.target.value)}
            className="px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
          >
            <option value="">All Land Types</option>
            <option value="agricultural">Agricultural</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </select>

          <input
            type="text"
            placeholder="State"
            value={filters.state}
            onChange={(e) => handleFilterChange('state', e.target.value)}
            className="px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
          />

          <input
            type="text"
            placeholder="District"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
            className="px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text placeholder-chain-muted focus:outline-none focus:border-chain-cyan"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-orbitron text-chain-text">
              Results ({filteredLands.length})
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-chain-red">{error}</p>
            </div>
          ) : filteredLands.length > 0 ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLands.map((land) => (
                <LandCard
                  key={land.id}
                  land={land}
                  onClick={() => handleLandClick(land)}
                  className={selectedLand?.id === land.id ? 'ring-2 ring-chain-cyan' : ''}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No lands found"
              description="Try adjusting your search criteria or filters."
              icon={MapPin}
            />
          )}
        </div>

        {/* Right Panel - Map */}
        <div className="h-96 lg:h-[600px]">
          <LandMap
            lands={filteredLands}
            onLandClick={handleMapLandClick}
          />
        </div>
      </div>
    </div>
  );
};

export default LandExplorerPage;