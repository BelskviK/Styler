// Backend/index.js - Make sure this is your entry point
const app = require("./app");
const NotificationServer = require("./NotificationServer");

// Create and start the server with Socket.IO support
const server = new NotificationServer(app);

const PORT = process.env.PORT || 10000;

try {
  server.initialize().start(PORT);
  console.log(`✅ Server started on port ${PORT}`);
} catch (error) {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
}

module.exports = server;
