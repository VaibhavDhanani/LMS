// server/controllers/notificationController.js
import Notification from '../models/notification.js';
import notificationManager from '../utills/notificationManager.js';
const notificationController = {
  // Get unread notifications for the authenticated user
  getUnreadNotifications: async (req, res) => {
    try {
  
      // Ensure the query is correctly formatted
      const notifications = await notificationManager.getUnreadNotifications( req.params.id );
    
      res.json({data: notifications});
    } catch (error) {
      console.error('Error in getUnreadNotifications:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Mark a specific notification as read
  markAsRead: async (req, res) => {
    try {
      const updatedNotification = await notificationManager.markAsRead(
        req.params.id,
        req.params.userId
      );
      
      if (!updatedNotification) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      
      res.json({data: updatedNotification});
    } catch (error) {
      console.error('Error in markAsRead:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
  
  // Mark all notifications as read for the user
  markAllAsRead: async (req, res) => {
    try {           
      await Notification.updateMany(
        { user: req.params.userId, isRead: false },  // Fixed req.params.userId
        { $set: { isRead: true } }  // Use $set for clarity
      );
      
      res.json({ message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error in markAllAsRead:', error);
      res.status(500).json({ message: 'Server error' });
    }
},

  // Establish SSE connection for real-time notifications
  streamNotifications: (req, res) => {
    // if (!req.user || !req.user.id) {
    //   return res.status(401).json({ message: 'Unauthorized' });
    // }
  
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
  
    // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: "connected", message: "Notification stream connected" })}\n\n`);
    res.flush?.();
  
    // Keep connection alive with heartbeat
    const heartbeatInterval = setInterval(() => {
      res.write('data: {"type":"heartbeat"}\n\n');
      res.flush?.();
    }, 30000);
  
    // Register this client
    const removeClient = notificationManager.registerClient(req.user.id, res);
  
    req.on('close', () => {
      clearInterval(heartbeatInterval);
      removeClient();
    });
  }
  
};

export default notificationController;