import { useState, useEffect } from 'react'
import { useWallet } from '../context/WalletContext'
import { RoleGuard } from './RoleGuard'

const AdminPanel = () => {
  const { account, roleLoading } = useWallet()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('user')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (account) {
      fetchUsers()
    }
  }, [account])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('http://localhost:3000/admin/users', {
        headers: {
          'x-wallet-address': account,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch users')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (walletAddress, role) => {
    try {
      setUpdating(true)
      setError(null)

      const response = await fetch(`http://localhost:3000/admin/users/${walletAddress}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': account,
        },
        body: JSON.stringify({ role }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.walletAddress === walletAddress ? { ...user, role } : user
          )
        )
        setSelectedUser(null)
        setNewRole('user')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update user role')
      }
    } catch (err) {
      setError(err.message)
      console.error('Error updating user role:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Panel - User Management</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
          >
            {loading ? 'Loading...' : 'Refresh Users'}
          </button>
        </div>

        {users.length === 0 ? (
          <p className="text-gray-500">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left p-3 font-semibold text-gray-700">Wallet Address</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Current Role</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Joined</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.walletAddress}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 font-mono text-sm text-gray-800">
                      {user.walletAddress.substring(0, 6)}...{user.walletAddress.substring(38)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedUser(user.walletAddress)
                          setNewRole(user.role === 'admin' ? 'user' : 'admin')
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedUser && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Update User Role</h3>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Role:
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => updateUserRole(selectedUser, newRole)}
                  disabled={updating}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  {updating ? 'Updating...' : 'Confirm'}
                </button>
                <button
                  onClick={() => {
                    setSelectedUser(null)
                    setNewRole('user')
                  }}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}

export default AdminPanel
