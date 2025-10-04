// Backend\src\app.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Import routes
import AuthRouter from "./modules/auth/auth.routes.js";
import companyRouter from "./modules/company/company.routes.js";
import UserRouter from "./modules/user/user.routes.js";
import ServiceRouter from "./modules/service/service.routes.js";
import AppointmentRouter from "./modules/appointment/appointment.routes.js";
import NotificationRouter from "./modules/notification/notification.routes.js";
import PublicRouter from "./modules/public/public.routes.js";
import AnalyticsRouter from "./modules/analytics/analytics.routes.js";
import ReviewRouter from "./modules/review/review.routes.js";
import dotenv from "dotenv";

dotenv.config();
// Initialize app
const app = express();
const allowedOrigins = [
  "http://localhost:3235",
  "http://127.0.0.1:3235",
  "https://styler-frontend.onrender.com",
  "https://styler-d41n.onrender.com",
  "https://stylerb.onrender.com",
];

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("📔 Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));
// Middleware
app.use(
  cors({
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
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", AuthRouter);
app.use("/api/companies", companyRouter);
app.use("/api/users", UserRouter);
app.use("/api/services", ServiceRouter);
app.use("/api/appointments", AppointmentRouter);
app.use("/api/notifications", NotificationRouter);
app.use("/api/public", PublicRouter);
app.use("/api/analytics", AnalyticsRouter);
app.use("/api/reviews", ReviewRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
export default app;
