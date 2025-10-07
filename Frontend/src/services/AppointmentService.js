// src/services/AppointmentService.js
import api from "./api";

class AppointmentService {
  // TODO IN USE {}
  // ✅ used by Appointments.jsx
  static async getAppointmentsByCompany(companyId) {
    return api.get(`/appointments/company/${companyId}`);
  } // ✅ used by TodaySchedule.jsx
  static async getTodayAppointments(userId, role) {
    return api.get(`/appointments/today?userId=${userId}&role=${role}`);
  }
  static async getAppointmentById(appointmentId) {
    return api.get(`/appointments/${appointmentId}`);
  }
  // ✅ used by UpcomingAppointments.jsx
  static async getUpcomingAppointments(userId, role) {
    return api.get(`/appointments/upcoming?userId=${userId}&role=${role}`);
  }

  // TODO END-POIND.................. done?
  static async getBusyTimeSlots(companyId, stylistId, date) {
    return api.get(`/appointments/availability`, {
      params: { companyId, stylistId, date },
    });
  }

  // ✅ used by Appointments.jsx
  static async getAppointmentsByStyler() {
    return api.get(`/appointments/styler`);
  }

  // ✅ used by Appointments.jsx
  // TODO END-POIND
  static async getAppointmentsByCustomer() {
    return api.get(`/appointments/customer`);
  }

  // ✅ used by AppointmentForm.jsx
  // ✅ used by CompanyPage.jsx
  static async createAppointment(data) {
    return api.post("/appointments", data);
  }

  // ✅ used by TodaySchedule.jsx
  // ✅ used by Appointments.jsx
  static async updateAppointmentStatus(id, status) {
    return api.put(`/appointments/${id}/status`, { status });
  }

  // ✅ used by Appointments.jsx
  static async deleteAppointment(id) {
    return api.delete(`/appointments/${id}`);
  }

  // TODO NOT IN USE
  // ❌ Not in use
  static async createPublic(data) {
    return api.post("/public/appointments", data);
  }
}

export default AppointmentService;
