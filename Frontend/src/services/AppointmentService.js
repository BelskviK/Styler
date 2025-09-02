import api from "./api";

class AppointmentService {
  static async getAll() {
    return api.get("/appointments");
  }

  static async create(data) {
    return api.post("/appointments", {
      ...data,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
    });
  }

  static async updateStatus(id, status) {
    return api.put(`/appointments/${id}/status`, { status });
  }

  static async delete(id) {
    return api.delete(`/appointments/${id}`);
  }

  static getCompanyStylists(companyId) {
    return api.get(`/users/company/${companyId}/stylists`);
  }

  static getStylists() {
    return api.get("/users/stylists");
  }

  static getStylistWithServices(stylistId) {
    return api.get(`/users/stylist/${stylistId}`);
  }

  static async checkAvailability(stylistId, date, startTime, endTime) {
    return api.get(`/appointments/availability`, {
      params: { stylistId, date, startTime, endTime },
    });
  }
}

export default AppointmentService;
