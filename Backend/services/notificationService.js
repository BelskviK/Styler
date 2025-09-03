// Backend/services/notificationService.js
const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
  constructor(io) {
    this.io = io;
  }

  // Send notification to specific user
  async sendToUser(
    userId,
    title,
    message,
    type = "appointment",
    relatedAppointment = null
  ) {
    try {
      const notification = new Notification({
        title,
        message,
        type,
        recipientType: "specific",
        recipient: userId,
        relatedAppointment,
        isRead: false,
      });

      await notification.save();

      // Emit to specific user
      this.io.to(userId.toString()).emit("newNotification", notification);

      return notification;
    } catch (error) {
      console.error("Error sending notification to user:", error);
      throw error;
    }
  }

  // Send notification to all users in a company
  async sendToCompany(companyId, title, message, type = "broadcast") {
    try {
      const notification = new Notification({
        title,
        message,
        type,
        recipientType: "company",
        company: companyId,
        isRead: false,
      });

      await notification.save();

      // Get all users in company and emit to each
      const users = await User.find({ company: companyId });
      users.forEach((user) => {
        this.io.to(user._id.toString()).emit("newNotification", notification);
      });

      return notification;
    } catch (error) {
      console.error("Error sending notification to company:", error);
      throw error;
    }
  }

  // Send notification to all users (superadmin only)
  async sendToAll(title, message, type = "system") {
    try {
      const notification = new Notification({
        title,
        message,
        type,
        recipientType: "all",
        isRead: false,
      });

      await notification.save();

      // Emit to all connected clients
      this.io.emit("newNotification", notification);

      return notification;
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        $or: [
          { recipientType: "specific", recipient: userId },
          {
            recipientType: "company",
            company: (await User.findById(userId)).company,
          },
          { recipientType: "all" },
        ],
      });

      if (!notification) {
        throw new Error("Notification not found or unauthorized");
      }

      notification.isRead = true;
      await notification.save();

      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const notifications = await Notification.find({
        $or: [
          { recipientType: "specific", recipient: userId },
          { recipientType: "company", company: user.company },
          { recipientType: "all" },
        ],
      })
        .populate("relatedAppointment", "customerName stylist date startTime")
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw error;
    }
  }

  // Get unread count for user
  async getUnreadCount(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error("User not found");

      const count = await Notification.countDocuments({
        $or: [
          { recipientType: "specific", recipient: userId, isRead: false },
          { recipientType: "company", company: user.company, isRead: false },
          { recipientType: "all", isRead: false },
        ],
      });

      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
// const notificationService = req.app.get("notificationService");
// await notificationService.sendToUser(
//   userId,
//   "Appointment Reminder",
//   "Your appointment is in 1 hour",
//   "appointment",
//   appointmentId
// );
// await notificationService.sendToCompany(
//   companyId,
//   "Holiday Notice",
//   "We'll be closed on Christmas Day",
//   "broadcast"
// );
// await notificationService.sendToAll(
//   "System Update",
//   "Scheduled maintenance tonight at 2 AM",
//   "system"
// );
