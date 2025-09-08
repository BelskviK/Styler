// src/services/AnalyticsService.js
import api from "@/services/api";

class AnalyticsService {
  static async getDashboardStats(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/dashboard", { params });
  }

  static async getRevenueAnalytics(timeframe = "monthly", companyId = null) {
    const params = { timeframe, companyId };
    return api.get("/analytics/revenue", { params });
  }

  static async getAppointmentAnalytics(
    timeframe = "monthly",
    companyId = null
  ) {
    const params = { timeframe, companyId };
    return api.get("/analytics/appointments", { params });
  }

  static async getCustomerAnalytics(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/customers", { params });
  }

  static async getEmployeePerformance(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/employees", { params });
  }
  static async getPopularServices(
    timeframe = "monthly",
    companyId = null,
    limit = 5
  ) {
    const params = { timeframe, limit };
    if (companyId) params.companyId = companyId;

    return api.get("/analytics/services/popular", { params });
  }

  static async getServicePerformance(
    serviceId,
    timeframe = "monthly",
    companyId = null
  ) {
    const params = { timeframe };
    if (companyId) params.companyId = companyId;

    return api.get(`/analytics/services/${serviceId}`, { params });
  }
}

export default AnalyticsService;
