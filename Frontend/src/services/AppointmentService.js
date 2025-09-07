// src/services/AppointmentService.js
import api from "./api";

class AppointmentService {
  static async getAll() {
    return api.get("/appointments");
  }

  static async getByCompany(companyId) {
    return api.get(`/appointments/company/${companyId}`);
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
