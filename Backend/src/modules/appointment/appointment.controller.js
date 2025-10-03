// Backend/src/modules/appointment/appointment.controller.js
import AppointmentService from "./appointment.service.js";

// Initialize service (will be set with notification service in routes)
export const appointmentService = new AppointmentService();

export async function getAppointmentsByCompany(req, res) {
  try {
    const { companyId } = req.params;
    const appointments = await appointmentService.getAppointmentsByCompany(
      companyId,
      req.user
    );
    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res
      .status(err.message.includes("Not authorized") ? 403 : 500)
      .json({ message: err.message });
  }
}
// Get today's appointments
export async function getTodayAppointments(req, res) {
  try {
    const { userId, role } = req.query;
    const appointments = await appointmentService.getTodayAppointments(
      userId,
      role
    );
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res
      .status(error.message.includes("Not authorized") ? 403 : 500)
      .json({ message: error.message });
  }
}
// Get upcoming appointments
export async function getUpcomingAppointments(req, res) {
  try {
    const { userId, role } = req.query;
    const appointments = await appointmentService.getUpcomingAppointments(
      userId,
      role
    );
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    res
      .status(error.message.includes("Not authorized") ? 403 : 500)
      .json({ message: error.message });
  }
}
// TODO
// @desc    Get availability
// @route   GET /api/appointments/availability
// @access  Private
export async function checkAppountmantAvailability(req, res) {
  try {
    const { stylistId, date, startTime, endTime } = req.query;
    const availability = await appointmentService.checkAvailability(
      stylistId,
      date,
      startTime,
      endTime
    );
    res.status(200).json(availability);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// @desc    Get appointments by styler within a company
// @route   GET /api/appointments/company/:companyId/styler/:stylerId
// @access  Private
export async function getAppointmentsByStyler(req, res) {
  try {
    const stylerId = req.user._id;
    const companyId = req.user.company;
    const appointments = await appointmentService.getAppointmentsByStyler(
      stylerId,
      companyId,
      req.user
    );
    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res
      .status(err.message.includes("Access denied") ? 403 : 500)
      .json({ message: err.message });
  }
}

// TODO
export async function getAppointmentsByCustomer(req, res) {
  try {
    const user = req.user;
    const appointments = await appointmentService.getAppointmentsByCustomer(
      user
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
}

export async function createAppointment(req, res) {
  try {
    const appointment = await appointmentService.createAppointment(
      req.body,
      req.user
    );
    res.status(201).json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error("❌ Appointment creation error:", err);
    res
      .status(
        err.message.includes("Missing required")
          ? 400
          : err.message.includes("not found")
          ? 404
          : err.message.includes("already booked")
          ? 400
          : 500
      )
      .json({
        message: err.message,
        error: err.message,
      });
  }
}

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (admin or stylist)
export async function updateAppointmentStatus(req, res) {
  try {
    const { status } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(
      req.params.id,
      status,
      req.user
    );
    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error(err);
    res
      .status(
        err.message.includes("Not authorized")
          ? 403
          : err.message.includes("not found")
          ? 404
          : 500
      )
      .json({ message: err.message });
  }
}

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (admin or customer who created it)
export async function deleteAppointment(req, res) {
  try {
    const result = await appointmentService.deleteAppointment(
      req.params.id,
      req.user
    );
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res
      .status(
        err.message.includes("Not authorized")
          ? 403
          : err.message.includes("not found")
          ? 404
          : 500
      )
      .json({ message: err.message });
  }
}
