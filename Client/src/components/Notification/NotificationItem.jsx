import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationItem = ({ notification }) => {
  const { markAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleClick = () => {
    console.log("Clicked Notification:", notification);
    if (!notification) return;
    if (!notification.isRead) {
      console.log("Marking as Read:", notification._id);
      markAsRead(notification._id);
    }
  
    if (notification.lecture && notification.course) {
      console.log("Navigating to Lecture Page");
      navigate(`/courses/${notification.course._id}/lectures/${notification.lecture._id}`);
    } else if (notification.course) {
      console.log("Navigating to Course Page");
      navigate(`/courses/${notification.course._id}`);
    }
  };
  
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
<div 
  className={`notification-item ${notification.isRead ? 'read' : 'unread'} ${notification.isTimeSensitive ? 'time-sensitive' : ''}`}
  onClick={() => handleClick()} // Ensure it is correctly assigned
>

      {notification.isTimeSensitive && (
        <div className="notification-badge">Live</div>
      )}
      
      <div className="notification-content">
        <h4 className="notification-title">{notification.title}</h4>
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">{timeAgo}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
