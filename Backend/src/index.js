// Backend\src\index.js
import app from "./app.js";
import NotificationServer from "./NotificationServer.js";

// Create and start the server with Socket.IO support
export const server = new NotificationServer(app);

const PORT = process.env.PORT || 10000;

try {
  server.initialize().start(PORT);
  console.log(`✅ Server started on port ${PORT}`);
} catch (error) {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
}
