// src/services/ServiceService.js
import api from "./api";

class ServiceService {
  // Services.jsx
  // ServiceForm.jsx
  // Stylist.jsx
  static async getServices() {
    return api.get("/services");
  }

  // Services.jsx
  // ServiceForm.jsx
  static async createService(data) {
    return api.post("/services", data);
  }

  // Services.jsx
  // ServiceForm.jsx
  static async updateService(id, data) {
    return api.put(`/services/${id}`, data);
  }

  // Services.jsx
  // ServiceForm.jsx
  static async deleteService(id) {
    return api.delete(`/services/${id}`);
  }

  // Stylist.jsx
  // StylistsView.jsx
  static async assignServicesToStylist(stylistId, serviceIds) {
    return api.put(`/services/assign/${stylistId}`, { serviceIds });
  }
}

export default ServiceService;
