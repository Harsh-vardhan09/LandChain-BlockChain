import React, { useState, useEffect } from 'react';
import { User, Edit3, Save, X, MapPin, Calendar, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { usersAPI } from '../services/apiService';
import { useNotifications } from '../context/NotificationContext';
import AddressChip from '../components/ui/AddressChip';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LandCard from '../components/ui/LandCard';

const ProfilePage = () => {
  const { user } = useAuth();
  const { account } = useWallet();
  const [lands, setLands] = useState([]);
  const { notifications, markToRead, fetchNotifications } = useNotifications();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (account) {
      loadUserData();
    }
  }, [account]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      // GET /api/users/my-lands → { lands }
      const landsRes = await usersAPI.getMyLands();
      setLands(landsRes.data.lands || []);

      // GET /api/users/notifications → { notifications }
      const notifRes = await usersAPI.getNotifications({ limit: 20 });
      // notifications are already in context
      
      await fetchNotifications();
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // PUT /api/users/profile  body: { name, email, phone, address }
      await usersAPI.updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'text-chain-red';
      case 'registrar':
        return 'text-chain-cyan';
      case 'inspector':
        return 'text-chain-yellow';
      default:
        return 'text-chain-green';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return '👑';
      case 'registrar':
        return '📋';
      case 'inspector':
        return '🔍';
      default:
        return '👤';
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-chain-cyan rounded-full flex items-center justify-center text-2xl">
              {getRoleIcon(user?.role)}
            </div>
            <div>
              <h2 className="text-2xl font-orbitron text-chain-text">{user?.name || 'Anonymous User'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-medium ${getRoleColor(user?.role)}`}>
                  {user?.role?.toUpperCase() || 'USER'}
                </span>
                <StatusBadge status={user?.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
          )}
        </div>

        {/* Wallet Address */}
        <div className="mb-6">
          <label className="block text-chain-muted text-sm mb-2">Wallet Address</label>
          <AddressChip address={account} />
        </div>

        {/* Profile Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-chain-muted text-sm mb-2">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
              />
            ) : (
              <p className="text-chain-text py-3">{user?.name || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-chain-muted text-sm mb-2">Email</label>
            {isEditing ? (
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
              />
            ) : (
              <p className="text-chain-text py-3">{user?.email || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-chain-muted text-sm mb-2">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
              />
            ) : (
              <p className="text-chain-text py-3">{user?.phone || 'Not provided'}</p>
            )}
          </div>

          <div>
            <label className="block text-chain-muted text-sm mb-2">Address</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.address}
                onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 bg-chain-dark border border-chain-border rounded-lg text-chain-text focus:outline-none focus:border-chain-cyan"
              />
            ) : (
              <p className="text-chain-text py-3">{user?.address || 'Not provided'}</p>
            )}
          </div>
        </div>

        {/* Account Stats */}
        <div className="mt-6 pt-6 border-t border-chain-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-orbitron text-chain-cyan">{user?.landsCount || 0}</div>
              <div className="text-chain-muted text-sm">Total Lands</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-orbitron text-chain-green">
                {lands.filter(land => land.isVerified).length}
              </div>
              <div className="text-chain-muted text-sm">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-orbitron text-chain-yellow">
                {lands.filter(land => !land.isVerified).length}
              </div>
              <div className="text-chain-muted text-sm">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-orbitron text-chain-red">
                {notifications.filter(n => !n.read).length}
              </div>
              <div className="text-chain-muted text-sm">Unread Notifications</div>
            </div>
          </div>
        </div>

        {/* Edit Actions */}
        {isEditing && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-chain-border">
            <button
              onClick={handleSaveProfile}
              disabled={loading}
              className="px-6 py-2 bg-chain-cyan text-chain-dark rounded-lg hover:bg-cyan-600 transition-colors font-medium flex items-center gap-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button
              onClick={handleCancelEdit}
              className="px-6 py-2 border border-chain-border text-chain-text rounded-lg hover:bg-chain-dark transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-chain-panel border border-chain-border rounded-xl p-6">
        <h3 className="text-xl font-orbitron text-chain-text mb-4">Account Information</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-chain-muted">Member Since</span>
            <span className="text-chain-text">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-chain-muted">Last Login</span>
            <span className="text-chain-text">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-chain-muted">Account Status</span>
            <StatusBadge status={user?.isActive ? 'active' : 'inactive'} />
          </div>
        </div>
      </div>
    </div>
  );

  const renderLandsTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-orbitron text-chain-text">My Lands</h3>
        <p className="text-chain-muted">Manage your registered land parcels</p>
      </div>

      {lands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lands.map((land) => (
            <LandCard key={land.id} land={land} showActions={true} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-chain-muted mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-chain-text mb-2">No Lands Yet</h3>
          <p className="text-chain-muted">You haven't registered any land parcels yet.</p>
        </div>
      )}
    </div>
  );

  const renderNotificationsTab = () => (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-orbitron text-chain-text">Notifications</h3>
        <p className="text-chain-muted">Stay updated with your account activity</p>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-chain-panel border border-chain-border rounded-xl p-6 ${
                !notification.read ? 'border-l-4 border-l-chain-cyan' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Bell className={`w-5 h-5 ${notification.read ? 'text-chain-muted' : 'text-chain-cyan'}`} />
                  <h4 className="font-medium text-chain-text">{notification.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-sm text-chain-cyan hover:text-cyan-600 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                  <span className="text-sm text-chain-muted">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <p className="text-chain-text">{notification.message}</p>
              {notification.actionUrl && (
                <a
                  href={notification.actionUrl}
                  className="inline-block mt-3 text-chain-cyan hover:text-cyan-600 transition-colors text-sm"
                >
                  View Details →
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-chain-muted mx-auto mb-4" />
          <h3 className="text-xl font-orbitron text-chain-text mb-2">No Notifications</h3>
          <p className="text-chain-muted">You're all caught up! No new notifications.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-orbitron text-chain-text mb-2">My Profile</h1>
        <p className="text-chain-muted">Manage your account settings and view your lands</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-chain-border mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('lands')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'lands'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <MapPin className="w-4 h-4" />
          My Lands ({lands.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'text-chain-cyan border-b-2 border-chain-cyan'
              : 'text-chain-muted hover:text-chain-text'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications ({notifications.filter(n => !n.read).length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && renderProfileTab()}
      {activeTab === 'lands' && renderLandsTab()}
      {activeTab === 'notifications' && renderNotificationsTab()}
    </div>
  );
};

export default ProfilePage;