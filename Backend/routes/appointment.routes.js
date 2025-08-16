const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointment.controller");

// @route   GET /api/appointments
// @desc    Get all appointments
// @access  Private
router.get("/", auth, appointmentController.getAppointments);

// @route   POST /api/appointments
// @desc    Create an appointment
// @access  Private
router.post("/", auth, appointmentController.createAppointment);

// @route   PUT /api/appointments/:id/status
// @desc    Update appointment status
// @access  Private (admin or stylist)
router.put("/:id/status", auth, appointmentController.updateAppointmentStatus);

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private (admin or customer who created it)
router.delete("/:id", auth, appointmentController.deleteAppointment);

module.exports = router;
