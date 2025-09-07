// Backend/NotificationServer.js
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const NotificationService = require("./services/notificationService");

class NotificationServer {
  constructor(app) {
    this.app = app;
    this.server = http.createServer(app);
    this.io = this.initializeSocketIO();
    this.port = process.env.PORT || 10000;
    this.notificationService = null;
  }

  initializeSocketIO() {
    const allowedOrigins = [
      "http://localhost:5173",
      "https://styler-frontend.onrender.com",
      "https://styler-d41n.onrender.com",
      "https://stylerb.onrender.com",
    ];

    const io = socketIo(this.server, {
      cors: {
        origin: function (origin, callback) {
          // Allow requests with no origin (like mobile apps or curl requests)
          if (!origin) return callback(null, true);

          if (allowedOrigins.indexOf(origin) === -1) {
            const msg =
              "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
          }
          return callback(null, true);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
      transports: ["websocket", "polling"], // Add fallback transports
    });

    // Socket.io authentication middleware
    io.use(this.authenticateSocket.bind(this));

    return io;
  }

  authenticateSocket(socket, next) {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        console.log("❌ No token provided for socket authentication");
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      console.log(`✅ Socket authenticated for user ${socket.userId}`);
      next();
    } catch (err) {
      console.error("❌ Socket authentication error:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  }

  initializeNotificationService() {
    this.notificationService = new NotificationService(this.io);
    this.app.set("notificationService", this.notificationService);
    console.log("✅ Notification service initialized");
    return this.notificationService;
  }

  setupSocketHandlers() {
    this.io.on("connection", (socket) => {
      console.log(
        `✅ User ${socket.userId} connected with socket ${socket.id}`
      );

      // Track user connection in notification service
      if (
        this.notificationService &&
        typeof this.notificationService.userConnected === "function"
      ) {
        this.notificationService.userConnected(socket.userId, socket.id);
      } else {
        console.error(
          "❌ Notification service or userConnected method not available"
        );
      }

      // Join user to their personal room
      socket.join(socket.userId.toString());

      this.setupNotificationHandlers(socket);
      this.setupConnectionCleanup(socket);

      // Send welcome message
      socket.emit("connected", {
        message: "Connected to notification server",
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });
  }

  setupNotificationHandlers(socket) {
    // Handle notification events
    socket.on("markAsRead", async (notificationId, callback) => {
      try {
        if (!this.notificationService) {
          return callback({
            success: false,
            error: "Notification service not available",
          });
        }

        const notification = await this.notificationService.markAsRead(
          notificationId,
          socket.userId
        );
        callback({ success: true, notification });
      } catch (error) {
        console.error("❌ Error marking notification as read:", error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("getNotifications", async (callback) => {
      try {
        if (!this.notificationService) {
          return callback({
            success: false,
            error: "Notification service not available",
          });
        }

        const notifications =
          await this.notificationService.getUserNotifications(socket.userId);
        callback({ success: true, notifications });
      } catch (error) {
        console.error("❌ Error getting notifications:", error);
        callback({ success: false, error: error.message });
      }
    });

    socket.on("getUnreadCount", async (callback) => {
      try {
        if (!this.notificationService) {
          return callback({
            success: false,
            error: "Notification service not available",
          });
        }

        const count = await this.notificationService.getUnreadCount(
          socket.userId
        );
        callback({ success: true, count });
      } catch (error) {
        console.error("❌ Error getting unread count:", error);
        callback({ success: false, error: error.message });
      }
    });

    // Add ping-pong for connection health
    socket.on("ping", (callback) => {
      callback({ pong: Date.now() });
    });
  }

  setupConnectionCleanup(socket) {
    socket.on("disconnect", (reason) => {
      console.log(`📤 User ${socket.userId} disconnected: ${reason}`);
      // Track user disconnection
      if (
        this.notificationService &&
        typeof this.notificationService.userDisconnected === "function"
      ) {
        this.notificationService.userDisconnected(socket.id);
      }
    });

    socket.on("error", (error) => {
      console.error(`❌ Socket error for user ${socket.userId}:`, error);
    });
  }

  initialize() {
    try {
      this.initializeNotificationService();
      this.setupSocketHandlers();
      console.log("✅ Notification server initialized successfully");
      return this;
    } catch (error) {
      console.error("❌ Failed to initialize notification server:", error);
      throw error;
    }
  }

  start(port = this.port) {
    this.server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🔌 Socket.IO server initialized`);
      console.log(
        `🌐 Health check available at http://localhost:${port}/health`
      );
    });

    // Graceful shutdown
    process.on("SIGTERM", this.gracefulShutdown.bind(this));
    process.on("SIGINT", this.gracefulShutdown.bind(this));

    return this.server;
  }

  gracefulShutdown() {
    console.log("🛑 Received shutdown signal, closing server gracefully...");

    this.server.close(() => {
      console.log("✅ Server closed");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error(
        "❌ Could not close connections in time, forcefully shutting down"
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
