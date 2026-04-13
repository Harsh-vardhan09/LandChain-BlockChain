import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { usersAPI } from '../services/apiService';

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      // GET /api/users/notifications returns: { notifications, pagination }
      const res = await usersAPI.getNotifications({ limit: 20 });
      const list = res.data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30s
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      // PUT /api/users/notifications/read-all
      await usersAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  }, []);

  const markOneRead = useCallback(async (id) => {
    try {
      // PUT /api/users/notifications/:id/read
      await usersAPI.markOneRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, loading,
      fetchNotifications, markAllRead, markOneRead,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}