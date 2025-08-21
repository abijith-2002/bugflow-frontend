import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';

const NotificationContext = createContext();

// PUBLIC_INTERFACE
export const useNotifications = () => {
  /**
   * Hook to access notification context
   * @returns {Object} Notification context value
   */
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// PUBLIC_INTERFACE
export const NotificationProvider = ({ children }) => {
  /**
   * Provider component for notification context
   * @param {Object} props - Component props
   * @param {React.ReactNode} props.children - Child components
   * @returns {JSX.Element} Provider component
   */
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
