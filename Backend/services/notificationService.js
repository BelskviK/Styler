// Backend/services/notificationService.js
const Notification = require("../models/Notification");
const User = require("../models/User");

class NotificationService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // Track connected users: userId -> socketId
  }

  // Add this method to track user connections
  userConnected(userId, socketId) {
    this.connectedUsers.set(userId.toString(), socketId);
    console.log(`✅ User ${userId} connected with socket ${socketId}`);
    console.log(`📊 Connected users: ${this.connectedUsers.size}`);
  }

  // Add this method to track user disconnections
  userDisconnected(socketId) {
    for (let [userId, userSocketId] of this.connectedUsers.entries()) {
      if (userSocketId === socketId) {
        this.connectedUsers.delete(userId);
        console.log(`📤 User ${userId} disconnected from socket ${socketId}`);
        console.log(`📊 Connected users: ${this.connectedUsers.size}`);
        break;
      }
    }
  }

  // Get socket ID for a user
  getUserSocketId(userId) {
    return this.connectedUsers.get(userId.toString());
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId.toString());
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

      // Check if user is connected and send real-time notification
      const userSocketId = this.getUserSocketId(userId);
      if (userSocketId) {
        this.io.to(userSocketId).emit("newNotification", notification);
        console.log(`✅ Real-time notification sent to user ${userId}`);
      } else {
        console.log(
          `ℹ️ User ${userId} is not connected, notification saved to database`
        );
      }

      return notification;
    } catch (error) {
      console.error("❌ Error sending notification to user:", error);
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
      let sentCount = 0;

      users.forEach((user) => {
        const userSocketId = this.getUserSocketId(user._id);
        if (userSocketId) {
          this.io.to(userSocketId).emit("newNotification", notification);
          sentCount++;
        }
      });

      console.log(
        `✅ Notification sent to ${sentCount} connected users in company ${companyId}`
      );
      return notification;
    } catch (error) {
      console.error("❌ Error sending notification to company:", error);
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
      console.log(`✅ Broadcast notification sent to all connected users`);

      return notification;
    } catch (error) {
      console.error("❌ Error sending broadcast notification:", error);
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
      console.error("❌ Error marking notification as read:", error);
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
      console.error("❌ Error getting user notifications:", error);
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
      console.error("❌ Error getting unread count:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
