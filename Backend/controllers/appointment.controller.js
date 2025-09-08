// Backend\controllers\appointment.controller.js
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query = {};

    // Admin: appointments for their company
    if (req.user.role === "admin") {
      query.company = req.user.company;
    }
    // Stylist: only their appointments
    else if (req.user.role === "styler") {
      query.stylist = req.user._id;
      query.company = req.user.company;
    }
    // Customer: only their appointments
    else if (req.user.role === "customer") {
      query.customer = req.user._id;
    }
    // Superadmin: optional filter by companyId
    else if (req.user.role === "superadmin") {
      const { companyId } = req.query;
      if (companyId) query.company = companyId;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    const appointments = await Appointment.find(query)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAppointmentsByCompany = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    // Verify user has access to this company's data
    if (
      req.user.role !== "superadmin" &&
      req.user.company.toString() !== companyId
    ) {
      return res.status(403).json({
        message: "Not authorized to access this company's appointments",
      });
    }

    const appointments = await Appointment.find({ company: companyId })
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAppointment = async (req, res, next) => {
  const {
    stylistId,
    serviceId,
    date,
    startTime,
    endTime,
    notes,
    customerName,
    customerPhone,
    customerEmail,
  } = req.body;

  try {
    // Validate required fields
    if (
      !stylistId ||
      !serviceId ||
      !date ||
      !startTime ||
      !endTime ||
      !customerName ||
      !customerPhone
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let customerId = null;

    // If user is authenticated, use their ID
    if (req.user) {
      customerId = req.user._id;
    } else {
      // For non-authenticated users, create a temporary customer record
      const tempCustomer = await User.findOne({
        role: "customer",
        email: "guest@example.com",
      });

      if (tempCustomer) {
        customerId = tempCustomer._id;
      } else {
        // Create a generic guest customer
        const guestCustomer = new User({
          name: "Guest Customer",
          email: "guest@example.com",
          phone: "000-000-0000",
          role: "customer",
          company: "68a10fb0102bc83919e269ac", // Default company
          password: Math.random().toString(36).slice(-8),
        });
        await guestCustomer.save();
        customerId = guestCustomer._id;
      }
    }

    // Find stylist
    const stylist = await User.findById(stylistId);
    if (!stylist || stylist.role !== "styler") {
      return res.status(404).json({ message: "Stylist not found" });
    }

    // Find service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Check if stylist is assigned to this service
    if (!stylist.services.includes(serviceId)) {
      return res
        .status(400)
        .json({ message: "Stylist is not assigned to this service" });
    }

    // Check for conflicting appointments
    const conflictingAppointment = await Appointment.findOne({
      stylist: stylistId,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
        { startTime: startTime, endTime: endTime },
      ],
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        message: "Time slot already booked",
        conflictingAppointment,
      });
    }

    // Create appointment
    const appointment = new Appointment({
      customer: customerId,
      customerName,
      customerPhone,
      customerEmail: customerEmail || "",
      stylist: stylistId,
      service: serviceId,
      company: stylist.company,
      date,
      startTime,
      endTime,
      notes: notes || "",
      status: "pending",
      isGuestBooking: !req.user, // Set based on whether user is authenticated
    });

    await appointment.save();

    // Send notification to stylist - FIXED
    try {
      const notificationService = req.app.get("notificationService");
      if (notificationService) {
        await notificationService.sendToUser(
          stylistId,
          "New Appointment Booking",
          `You have a new appointment with ${customerName} on ${new Date(
            date
          ).toLocaleDateString()} at ${startTime} for ${service.name}`,
          "appointment",
          appointment._id
        );
        console.log("✅ Notification sent to stylist:", stylistId);
      } else {
        console.error("❌ Notification service not available");
      }
    } catch (notificationError) {
      console.error("❌ Error sending notification:", notificationError);
      // Don't fail the appointment creation if notification fails
    }

    // Send notification to customer if they have a real account
    if (customerId && customerEmail && customerEmail !== "guest@example.com") {
      try {
        const notificationService = req.app.get("notificationService");
        if (notificationService) {
          await notificationService.sendToUser(
            customerId,
            "Appointment Confirmed",
            `Your appointment with ${stylist.name} is confirmed for ${new Date(
              date
            ).toLocaleDateString()} at ${startTime}`,
            "appointment",
            appointment._id
          );
        }
      } catch (notificationError) {
        console.error(
          "❌ Error sending customer notification:",
          notificationError
        );
      }
    }

    // Populate and return the appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");

    res.status(201).json({
      success: true,
      appointment: populatedAppointment,
    });
  } catch (err) {
    console.error("❌ Appointment creation error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query = {};

    // For admin, get all appointments for their company
    if (req.user.role === "admin") {
      query = { company: req.user.company };
    }
    // For stylist, get their appointments
    else if (req.user.role === "styler") {
      query = { stylist: req.user._id, company: req.user.company };
    }
    // For customer, get their appointments
    else if (req.user.role === "customer") {
      query = { customer: req.user._id };
    }
    // Superadmin can see all appointments
    else if (req.user.role !== "superadmin") {
      return res
        .status(403)
        .json({ message: "Not authorized to access this resource" });
    }

    const appointments = await Appointment.find(query)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (admin or stylist)
exports.updateAppointmentStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    if (req.user.role !== "admin" && req.user.role !== "styler") {
      return res
        .status(403)
        .json({ message: "Not authorized to update appointment status" });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if admin belongs to the same company or if stylist is the one assigned
    if (
      (req.user.role === "admin" &&
        appointment.company.toString() !== req.user.company.toString()) ||
      (req.user.role === "styler" &&
        appointment.stylist.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    const notificationService = req.app.get("notificationService");

    // Notify customer about status change
    if (appointment.customer.toString() !== req.user._id.toString()) {
      await notificationService.sendToUser(
        appointment.customer,
        "Appointment Status Updated",
        `Your appointment status has been changed to ${status}`,
        "appointment",
        appointment._id
      );
    }

    // Notify stylist about status change (if not the one making the change)
    if (appointment.stylist.toString() !== req.user._id.toString()) {
      await notificationService.sendToUser(
        appointment.stylist,
        "Appointment Status Updated",
        `Appointment with ${appointment.customerName} status changed to ${status}`,
        "appointment",
        appointment._id
      );
    }
    res.status(200).json({
      success: true,
      appointment: await Appointment.findById(appointment._id)
        .populate("customer", "name email")
        .populate("stylist", "name email")
        .populate("service", "name price duration imageUrl"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (admin or stylist)
exports.updateAppointmentStatus = async (req, res, next) => {
  const { status } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if admin belongs to the same company or if stylist is the one assigned
    if (appointment.company.toString() !== req.user.company.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this appointment" });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      appointment: await Appointment.findById(appointment._id)
        .populate("customer", "name email")
        .populate("stylist", "name email")
        .populate("service", "name price duration imageUrl"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private (admin or customer who created it)
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if user is admin of the company or customer who created the appointment
    if (
      (req.user.role === "admin" &&
        appointment.company.toString() !== req.user.company.toString()) ||
      (req.user.role === "customer" &&
        appointment.customer.toString() !== req.user._id.toString())
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this appointment" });
    }

    // Use deleteOne() instead of remove() - remove() is deprecated in newer Mongoose versions
    await Appointment.deleteOne({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get availability
// @route   GET /api/appointments/availability
// @access  Private
exports.checkAvailability = async (req, res, next) => {
  const { stylistId, date, startTime, endTime } = req.query;

  try {
    const conflictingAppointment = await Appointment.findOne({
      stylist: stylistId,
      date,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    res.status(200).json({
      available: !conflictingAppointment,
      conflictingAppointment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
