import { useState } from 'react'

export const TransactionStatus = ({ txHash, status, error }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      default:
        return 'ℹ'
    }
  }

  return (
    <div
      className={`p-4 border rounded-lg ${getStatusColor()}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{getStatusIcon()}</span>
        <div>
          <p className="font-semibold capitalize">{status}</p>
          {error && <p className="text-sm">{error}</p>}
          {txHash && (
            <p className="text-sm break-all">
              TX: {txHash.substring(0, 20)}...
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default TransactionStatus
