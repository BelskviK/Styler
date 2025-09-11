// Backend\controllers\appointment.controller.js
import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import Service from "../models/Service.js";
class AppointmentController {
  // @desc    Get all appointments
  // @route   GET /api/appointments
  // @access  Private
  async getAppointments(req, res) {
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
  }

  async getAppointmentsByCompany(req, res) {
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
  }
  // @desc    Get appointments by styler within a company
  // @route   GET /api/appointments/company/:companyId/styler/:stylerId
  // @access  Private
  async getAppointmentsByStyler(req, res) {
    try {
      // Verify user has access to this company's data
      if (req.user.role !== "styler") {
        return res.status(403).json({
          message: "Access denied. Only stylers can view their appointments",
        });
      }
      const stylerId = req.user._id;
      const companyId = req.user.company;

      console.log(
        `Fetching appointments for styler: ${stylerId} in company: ${companyId}`
      );
      const appointments = await Appointment.find({
        company: companyId,
        stylist: stylerId,
      })
        .populate("customer", "name email phone")
        .populate("stylist", "name email")
        .populate("service", "name price duration imageUrl")
        .populate("company", "name")
        .sort({ date: -1, startTime: -1 });

      res.status(200).json(appointments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Get today's appointments
  async getTodayAppointments(req, res) {
    try {
      const { userId, role } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      let query = {
        date: {
          $gte: today.toISOString().split("T")[0],
          $lt: tomorrow.toISOString().split("T")[0],
        },
      };

      // Filter based on role and user ID
      if (role === "styler") {
        query.stylist = userId;
      } else if (role === "customer") {
        return res.status(503).json({ message: "Not authorized" });
      } else if (role === "admin") {
        // For admin, get appointments for their company
        const adminUser = await User.findById(userId);
        if (adminUser && adminUser.company) {
          query.company = adminUser.company;
        }
      } else if (role === "superadmin") {
        const adminUser = await User.findById(userId);
        if (adminUser && adminUser.company) {
          query.company = adminUser.company;
        }
      } else {
        // Default case for other roles or no role specified
        return res.status(403).json({ message: "Not authorized" });
      }

      // For non-superadmin users, ensure they can only see their company's appointments
      if (role !== "superadmin" && role !== "customer") {
        const user = await User.findById(userId);
        if (user && user.company) {
          query.company = user.company;
        }
      }

      const appointments = await Appointment.find(query)
        .populate("customer", "name email phone")
        .populate("stylist", "name email")
        .populate("service", "name price duration")
        .populate("company", "name")
        .sort({ startTime: 1 });

      const formattedAppointments = appointments.map((appt) => ({
        id: appt._id,
        appointmentTime: new Date(`${appt.date}T${appt.startTime}`),
        customerName:
          appt.customer?.name || appt.customerName || "Unknown Customer",
        stylerName: appt.stylist?.name || "Unknown Styler",
        serviceName: appt.service?.name || "Unknown Service",
        status: appt.status,
        date: appt.date,
        startTime: appt.startTime,
        endTime: appt.endTime,
        companyId: appt.company?._id || null,
        companyName: appt.company?.name || "Unknown Company",
      }));

      res.json(formattedAppointments);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(req, res) {
    try {
      const { userId, role } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let query = {
        date: {
          $gte: today.toISOString().split("T")[0],
        },
      };

      // Filter based on role and user ID
      if (role === "styler") {
        query.stylist = userId;
      } else if (role === "customer") {
        query.customer = userId;
      } else if (role === "admin") {
        // For admin, get appointments for their company
        const adminUser = await User.findById(userId);
        if (adminUser && adminUser.company) {
          query.company = adminUser.company;
        }
      } else if (role === "superadmin") {
        const adminUser = await User.findById(userId);
        if (adminUser && adminUser.company) {
          query.company = adminUser.company;
        }
      } else {
        // Default case for other roles or no role specified
        return res.status(403).json({ message: "Not authorized" });
      }

      // For non-superadmin users, ensure they can only see their company's appointments
      if (role !== "superadmin" && role !== "customer") {
        const user = await User.findById(userId);
        if (user && user.company) {
          query.company = user.company;
        }
      }

      const appointments = await Appointment.find(query)
        .populate("customer", "name email phone")
        .populate("stylist", "name email")
        .populate("service", "name price duration")
        .populate("company", "name")
        .sort({ date: 1, startTime: 1 });

      const formattedAppointments = appointments.map((appt) => ({
        id: appt._id,
        appointmentTime: new Date(`${appt.date}T${appt.startTime}`),
        customerName:
          appt.customer?.name || appt.customerName || "Unknown Customer",
        stylerName: appt.stylist?.name || "Unknown Styler",
        serviceName: appt.service?.name || "Unknown Service",
        status: appt.status,
        date: appt.date,
        startTime: appt.startTime,
        endTime: appt.endTime,
        companyId: appt.company?._id || null,
        companyName: appt.company?.name || "Unknown Company",
      }));

      res.json(formattedAppointments);
    } catch (error) {
      console.error("Error fetching upcoming appointments:", error);
      res.status(500).json({ message: error.message });
    }
  }

  async createAppointment(req, res) {
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

      // Send notification to stylist
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
      if (
        customerId &&
        customerEmail &&
        customerEmail !== "guest@example.com"
      ) {
        try {
          const notificationService = req.app.get("notificationService");
          if (notificationService) {
            await notificationService.sendToUser(
              customerId,
              "Appointment Confirmed",
              `Your appointment with ${
                stylist.name
              } is confirmed for ${new Date(
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
  }

  // @desc    Update appointment status
  // @route   PUT /api/appointments/:id/status
  // @access  Private (admin or stylist)
  async updateAppointmentStatus(req, res) {
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

      // Send notifications if notification service is available
      try {
        const notificationService = req.app.get("notificationService");
        if (notificationService) {
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
        }
      } catch (notificationError) {
        console.error("❌ Error sending notifications:", notificationError);
        // Don't fail the status update if notifications fail
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
  }

  // @desc    Delete appointment
  // @route   DELETE /api/appointments/:id
  // @access  Private (admin or customer who created it)
  async deleteAppointment(req, res) {
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

      await Appointment.deleteOne({ _id: req.params.id });

      res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  }

  // @desc    Get availability
  // @route   GET /api/appointments/availability
  // @access  Private
  async checkAvailability(req, res) {
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
  }
}
export default new AppointmentController();
