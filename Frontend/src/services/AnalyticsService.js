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
}

export default AnalyticsService;
