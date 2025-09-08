// Backend\routes\appointment.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointment.controller");

router.get("/", auth, appointmentController.getAppointments);
router.get(
  "/company/:companyId",
  auth,
  appointmentController.getAppointmentsByCompany
);
router.get(
  "/styler/:companyId",
  auth,
  appointmentController.getAppointmentsByStyler
);

router.get("/today", auth, appointmentController.getTodayAppointments); // Add this route
router.get("/upcoming", auth, appointmentController.getUpcomingAppointments); // Add this route
router.post("/", auth, appointmentController.createAppointment);
router.put("/:id/status", auth, appointmentController.updateAppointmentStatus);
router.delete("/:id", auth, appointmentController.deleteAppointment);

module.exports = router;
