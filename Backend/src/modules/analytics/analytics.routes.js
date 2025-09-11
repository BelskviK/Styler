// Backend/routes/analytics.routes.js
import express from "express";
const AnalyticsRouter = express.Router();
import auth from "../../middleware/auth.js";

import {
  getDashboardStats,
  getRevenueAnalytics,
  getAppointmentAnalytics,
  getCustomerAnalytics,
  getEmployeePerformance,
  getPopularServices,
  getServicePerformance,
  getReviewAnalytics,
  getReviewStatistics,
} from "./analytics.controller.js";
// Review statistics analytics
AnalyticsRouter.get("/reviews", auth, getReviewStatistics);
// Dashboard overview statistics
AnalyticsRouter.get("/dashboard", auth, getDashboardStats);

// Revenue analytics
AnalyticsRouter.get("/revenue", auth, getRevenueAnalytics);

// Appointment analytics
AnalyticsRouter.get("/appointments", auth, getAppointmentAnalytics);

// Customer analytics
AnalyticsRouter.get("/customers", auth, getCustomerAnalytics);

// Employee performance analytics
AnalyticsRouter.get("/employees", auth, getEmployeePerformance);

AnalyticsRouter.get("/reviews/analytics", auth, getReviewAnalytics);

// Popular services analytics - only for admins and superadmins
AnalyticsRouter.get(
  "/services/popular",
  auth,
  auth.authorize("superadmin", "admin"),
  getPopularServices
);

// Service performance analytics - only for admins and superadmins
AnalyticsRouter.get(
  "/services/:serviceId",
  auth,
  auth.authorize("superadmin", "admin"),
  getServicePerformance
);

// Review statistics for specific company (optional)
// AnalyticsRouter.get(
//   "/reviews/company",
//   auth,
//   auth.authorize("superadmin", "admin"),
//   getReviewStatistics
// );
export default AnalyticsRouter;
