// Backend/routes/notification.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Get user notifications
router.get("/", auth, async (req, res) => {
  try {
    const notificationService = req.app.get("notificationService");
    const notifications = await notificationService.getUserNotifications(
      req.user.id
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notificationService = req.app.get("notificationService");
    const notification = await notificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get unread count
router.get("/unread/count", auth, async (req, res) => {
  try {
    const notificationService = req.app.get("notificationService");
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send broadcast notification (admin only)
router.post("/broadcast", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, message, type = "broadcast" } = req.body;
    const notificationService = req.app.get("notificationService");

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
});

module.exports = router;
