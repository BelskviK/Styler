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

module.exports = router;
