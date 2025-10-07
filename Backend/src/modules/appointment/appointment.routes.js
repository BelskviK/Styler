// Backend/src/modules/appointment/appointment.routes.js
import express from "express";
import auth from "../../middleware/auth.js";
import {
  getAppointmentsByCompany,
  getTodayAppointments,
  getUpcomingAppointments,
  CheckBusySlots,
  getAppointmentsByStyler,
  getAppointmentsByCustomer,
  createAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  appointmentService,
  getAppointmentById,
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
router.get("/availability", CheckBusySlots);
router.get("/styler", auth, getAppointmentsByStyler);
router.get("/customer", auth, getAppointmentsByCustomer); // TODO
router.get("/:id", auth, getAppointmentById); // Add this line

// ---- CREATE ----
router.post("/", createAppointment); // ✅ (public for guest bookings)

// ---- UPDATE ----
router.put("/:id/status", auth, updateAppointmentStatus); // ✅

// ---- DELETE ----
router.delete("/:id", auth, deleteAppointment); // ✅

export default router;
