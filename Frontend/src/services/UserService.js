// src/services/UserService.js
import api from "./api";

class UserService {
  static async getStylists() {
    return api.get("/users");
  }

  static async getCurrentUser() {
    return api.get("/users/me");
  }

  static async getCompanyUsers() {
    return api.get("/users/company");
  }

  static async getCompanyStylists(companyId) {
    return api.get(`/users/company/${companyId}/stylists`);
  }

  static async addEmployee(data) {
    return api.post("/users/employee", data);
  }

  static async updateUser(id, data) {
    return api.put(`/users/${id}`, data);
  }

  static async getStylistWithServices(stylistId) {
    return api.get(`/users/stylist/${stylistId}`);
  }

  static async deleteUser(id) {
    return api.delete(`/users/${id}`);
  }

  // Add this method for customers to get available stylists
  static async getAvailableStylists(companyId) {
    return api.get(`/public/company/${companyId}/stylists`);
  }

  // Add this method for customers to get available services
  static async getAvailableServices(stylistId) {
    return api.get(`/public/stylist/${stylistId}/services`);
  }
}

export default UserService;
