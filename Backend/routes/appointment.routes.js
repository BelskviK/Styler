// Backend\routes\appointment.routes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointment.controller");

router.get("/", auth, appointmentController.getAppointments);
router.post("/", auth, appointmentController.createAppointment); // Add auth back
router.put("/:id/status", auth, appointmentController.updateAppointmentStatus);
router.delete("/:id", auth, appointmentController.deleteAppointment);

module.exports = router;
