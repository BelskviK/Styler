// src/services/CompanyService.js
import api from "./api";

class CompanyService {
  static async getAll() {
    return api.get("/companies");
  }

  static async getById(id) {
    return api.get(`/companies/${id}`);
  }

  static async getMyCompany() {
    return api.get("/companies/me");
  }

  static async create(data) {
    return api.post("/companies", data);
  }

  static async update(id, data) {
    return api.put(`/companies/${id}`, data);
  }

  static async delete(id) {
    return api.delete(`/companies/${id}`);
  }
}

export default CompanyService;
