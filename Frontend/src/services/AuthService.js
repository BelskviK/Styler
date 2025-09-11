// src/services/AuthService.js
import api from "./api";

class AuthService {
  // Register.jsx
  static async registerCustomer(data) {
    return api.post("/auth/register/customer", data);
  }

  static async login(credentials) {
    return api.post("/auth/login", credentials);
  }

  static async getMe() {
    return api.get("/auth/me");
  }

  static async logout() {
    return api.get("/auth/logout");
  }

  static async registerEmployee(data) {
    return api.post("/auth/register", data);
  }
}

export default AuthService;
