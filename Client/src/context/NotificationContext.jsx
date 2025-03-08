 // client/src/context/NotificationContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext'; // Assume you have an auth context
import { fetchNotifications as getNotifications, readNotification, readAllNotifications} from '@/services/notification.service';
const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [eventSource, setEventSource] = useState(null);
  const {  user,token } = useAuth();

  // Function to fetch unread notifications
  const fetchNotifications = async () => {
    try {
      const response = await getNotifications(user._id, token);
      if(response.success){
        setNotifications(response.data);
        setUnreadCount(response.data.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      const res =await readNotification(notificationId,user.id,token);
      
      if(res.success){
        // Update local state
        setNotifications(notifications.map(notification => 
          notification._id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
        ));
      }
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const res=await readAllNotifications(user.id,token);
      if(res.success){

        // Update local state
        setNotifications(notifications.map(notification => ({ 
          ...notification, 
          isRead: true 
        })));
      }
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Set up SSE connection when user logs in
  useEffect(() => {
    if (user) {
      // Get existing notifications first
      fetchNotifications();
      
      // Set up SSE connection
      const backendUrl = import.meta.env.VITE_SERVER_URL;

      const sse = new EventSource(`${backendUrl}/notifications/stream?token=${token}`, { withCredentials: true });

      // console.log('SSE connection established');
      sse.onopen = () => {
        console.log('Notification stream connected');
      };
      
      sse.onerror = (error) => {
        console.error('SSE connection error:', error);
        sse.close();
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          setEventSource(null); // This will trigger a reconnect via the useEffect
        }, 5000);
      };
      
      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data); 
          // Ignore heartbeat messages
          if (data.type === 'heartbeat') return;
          
          // Handle new notifications
          if (data._id) {
            // Add new notification to state if it doesn't already exist
            setNotifications(prev => {
              // Check if notification already exists
              const exists = prev.some(n => n._id === data._id);
              if (!exists) {
                // Show browser notification for time-sensitive alerts
                if (data.isTimeSensitive && Notification.permission === 'granted') {
                  new Notification(data.title, {
                    body: data.message,
                    icon: '/favicon.ico'
                  });
                }
                
                // Add to state and update counter
                setUnreadCount(count => count + 1);
                return [data, ...prev];
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Error processing SSE message:', err);
        }
      };
      
      setEventSource(sse);
      
      // Request browser notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Clean up on unmount
      return () => {
        if (sse) {
          sse.close();
        }
      };
    }
    
    // Clean up SSE when user logs out
    return () => {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [ user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
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