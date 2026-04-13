import { useState, useEffect } from 'react';
import { useNotifications as useNotificationContext } from '../context/NotificationContext';

export const useNotifications = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, addNotification } = useNotificationContext();
  const [loading, setLoading] = useState(false);

  const refreshNotifications = async () => {
    setLoading(true);
    await fetchNotifications();
    setLoading(false);
  };

  const markNotificationAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const markAllNotificationsAsRead = async () => {
    await markAllAsRead();
  };

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead: markNotificationAsRead,
    markAllAsRead: markAllNotificationsAsRead,
    addNotification
  };
};