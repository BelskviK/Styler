const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");

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
      .populate("customer", "name email")
      .populate("stylist", "name email")
      .populate("service", "name price duration")
      .populate("company", "name");

    res.status(200).json(appointments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Create an appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  console.log("📥 Received appointment creation request:", req.body);
  console.log("👤 User making request:", req.user);

  const {
    stylistId,
    serviceId,
    date,
    startTime,
    endTime,
    notes,
    customerName,
    customerPhone,
  } = req.body;

  try {
    // TEMPORARY FIX: If auth middleware is removed, allow all requests
    // Remove this temporary fix once auth middleware is restored
    if (!req.user) {
      console.warn(
        "⚠️  No user authentication - proceeding without permission checks"
      );

      // For testing purposes, create a temporary customer
      const customer = new User({
        name: customerName || "Temp Customer",
        phone: customerPhone || "0000000000",
        role: "customer",
        company: "68a10fb0102bc83919e269ac", // Use a default company ID
        email: `${customerPhone || "temp"}@temp.com`,
        password: Math.random().toString(36).slice(-8),
      });
      await customer.save();

      const stylist = await User.findById(stylistId);
      const service = await Service.findById(serviceId);

      const appointment = new Appointment({
        customer: customer._id,
        stylist: stylistId,
        service: serviceId,
        company: stylist.company,
        date,
        startTime,
        endTime,
        notes,
        status: "pending",
      });

      await appointment.save();

      return res.status(201).json({
        success: true,
        appointment: await Appointment.findById(appointment._id)
          .populate("customer", "name email phone")
          .populate("stylist", "name email")
          .populate("service", "name price duration"),
      });
    }

    // Allow customers, admins, AND stylists to create appointments
    if (
      req.user.role !== "customer" &&
      req.user.role !== "admin" &&
      req.user.role !== "styler"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to create appointments" });
    }

    let customerId;

    // If admin/styler is creating appointment for a new customer
    if (
      (req.user.role === "admin" || req.user.role === "styler") &&
      (customerName || customerPhone)
    ) {
      // Create a new customer user
      const customer = new User({
        name: customerName,
        phone: customerPhone,
        role: "customer",
        company: req.user.company,
        email: `${customerPhone}@temp.com`,
        password: Math.random().toString(36).slice(-8),
      });
      await customer.save();
      customerId = customer._id;
    } else {
      // Use existing customer (logged-in customer)
      customerId = req.user._id;
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

    // Check permissions
    if (req.user.role === "admin" || req.user.role === "styler") {
      if (stylist.company.toString() !== req.user.company.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized for this stylist" });
      }
      if (service.company.toString() !== req.user.company.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized for this service" });
      }
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
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (conflictingAppointment) {
      return res.status(400).json({ message: "Time slot already booked" });
    }

    const appointment = new Appointment({
      customer: customerId,
      stylist: stylistId,
      service: serviceId,
      company: stylist.company,
      date,
      startTime,
      endTime,
      notes,
      status: "pending",
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      appointment: await Appointment.findById(appointment._id)
        .populate("customer", "name email phone")
        .populate("stylist", "name email")
        .populate("service", "name price duration"),
    });
  } catch (err) {
    console.error("Appointment creation error:", err);
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

    res.status(200).json({
      success: true,
      appointment: await Appointment.findById(appointment._id)
        .populate("customer", "name email")
        .populate("stylist", "name email")
        .populate("service", "name price duration"),
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

    await appointment.remove();

    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Add these to your existing appointment.controller.js

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
