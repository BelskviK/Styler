// Backend/src/modules/appointment/appointment.controller.js
import AppointmentService from "./appointment.service.js";

// Initialize service (will be set with notification service in routes)
export const appointmentService = new AppointmentService();

// Helper function to validate date format
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateString.match(regex)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  return typeof timestamp === "number" && !isNaN(timestamp);
}
// @desc    Get busy appointments for company stylist on specific date
// @route   GET /api/appointments/availability
// @access  Public/Private (based on your needs)

export async function CheckBusySlots(req, res) {
  try {
    const { companyId, stylistId, date } = req.query;

    // Input validation
    if (!companyId || !stylistId || !date) {
      return res.status(400).json({
        success: false,
        message: "companyId, stylistId, and date are required in request body",
      });
    }

    // Validate date format
    if (!isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const busySlots = await appointmentService.checkAvailability(
      companyId,
      stylistId,
      date
    );

    // ✅ Simplified response - only return time ranges
    const simplifiedBusySlots = busySlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    res.status(200).json({
      success: true,
      companyId,
      stylistId,
      date,
      busySlots: simplifiedBusySlots, // ✅ Only startTime and endTime
      message:
        busySlots.length > 0
          ? "Busy appointments retrieved successfully"
          : "No appointments found for this date",
    });
  } catch (err) {
    console.error("❌ CheckBusyAppointments error:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export async function getAppointmentById(req, res) {
  try {
    const appointment = await appointmentService.getAppointmentById(
      req.params.id,
      req.user
    );
    res.status(200).json({
      success: true,
      appointment,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
}
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
} // Helper function to validate date format

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
      req.user // This now contains user role information
    );
    res.status(201).json({
      success: true,
      appointment,
      message:
        req.user &&
        (req.user.role === "admin" || req.user.role === "superadmin")
          ? "Appointment created successfully for customer"
          : "Appointment created successfully",
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
