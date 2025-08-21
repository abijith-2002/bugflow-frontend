import React, { useState, useEffect } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Bug, 
  MessageSquare,
  Clock
} from 'lucide-react';

// PUBLIC_INTERFACE
const Notifications = () => {
  /**
   * Notifications page component for managing user notifications
   * @returns {JSX.Element} Notifications page
   */
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotifications();
  
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'bug_assigned':
        return <Bug size={20} style={{ color: 'var(--accent-primary)' }} />;
      case 'bug_updated':
        return <AlertTriangle size={20} style={{ color: 'var(--accent-warning)' }} />;
      case 'comment_added':
        return <MessageSquare size={20} style={{ color: 'var(--accent-success)' }} />;
      default:
        return <Bell size={20} className="text-muted" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-muted">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="btn btn-secondary flex items-center gap-2"
          >
            <CheckCheck size={16} />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-subtle">
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'unread', label: 'Unread', count: unreadCount },
          { key: 'read', label: 'Read', count: notifications.length - unreadCount }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              filter === tab.key 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted hover:text-secondary'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`card transition-all hover:shadow-md cursor-pointer ${
                !notification.read ? 'border-l-4 border-l-primary bg-elevated' : ''
              }`}
              onClick={() => !notification.read && handleMarkAsRead(notification.id, { stopPropagation: () => {} })}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-medium ${!notification.read ? 'text-primary' : 'text-secondary'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-muted text-sm mt-1">
                        {notification.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <Clock size={12} />
                        {formatDate(notification.created_at)}
                      </div>
                      
                      {!notification.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 hover:bg-tertiary rounded"
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto mb-4 text-muted" />
          <h3 className="text-lg font-semibold mb-2">
            {filter === 'unread' ? 'No unread notifications' : 
             filter === 'read' ? 'No read notifications' : 
             'No notifications'}
          </h3>
          <p className="text-muted">
            {filter === 'unread' 
              ? 'All notifications have been read.' 
              : filter === 'read'
              ? 'No notifications have been read yet.'
              : 'You\'ll see notifications here when there\'s activity on your bugs and projects.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
