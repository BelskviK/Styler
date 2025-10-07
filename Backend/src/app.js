// Backend/src/app.js
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

// Import routes...
import AuthRouter from "./modules/auth/auth.routes.js";
import companyRouter from "./modules/company/company.routes.js";
import UserRouter from "./modules/user/user.routes.js";
import ServiceRouter from "./modules/service/service.routes.js";
import AppointmentRouter from "./modules/appointment/appointment.routes.js";
import NotificationRouter from "./modules/notification/notification.routes.js";
import PublicRouter from "./modules/public/public.routes.js";
import AnalyticsRouter from "./modules/analytics/analytics.routes.js";
import ReviewRouter from "./modules/review/review.routes.js";

dotenv.config();

const app = express();
connectDB();
const allowedOrigins = [
  "http://localhost:3235",
  "http://127.0.0.1:3235",
  "https://styler-frontend.onrender.com",
  "https://styler-d41n.onrender.com",
  "https://stylerb.onrender.com",
];

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.includes(origin)) {
        return callback(new Error("Origin not allowed by CORS"), false);
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

// Error & 404 handling
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

export default app;
