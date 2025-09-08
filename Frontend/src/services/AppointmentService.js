// src/services/AppointmentService.js
import api from "./api";

class AppointmentService {
  static async getAll() {
    return api.get("/appointments");
  }

  static async getByCompany(companyId) {
    return api.get(`/appointments/company/${companyId}`);
  }

  static async getByStyler(companyId) {
    return api.get(`/appointments/styler/${companyId}`);
  }

  static async getByCustomer(customerId) {
    return api.get(`/appointments/customer/${customerId}`);
  }

  static async getTodayAppointments(userId, role) {
    return api.get(`/appointments/today?userId=${userId}&role=${role}`);
  }

  static async getUpcomingAppointments(userId, role) {
    return api.get(`/appointments/upcoming?userId=${userId}&role=${role}`);
  }

  static async create(data) {
    return api.post("/appointments", data);
  }

  static async updateStatus(id, status) {
    return api.put(`/appointments/${id}/status`, { status });
  }

  static async delete(id) {
    return api.delete(`/appointments/${id}`);
  }

  static async createPublic(data) {
    return api.post("/public/appointments", data);
  }
}

export default AppointmentService;
