// Backend/index.js (new file)
const app = require("./app");
const NotificationServer = require("./server");

// Create and start the server with Socket.IO support
const server = new NotificationServer(app);

try {
  server.initialize().start();
} catch (error) {
  console.error("Failed to start server:", error);
  process.exit(1);
}

// Export for testing purposes
module.exports = server;
