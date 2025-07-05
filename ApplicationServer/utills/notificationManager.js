import Notification from "../models/notification.js";
import User from "../models/user.js";

const connectedClients = new Map();

const notificationManager = {
  registerClient: (userId, res) => {
    connectedClients.set(userId, res);
    // console.log(`Client connected: ${userId}, Total clients: ${connectedClients.size}`);
    
    return () => {
      connectedClients.delete(userId);
      // console.log(`Client disconnected: ${userId}, Total clients: ${connectedClients.size}`);
    };
  },
  
  sendToUser: (userId, notification) => {
    const client = connectedClients.get(userId.toString());
    if (client) {
      client.write(`data: ${JSON.stringify(notification)}\n\n`);
      return true;
    }
    return false;
  },
  
  createNotification: async (notificationData) => {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      notificationManager.sendToUser(notification.user.toString(), notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  createNotificationsForUsers: async (userIds, notificationTemplate) => {
    try {
      const notifications = [];
      for (const userId of userIds) {
        const notificationData = {
          ...notificationTemplate,
          user: userId
        };
        
        const notification = await notificationManager.createNotification(notificationData);
        notifications.push(notification);
      }
      
      return notifications;
    } catch (error) {
      console.error('Error creating multiple notifications:', error);
      throw error;
    }
  },
  
  createNotificationsForCourse: async (courseId, notificationTemplate) => {
    try {

      const enrolledUsers = await User.find({
        enrolledCourses: courseId,
      }).select('_id');
      const userIds = enrolledUsers.map(user => user._id);
      
      return await notificationManager.createNotificationsForUsers(
        userIds,
        { ...notificationTemplate, course: courseId }
      );
    } catch (error) {
      console.error('Error creating course notifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId, userId) => {
    try {
      return await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  getUnreadNotifications: async (userId) => {
    try {
      return await Notification.find({
        user: userId
      })
      .sort({ createdAt: -1 })
      .populate('course', 'name')
      .populate('lecture', 'title startTime');
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  }
};

export default notificationManager;