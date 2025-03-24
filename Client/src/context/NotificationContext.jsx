import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications as getNotifications, readNotification, readAllNotifications } from '@/services/notification.service';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState(null);
  const { user, token } = useAuth();

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const response = await getNotifications(token);
      if (response.success) {
        setNotifications(response.data);
        updateUnreadNotifications(response.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Update Unread Notifications
  const updateUnreadNotifications = (notificationsList) => {
    const unread = notificationsList.filter(notification => !notification.isRead);
    setUnreadNotifications(unread);
    setUnreadCount(unread.length);
  };

  // Mark a Notification as Read
  const markAsRead = async (notificationId) => {
    try {
      const res = await readNotification(notificationId, token);
      if (res.success) {
        setNotifications(prev => {
          const updated = prev.map(notification =>
            notification._id === notificationId ? { ...notification, isRead: true } : notification
          );
          updateUnreadNotifications(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark All Notifications as Read
  const markAllAsRead = async () => {
    try {
      const res = await readAllNotifications(token);
      if (res.success) {
        setNotifications(prev => {
          const updated = prev.map(notification => ({ ...notification, isRead: true }));
          updateUnreadNotifications(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // SSE Connection for Real-time Notifications
  useEffect(() => {
    if (user && token) {
      fetchNotifications();

      const backendUrl = import.meta.env.VITE_SERVER_URL;
      const sse = new EventSource(`${backendUrl}/notifications/stream?token=${token}`, { withCredentials: true });

      sse.onopen = () => console.log('Notification stream connected');

      sse.onerror = (error) => {
        console.error('SSE connection error:', error);
        sse.close();

        setTimeout(() => {
          setEventSource(null);
        }, 5000);
      };

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'heartbeat') return;

          if (data._id) {
            setNotifications(prev => {
              if (!prev.some(n => n._id === data._id)) {
                if (data.isTimeSensitive && Notification.permission === 'granted') {
                  new Notification(data.title, { body: data.message, icon: '/favicon.ico' });
                }
                const updated = [data, ...prev];
                updateUnreadNotifications(updated);
                return updated;
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Error processing SSE message:', err);
        }
      };

      setEventSource(sse);

      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }

      return () => sse.close();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [user, token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadNotifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
