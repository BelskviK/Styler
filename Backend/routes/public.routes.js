// routes/public.routes.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");

// @route   GET /api/public/company/:companyId/stylists
// @desc    Get available stylists for a company (public)
// @access  Public
router.get("/company/:companyId/stylists", async (req, res) => {
  try {
    const { companyId } = req.params;

    const stylists = await User.find({
      company: companyId,
      role: "styler",
    })
      .select("name profileImage expertise schedule description rating")
      .populate("services", "name description duration price imageUrl");

    res.status(200).json(stylists);
  } catch (err) {
    console.error("Error fetching public stylists:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/public/stylist/:stylistId/services
// @desc    Get available services for a stylist (public)
// @access  Public
router.get("/stylist/:stylistId/services", async (req, res) => {
  try {
    const { stylistId } = req.params;

    const stylist = await User.findById(stylistId).populate(
      "services",
      "name description duration price image"
    );

    if (!stylist) {
      return res.status(404).json({ message: "Stylist not found" });
    }

    res.status(200).json(stylist.services || []);
  } catch (err) {
    console.error("Error fetching public services:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/public/appointments
// @desc    Create appointment for non-authenticated users
// @access  Public
router.post("/appointments", async (req, res) => {
  try {
    const {
      stylistId,
      serviceId,
      date,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail,
      notes,
    } = req.body;

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

    // Create appointment with guest customer
    const appointment = new Appointment({
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
      isGuestBooking: true, // Flag to identify guest bookings
    });

    await appointment.save();

    // Send notification to stylist - ADDED THIS
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

    res.status(201).json({
      success: true,
      appointment: await Appointment.findById(appointment._id)
        .populate("stylist", "name email")
        .populate("service", "name price duration imageUrl")
        .populate("company", "name"),
    });
  } catch (err) {
    console.error("Public appointment creation error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
});

module.exports = router;
