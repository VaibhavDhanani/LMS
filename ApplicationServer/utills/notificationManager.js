// server/utils/notificationManager.js
import Notification from "../models/notification.js";
import User from "../models/user.js";

// Map to store active SSE connections
const connectedClients = new Map();

const notificationManager = {
  // Register an SSE client connection
  registerClient: (userId, res) => {
    connectedClients.set(userId, res);
    // console.log(`Client connected: ${userId}, Total clients: ${connectedClients.size}`);
    
    // Return a function to remove the client when connection closes
    return () => {
      connectedClients.delete(userId);
      // console.log(`Client disconnected: ${userId}, Total clients: ${connectedClients.size}`);
    };
  },
  
  // Send notification to a specific user via SSE
  sendToUser: (userId, notification) => {
    const client = connectedClients.get(userId.toString());
    if (client) {
      client.write(`data: ${JSON.stringify(notification)}\n\n`);
      return true;
    }
    return false;
  },
  
  // Create a notification and send it via SSE if user is online
  createNotification: async (notificationData) => {
    try {
      const notification = new Notification(notificationData);
      await notification.save();
      
      // Try to send notification in real-time
      notificationManager.sendToUser(notification.user.toString(), notification);
      
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  
  // Create notifications for multiple users
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
  
  // Create notifications for all students in a course
  createNotificationsForCourse: async (courseId, notificationTemplate) => {
    try {

      // Find all users enrolled in the course
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
  
  // Mark a notification as read
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
  
  // Get unread notifications for a user
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