// Backend/src/modules/appointment/appointment.routes.js
import express from "express";
import auth from "../../middleware/auth.js";
import {
  getAppointmentsByCompany,
  getTodayAppointments,
  getUpcomingAppointments,
  checkAppountmantAvailability,
  getAppointmentsByStyler,
  getAppointmentsByCustomer,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  appointmentService,
} from "./appointment.controller.js";

const router = express.Router();

// Set notification service when available
export function setAppointmentNotificationService(notificationService) {
  appointmentService.setNotificationService(notificationService);
}

/**
 * Appointment Routes
 */

// ---- READ ----
router.get("/company/:companyId", auth, getAppointmentsByCompany); // ✅
router.get("/today", auth, getTodayAppointments); // ✅
router.get("/upcoming", auth, getUpcomingAppointments); // ✅
router.get("/availability", auth, checkAppountmantAvailability); // TODO
router.get("/styler", auth, getAppointmentsByStyler);
router.get("/customer", auth, getAppointmentsByCustomer); // TODO

// ---- CREATE ----
router.post("/", createAppointment); // ✅ (public for guest bookings)

// ---- UPDATE ----
router.put("/:id/status", auth, updateAppointmentStatus); // ✅

// ---- DELETE ----
router.delete("/:id", auth, deleteAppointment); // ✅

export default router;
