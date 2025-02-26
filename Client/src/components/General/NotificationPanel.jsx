// client/src/components/notifications/NotificationPanel.jsx
import React, { useState } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotifications();

  // Filter out any expired notifications (as a client-side backup to server TTL)
  const validNotifications = notifications.filter(notification => 
    !notification.expiresAt || new Date(notification.expiresAt) > new Date()
  );

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  return (
    <div className="notification-container">
      <button 
        className="notification-button"
        onClick={togglePanel}
      >
        <i className="fa fa-bell"></i>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read" 
                onClick={handleMarkAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {validNotifications.length === 0 ? (
              <p className="no-notifications">No notifications</p>
            ) : (
              validNotifications.map(notification => (
                <NotificationItem 
                  key={notification._id} 
                  notification={notification} 
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;