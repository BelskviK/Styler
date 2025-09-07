// src/services/NotificationService.js
import api from "./api";

class NotificationService {
  static async getAll() {
    return api.get("/notifications");
  }

  static async markAsRead(id) {
    return api.put(`/notifications/${id}/read`);
  }

  static async getUnreadCount() {
    return api.get("/notifications/unread/count");
  }

  static async sendBroadcast(data) {
    return api.post("/notifications/broadcast", data);
  }
}

export default NotificationService;
