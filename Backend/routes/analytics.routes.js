// Backend/routes/analytics.routes.js
import express from "express";
const AnalyticsRouter = express.Router();
import auth from "../middleware/auth.js";

import analyticsController from "../controllers/analytics.controller.js";

// Review statistics analytics
AnalyticsRouter.get("/reviews", auth, analyticsController.getReviewStatistics);
// Dashboard overview statistics
AnalyticsRouter.get("/dashboard", auth, analyticsController.getDashboardStats);

// Revenue analytics
AnalyticsRouter.get("/revenue", auth, analyticsController.getRevenueAnalytics);

// Appointment analytics
AnalyticsRouter.get(
  "/appointments",
  auth,
  analyticsController.getAppointmentAnalytics
);

// Customer analytics
AnalyticsRouter.get(
  "/customers",
  auth,
  analyticsController.getCustomerAnalytics
);

// Employee performance analytics
AnalyticsRouter.get(
  "/employees",
  auth,
  analyticsController.getEmployeePerformance
);

AnalyticsRouter.get(
  "/reviews/analytics",
  auth,
  analyticsController.getReviewAnalytics
);

// Popular services analytics - only for admins and superadmins
AnalyticsRouter.get(
  "/services/popular",
  auth,
  auth.authorize("superadmin", "admin"),
  analyticsController.getPopularServices
);

// Service performance analytics - only for admins and superadmins
AnalyticsRouter.get(
  "/services/:serviceId",
  auth,
  auth.authorize("superadmin", "admin"),
  analyticsController.getServicePerformance
);

// Review statistics for specific company (optional)
AnalyticsRouter.get(
  "/reviews/company",
  auth,
  auth.authorize("superadmin", "admin"),
  analyticsController.getReviewStatistics
);
export default AnalyticsRouter;
// Backend
