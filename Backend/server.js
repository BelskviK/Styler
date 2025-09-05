// Backend/server.js
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

class NotificationServer {
  constructor(app) {
    this.app = app;
    this.server = http.createServer(app);
    this.io = this.initializeSocketIO();
    this.port = process.env.PORT || 10000;
    this.notificationService = null;
  }

  initializeSocketIO() {
    const io = socketIo(this.server, {
      cors: {
        origin: "http://localhost:5173", // Match your frontend port
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    // Socket.io authentication middleware
    io.use(this.authenticateSocket.bind(this));

    return io;
  }

  authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  }

  initializeNotificationService() {
    const NotificationService = require("./services/notificationService");
    this.notificationService = new NotificationService(this.io);
    this.app.set("notificationService", this.notificationService);
    return this.notificationService;
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(`User ${socket.userId} connected`);

      // Join user to their personal room
      socket.join(socket.userId.toString());

      this.setupNotificationHandlers(socket);
      this.setupConnectionCleanup(socket);
    });
  }

  setupNotificationHandlers(socket) {
    // Handle notification events
    socket.on("markAsRead", async (notificationId, callback) => {
      try {
        const notification = await this.notificationService.markAsRead(
          notificationId,
          socket.userId
        );
        callback({ success: true, notification });
      } catch (error) {
        console.error("Error marking notification as read:", error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("getNotifications", async (callback) => {
      try {
        const notifications =
          await this.notificationService.getUserNotifications(socket.userId);
        callback({ success: true, notifications });
      } catch (error) {
        console.error("Error getting notifications:", error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("getUnreadCount", async (callback) => {
      try {
        const count = await this.notificationService.getUnreadCount(
          socket.userId
        );
        callback({ success: true, count });
      } catch (error) {
        console.error("Error getting unread count:", error);
        callback({ success: false, error: error.message });
      }
    });
  }

  setupConnectionCleanup(socket) {
    socket.on("disconnect", (reason) => {
      console.log(`User ${socket.userId} disconnected: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  }

  initialize() {
    try {
      this.initializeNotificationService();
      this.setupSocketHandlers();
      console.log("Notification server initialized successfully");
      return this;
    } catch (error) {
      console.error("Failed to initialize notification server:", error);
      throw error;
    }
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
      console.log(`Socket.IO server initialized`);
    });

    // Graceful shutdown
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
    process.on("SIGINT", this.gracefulShutdown.bind(this));

    return this.server;
  }

  gracefulShutdown() {
    console.log("Received shutdown signal, closing server gracefully...");

    this.server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 10000);
  }

  // Utility method to emit events to specific users
  emitToUser(userId, event, data) {
    this.io.to(userId.toString()).emit(event, data);
  }

  // Utility method to get connected users count
  getConnectedUsersCount() {
    return this.io.engine.clientsCount;
  }
}

module.exports = NotificationServer;
