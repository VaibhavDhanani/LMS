// server/routes/notifications.js
import express from 'express';
const router = express.Router();
import notificationController from '../controllers/notification.controller.js';


// Mark a notification as read
router.put('/notifications/:id/read/:userId', notificationController.markAsRead);

// Mark all notifications as read
router.put('/notifications/read-all/:userId', notificationController.markAllAsRead);

// Connect to SSE stream for real-time notifications
router.get('/notifications/stream', notificationController.streamNotifications);

// Get user's unread notifications
router.get('/notifications/:id', notificationController.getUnreadNotifications);
export default router;