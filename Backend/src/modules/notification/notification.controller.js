// Backend/src/modules/notification/notification.controller.js
import NotificationService from "./notification.service.js";

// Initialize service (will be set with io in NotificationServer)
export let notificationService = null;

export function setNotificationService(service) {
  notificationService = service;
}

// Get user notifications
export async function getUserNotifications(req, res) {
  try {
    if (!notificationService) {
      return res
        .status(503)
        .json({ message: "Notification service not available" });
    }
    const notifications = await notificationService.getUserNotifications(
      req.user.id
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Mark notification as read
export async function markNotificationAsRead(req, res) {
  try {
    if (!notificationService) {
      return res
        .status(503)
        .json({ message: "Notification service not available" });
    }
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Get unread count
export async function getUnreadCount(req, res) {
  try {
    if (!notificationService) {
      return res
        .status(503)
        .json({ message: "Notification service not available" });
    }
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// Send broadcast notification (admin only)
export async function sendBroadcastNotification(req, res) {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!notificationService) {
      return res
        .status(503)
        .json({ message: "Notification service not available" });
    }

    const { title, message, type = "broadcast" } = req.body;

    let notification;
    if (req.user.role === "superadmin") {
      notification = await notificationService.sendToAll(title, message, type);
    } else {
      notification = await notificationService.sendToCompany(
        req.user.company,
        title,
        message,
        type
      );
    }

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
