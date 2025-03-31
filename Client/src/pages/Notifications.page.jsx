import React, { useState, useEffect, useContext } from 'react';
import { Bell, Check, Filter, ChevronDown, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { formatDistanceToNow } from "date-fns";

// Helper function to get badge styles based on notification type
const getTypeStyles = (type) => {
  switch (type) {
    case 'lecture_scheduled':
      return 'bg-blue-100 text-blue-800';
    case 'lecture_started':
      return 'bg-green-100 text-green-800';
    case 'lecture_updated':
      return 'bg-yellow-100 text-yellow-800';
    case 'lecture_canceled':
      return 'bg-red-100 text-red-800';
    case 'announcement':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get human-readable type name
const getTypeName = (type) => {
  switch (type) {
    case 'lecture_scheduled':
      return 'Lecture Scheduled';
    case 'lecture_started':
      return 'Lecture Started';
    case 'lecture_updated':
      return 'Lecture Updated';
    case 'lecture_canceled':
      return 'Lecture Canceled';
    case 'lecture_completed':
      return 'Lecture Completed';
    case 'student_enrolled':
      return 'Student Enrolled';
    case 'announcement':
      return 'Announcement';
    default:
      return type;
  }
};

const NotificationItem = ({ notification, onMarkAsRead }) => {
  return (
    <div 
      className={`p-4 border-b hover:bg-base-200 transition-colors ${
        !notification.isRead ? 'border-l-4 border-l-primary' : ''
      } ${notification.isTimeSensitive ? 'bg-base-200' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className={`font-medium ${!notification.isRead ? 'font-bold' : ''}`}>
            {notification.title}
            {notification.isTimeSensitive && (
              <span className="ml-2 text-error">
                <AlertCircle className="inline-block w-4 h-4" />
              </span>
            )}
          </h3>
          <p className="text-sm text-base-content/70 mt-1">{notification.message}</p>
          <div className="flex items-center mt-2 text-xs text-base-content/50">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
        <div className="flex">
          {!notification.isRead && (
            <button 
              onClick={() => onMarkAsRead(notification._id)} 
              className="p-1 hover:bg-base-300 rounded-full"
              title="Mark as read"
            >
              <Check className="w-4 h-4 text-primary" />
            </button>
          )}
        </div>
      </div>
      <div className="mt-2">
        <span className={`text-xs px-2 py-1 rounded-full ${getTypeStyles(notification.type)}`}>
          {getTypeName(notification.type)}
        </span>
      </div>
    </div>
  );
};

const NotificationsPage = () => {
  // Get notifications and methods from context
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    readStatus: 'all',
    timeFrame: 'all'
  });
  
  // For pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;
  
  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        // Pass filters and pagination info to your fetch function
        await fetchNotifications({
          ...filters,
          page,
          limit: ITEMS_PER_PAGE
        });
        
        // Check if there are more notifications to load
        setHasMore(notifications.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [page, filters]);
  
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const handleFilterChange = (key, value) => {
    // Reset to page 1 when filters change
    setPage(1);
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  const loadMore = () => {
    setPage(prev => prev + 1);
  };
  
  const getFilteredNotifications = () => {
    let filtered = [...notifications];
    
    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(n => n.type === filters.type);
    }
    
    // Filter by read status
    if (filters.readStatus === 'read') {
      filtered = filtered.filter(n => n.isRead);
    } else if (filters.readStatus === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }
    
    // Filter by time frame
    if (filters.timeFrame !== 'all') {
      const now = new Date();
      let timeLimit;
      
      switch (filters.timeFrame) {
        case 'today':
          timeLimit = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          timeLimit = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          timeLimit = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          timeLimit = null;
      }
      
      if (timeLimit) {
        filtered = filtered.filter(n => new Date(n.createdAt) > timeLimit);
      }
    }
    
    return filtered;
  };
  
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <div className="max-w-4xl mx-auto p-4 pt-24">
      <div className="bg-base-100 shadow-lg rounded-lg overflow">
        <div className="p-4 bg-base-200 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Bell className="text-primary mr-2" />
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-content rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={markAllAsRead} 
              className="btn btn-sm btn-outline"
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-1" />
              Mark all as read
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setFilterOpen(!filterOpen)} 
                className="btn btn-sm btn-outline"
              >
                <Filter className="w-4 h-4 mr-1" />
                Filters
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
              
              {filterOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-base-100 shadow-xl rounded-lg p-4 z-20 border ">
                  <div className="mb-3">
                    <label className="text-sm font-medium block mb-1">Type</label>
                    <select 
                      className="select select-bordered w-full select-sm"
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="lecture_scheduled">Lecture Scheduled</option>
                      <option value="lecture_started">Lecture Started</option>
                      <option value="lecture_updated">Lecture Updated</option>
                      <option value="lecture_canceled">Lecture Canceled</option>
                      <option value="lecture_completed">Lecture Completed</option>
                      <option value="student_enrolled">Student Enrolled</option>
                      <option value="announcement">Announcement</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="text-sm font-medium block mb-1">Status</label>
                    <select 
                      className="select select-bordered w-full select-sm"
                      value={filters.readStatus}
                      onChange={(e) => handleFilterChange('readStatus', e.target.value)}
                    >
                      <option value="all">All</option>
                      <option value="read">Read</option>
                      <option value="unread">Unread</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="text-sm font-medium block mb-1">Time Frame</label>
                    <select 
                      className="select select-bordered w-full select-sm"
                      value={filters.timeFrame}
                      onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {loading && page === 1 ? (
          <div className="p-8 text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <>
            <div className="divide-y divide-base-300 max-h-96 md:max-h-[calc(100vh-220px)] overflow-y-auto">
              {filteredNotifications.map(notification => (
                <NotificationItem 
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
              
              {loading && page > 1 && (
                <div className="p-4 text-center">
                  <div className="loading loading-spinner loading-md text-primary"></div>
                </div>
              )}
            </div>
            
            {hasMore && !loading && (
              <div className="p-4 text-center">
                <button 
                  onClick={loadMore}
                  className="btn btn-outline btn-sm"
                >
                  Load more notifications
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-base-300 mx-auto mb-2" />
            <h3 className="font-semibold text-lg">No notifications</h3>
            <p className="text-base-content/70">
              {notifications.length > 0 
                ? "No notifications match your current filters." 
                : "You don't have any notifications at the moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;