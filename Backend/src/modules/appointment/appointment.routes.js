// Backend/src/modules/appointment/appointment.routes.js
import express from "express";
import auth from "../../middleware/auth.js";
import {
  getAppointments,
  getAppointmentsByCompany,
  getAppointmentsByStyler,
  getTodayAppointments,
  getUpcomingAppointments,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  checkAvailability,
  appointmentService,
} from "./appointment.controller.js";

const router = express.Router();

// Set notification service when available
export function setAppointmentNotificationService(notificationService) {
  appointmentService.setNotificationService(notificationService);
}

// Routes
router.get("/", auth, getAppointments);
router.get("/company/:companyId", auth, getAppointmentsByCompany);
router.get(
  "/company/:companyId/styler/:stylerId",
  auth,
  getAppointmentsByStyler
);
router.get("/today", auth, getTodayAppointments);
router.get("/upcoming", auth, getUpcomingAppointments);
router.post("/", createAppointment); // Note: This can be public for guest bookings
router.put("/:id/status", auth, updateAppointmentStatus);
router.delete("/:id", auth, deleteAppointment);
router.get("/availability", auth, checkAvailability);

export default router;
