// Backend/src/modules/notification/notification.routes.js
import express from "express";
import auth from "../../middleware/auth.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  getUnreadCount,
  sendBroadcastNotification,
} from "./notification.controller.js";

const router = express.Router();

/**
 * Notification Routes
 */

// ---- USER ROUTES ----

// ✅ Get all notifications for the authenticated user
router.get("/", auth, getUserNotifications);

// ✅ Mark a specific notification as read
router.put("/:id/read", auth, markNotificationAsRead);

// ✅ Get count of unread notifications
router.get("/unread/count", auth, getUnreadCount);

// ---- ADMIN / SUPERADMIN ROUTES ----

// ✅ Send a broadcast notification to all users
router.post("/broadcast", auth, sendBroadcastNotification);

export default router;
