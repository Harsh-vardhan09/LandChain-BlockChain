import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/apiService'
import TransactionStatus from '../components/TransactionStatus'

export const LandList = () => {
  const navigate = useNavigate()
  const [lands, setLands] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchId, setSearchId] = useState('')
  const [txStatus, setTxStatus] = useState(null)
  const [recentLandId, setRecentLandId] = useState('')

  const handleViewDetails = (landId) => {
    navigate(`/land/${landId}`)
  }

  const handleSearchLand = async (e) => {
    e.preventDefault()
    if (!searchId.trim()) return

    setLoading(true)
    setTxStatus(null)

    try {
      const response = await apiService.getLand(searchId)
      setLands([response.data.land])
      setRecentLandId(searchId)
      setSearchId('')
    } catch (error) {
      setTxStatus({
        status: 'error',
        error: error.response?.data?.error || 'Land not found',
      })
      setLands([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">Land Registry</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <form onSubmit={handleSearchLand} className="flex gap-2">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search land by ID..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {txStatus && (
        <div className="mb-8">
          <TransactionStatus
            status={txStatus.status}
            error={txStatus.error}
          />
        </div>
      )}

      {lands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lands.map((land) => (
            <div
              key={land.landId}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-secondary mb-2">
                {land.landId}
              </h3>
              <div className="space-y-2 mb-4">
                <p className="text-gray-600">
                  <span className="font-semibold">Location:</span> {land.location}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Area:</span> {land.area} sq m
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Owner:</span>{' '}
                  <span className="font-mono text-sm">
                    {land.owner?.substring(0, 10)}...
                  </span>
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      land.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {land.verified ? 'Verified' : 'Pending'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => handleViewDetails(land.landId)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No lands found. Search to get started!</p>
        </div>
      )}
    </div>
  )
}

export default LandList
