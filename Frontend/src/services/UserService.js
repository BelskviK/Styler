// src/services/UserService.js
import api from "./api";

class UserService {
  // Stilists.jsx
  static async getStylists() {
    return api.get("/users");
  }
  // Settings.jsx
  // CompanyPage.jsx
  static async getCurrentUser() {
    return api.get("/users/me");
  }
  // AppointmentForm.jsx
  static async getCompanyUsers() {
    return api.get("/users/company");
  }

  // Settings.jsx
  // Stilists.jsx
  static async updateUser(id, data) {
    return api.put(`/users/${id}`, data);
  }

  // Stilists.jsx
  // StylistsView.jsx
  // AppointmentForm.jsx
  static async getStylistWithServices(stylistId) {
    return api.get(`/users/stylist/${stylistId}`);
  }

  // TODO NOT IN USE WITH FRONTEND {}
  static async getCompanyStylists(companyId) {
    return api.get(`/users/company/${companyId}/stylists`);
  }

  static async addEmployee(data) {
    return api.post("/users/employee", data);
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
