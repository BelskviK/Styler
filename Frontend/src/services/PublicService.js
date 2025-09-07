// src/services/PublicService.js
import axios from "axios";
import { API_BASE } from "@/config";

const publicApi = axios.create({
  baseURL: `${API_BASE}/api/public`,
  withCredentials: true,
});

class PublicService {
  static async createAppointment(data) {
    return publicApi.post("/appointments", data);
  }

  static async getCompanyStylists(companyId) {
    return publicApi.get(`/company/${companyId}/stylists`);
  }

  static async getStylistServices(stylistId) {
    return publicApi.get(`/stylist/${stylistId}/services`);
  }
}

export default PublicService;
