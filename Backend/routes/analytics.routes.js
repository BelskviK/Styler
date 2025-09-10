// Backend/routes/analytics.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const analyticsController = require("../controllers/analytics.controller");

// Dashboard overview statistics
router.get("/dashboard", auth, analyticsController.getDashboardStats);

// Revenue analytics
router.get("/revenue", auth, analyticsController.getRevenueAnalytics);

// Appointment analytics
router.get("/appointments", auth, analyticsController.getAppointmentAnalytics);

// Customer analytics
router.get("/customers", auth, analyticsController.getCustomerAnalytics);

// Employee performance analytics
router.get("/employees", auth, analyticsController.getEmployeePerformance);

// Review statistics analytics
router.get("/reviews", auth, analyticsController.getReviewStatistics);
router.get("/reviews/analytics", auth, analyticsController.getReviewAnalytics);

// Popular services analytics - only for admins and superadmins
router.get(
  "/services/popular",
  auth,
  auth.authorize("superadmin", "admin"),
  analyticsController.getPopularServices
);

// Service performance analytics - only for admins and superadmins
router.get(
  "/services/:serviceId",
  auth,
  auth.authorize("superadmin", "admin"),
  analyticsController.getServicePerformance
);

// Review statistics for specific company (optional)
router.get(
  "/reviews/company/:companyId",
  auth,
  auth.authorize("superadmin", "admin"),
  analyticsController.getReviewStatistics
);

module.exports = router;
