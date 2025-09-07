// src/services/ServiceService.js
import api from "./api";

class ServiceService {
  static async getAll() {
    return api.get("/services");
  }

  static async getCompanyServices(companyId) {
    return api.get("/services", { params: { companyId } });
  }

  static async create(data) {
    return api.post("/services", data);
  }

  static async update(id, data) {
    return api.put(`/services/${id}`, data);
  }

  static async delete(id) {
    return api.delete(`/services/${id}`);
  }

  static async assignServices(stylistId, serviceIds) {
    return api.put(`/services/assign/${stylistId}`, { serviceIds });
  }
}

export default ServiceService;
