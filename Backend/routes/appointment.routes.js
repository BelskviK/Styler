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
router.post("/", auth, appointmentController.createAppointment);
router.put("/:id/status", auth, appointmentController.updateAppointmentStatus);
router.delete("/:id", auth, appointmentController.deleteAppointment);

module.exports = router;
