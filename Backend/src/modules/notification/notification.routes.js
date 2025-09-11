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

// Routes
router.get("/", auth, getUserNotifications);
router.put("/:id/read", auth, markNotificationAsRead);
router.get("/unread/count", auth, getUnreadCount);
router.post("/broadcast", auth, sendBroadcastNotification);

export default router;
