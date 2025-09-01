// src/services/StylistService.js
import api from "./api";

class StylistService {
  static async getAll() {
    return api.get("/users");
  }

  static async register(data) {
    return api.post("/auth/register", data);
  }

  static async update(id, data) {
    return api.put(`/users/${id}`, data);
  }

  static async assignServices(stylistId, serviceIds) {
    return api.put(`/services/assign/${stylistId}`, { serviceIds });
  }

  static async getCompanyServices(companyId) {
    return api.get(`/services?companyId=${companyId}`);
  }

  static async getAssignedServices(stylistId) {
    return api.get(`/services/assigned/${stylistId}`);
  }

  // FIXED: Remove query param
  static async getWithServices(stylistId) {
    return api.get(`/users/${stylistId}`);
  }
  static async getStylistWithServices(stylistId) {
    return api.get(`/users/stylist/${stylistId}`);
  }
}

export default StylistService;
