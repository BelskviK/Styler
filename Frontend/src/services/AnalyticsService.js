// src/services/AnalyticsService.js
import api from "@/services/api";

class AnalyticsService {
  // SuperadminMetrics.jsx
  static async getDashboardStats(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/dashboard", { params });
  }

  // PopularServices.jsx
  static async getPopularServices(
    timeframe = "monthly",
    companyId = null,
    limit = 5
  ) {
    const params = { timeframe, limit };
    if (companyId) params.companyId = companyId;

    return api.get("/analytics/services/popular", { params });
  }

  static async getReviewStatistics(companyId = null) {
    // ← This is the correct method name
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/reviews", { params });
  }

  // TODO NOT IN USE IN FRONTEND

  // Update the method names to be consistent
  static async getReviewStats(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/reviews", { params });
  }

  static async getReviewAnalytics(timeframe = "monthly", companyId = null) {
    const params = { timeframe };
    if (companyId) params.companyId = companyId;
    return api.get("/analytics/reviews/analytics", { params });
  } // src/services/AnalyticsService.js

  static async getServicePerformance(
    serviceId,
    timeframe = "monthly",
    companyId = null
  ) {
    const params = { timeframe };
    if (companyId) params.companyId = companyId;

    return api.get(`/analytics/services/${serviceId}`, { params });
  }

  static async getEmployeePerformance(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/employees", { params });
  }
  static async getCustomerAnalytics(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/customers", { params });
  }
  static async getAppointmentAnalytics(
    timeframe = "monthly",
    companyId = null
  ) {
    const params = { timeframe, companyId };
    return api.get("/analytics/appointments", { params });
  }

  static async getRevenueAnalytics(timeframe = "monthly", companyId = null) {
    const params = { timeframe, companyId };
    return api.get("/analytics/revenue", { params });
  }
}

export default AnalyticsService;
