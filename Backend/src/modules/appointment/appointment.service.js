// Backend/src/modules/appointment/appointment.service.js
import Appointment from "./appointment.model.js";
import User from "../user/user.model.js";
import Service from "../service/service.model.js";

class AppointmentService {
  constructor(notificationService = null) {
    this.notificationService = notificationService;
  }

  setNotificationService(notificationService) {
    this.notificationService = notificationService;
  }

  // Get all appointments with filters based on user role
  async getAppointments(user) {
    let query = {};

    if (user.role === "admin") {
      query = { company: user.company };
    } else if (user.role === "styler") {
      query = { stylist: user._id, company: user.company };
    } else if (user.role === "customer") {
      query = { customer: user._id };
    } else if (user.role !== "superadmin") {
      throw new Error("Not authorized to access this resource");
    }

    return await Appointment.find(query)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");
  }

  // Get appointments by company
  async getAppointmentsByCompany(companyId, user) {
    if (user.role !== "superadmin" && user.company.toString() !== companyId) {
      throw new Error("Not authorized to access this company's appointments");
    }

    return await Appointment.find({ company: companyId })
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");
  }

  // Get appointments by styler
  async getAppointmentsByStyler(stylerId, companyId, user) {
    if (user.role !== "styler") {
      throw new Error(
        "Access denied. Only stylers can view their appointments"
      );
    }

    return await Appointment.find({
      company: companyId,
      stylist: stylerId,
    })
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name")
      .sort({ date: -1, startTime: -1 });
  }

  // get appointments by customer
  async getAppointmentsByCustomer(user) {
    if (user.role !== "customer") {
      throw new Error(
        "Access denied. Only customer can view their appointments"
      );
    }

    const appointments = await Appointment.find({
      customer: user._id,
    })
      .populate("stylist", "name email phone profileImage expertise rating")
      .populate("service", "name price duration description")
      .populate("company", "name location image")
      .sort({ date: 1, startTime: 1 }) // Sort by upcoming first
      .lean();

    return appointments;
  }
  // Get today's appointments
  async getTodayAppointments(userId, role) {
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

    if (role === "styler") {
      query.stylist = userId;
    } else if (role === "admin" || role === "superadmin") {
      const adminUser = await User.findById(userId);
      if (adminUser && adminUser.company) {
        query.company = adminUser.company;
      }
    } else {
      throw new Error("Not authorized");
    }

    const appointments = await Appointment.find(query)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration")
      .populate("company", "name")
      .sort({ startTime: 1 });

    return appointments.map((appt) => ({
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
  }

  // Get upcoming appointments
  async getUpcomingAppointments(userId, role) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let query = {
      date: {
        $gte: today.toISOString().split("T")[0],
      },
    };

    if (role === "styler") {
      query.stylist = userId;
    } else if (role === "customer") {
      query.customer = userId;
    } else if (role === "admin" || role === "superadmin") {
      const adminUser = await User.findById(userId);
      if (adminUser && adminUser.company) {
        query.company = adminUser.company;
      }
    } else {
      throw new Error("Not authorized");
    }

    const appointments = await Appointment.find(query)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration")
      .populate("company", "name")
      .sort({ date: 1, startTime: 1 });

    return appointments.map((appt) => ({
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
  }

  // Create appointment
  async createAppointment(appointmentData, user = null) {
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
    } = appointmentData;

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
      throw new Error("Missing required fields");
    }

    let customerId = null;

    // If user is authenticated, use their ID
    if (user) {
      customerId = user._id;
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
      throw new Error("Stylist not found");
    }

    // Find service
    const service = await Service.findById(serviceId);
    if (!service) {
      throw new Error("Service not found");
    }

    // Check if stylist is assigned to this service
    if (!stylist.services.includes(serviceId)) {
      throw new Error("Stylist is not assigned to this service");
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
      throw new Error("Time slot already booked");
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
      isGuestBooking: !user,
    });

    await appointment.save();

    // Send notification to stylist
    if (this.notificationService) {
      try {
        await this.notificationService.sendToUser(
          stylistId,
          "New Appointment Booking",
          `You have a new appointment with ${customerName} on ${new Date(
            date
          ).toLocaleDateString()} at ${startTime} for ${service.name}`,
          "appointment",
          appointment._id
        );
        console.log("✅ Notification sent to stylist:", stylistId);
      } catch (notificationError) {
        console.error("❌ Error sending notification:", notificationError);
        // Don't fail the appointment creation if notification fails
      }
    }

    // Send notification to customer if they have a real account
    if (
      customerId &&
      customerEmail &&
      customerEmail !== "guest@example.com" &&
      this.notificationService
    ) {
      try {
        await this.notificationService.sendToUser(
          customerId,
          "Appointment Confirmed",
          `Your appointment with ${stylist.name} is confirmed for ${new Date(
            date
          ).toLocaleDateString()} at ${startTime}`,
          "appointment",
          appointment._id
        );
      } catch (notificationError) {
        console.error(
          "❌ Error sending customer notification:",
          notificationError
        );
      }
    }

    // Populate and return the appointment
    return await Appointment.findById(appointment._id)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status, user) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Check authorization
    if (
      (user.role === "admin" &&
        appointment.company.toString() !== user.company.toString()) ||
      (user.role === "styler" &&
        appointment.stylist.toString() !== user._id.toString())
    ) {
      throw new Error("Not authorized to update this appointment");
    }

    appointment.status = status;
    await appointment.save();

    // Send notifications
    if (this.notificationService) {
      try {
        // Notify customer about status change
        if (appointment.customer.toString() !== user._id.toString()) {
          await this.notificationService.sendToUser(
            appointment.customer,
            "Appointment Status Updated",
            `Your appointment status has been changed to ${status}`,
            "appointment",
            appointment._id
          );
        }

        // Notify stylist about status change (if not the one making the change)
        if (appointment.stylist.toString() !== user._id.toString()) {
          await this.notificationService.sendToUser(
            appointment.stylist,
            "Appointment Status Updated",
            `Appointment with ${appointment.customerName} status changed to ${status}`,
            "appointment",
            appointment._id
          );
        }
      } catch (notificationError) {
        console.error("❌ Error sending notifications:", notificationError);
      }
    }

    return await Appointment.findById(appointment._id)
      .populate("customer", "name email")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl");
  }

  // Delete appointment
  async deleteAppointment(appointmentId, user) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Check authorization
    if (
      (user.role === "admin" &&
        appointment.company.toString() !== user.company.toString()) ||
      (user.role === "customer" &&
        appointment.customer.toString() !== user._id.toString())
    ) {
      throw new Error("Not authorized to delete this appointment");
    }

    await Appointment.deleteOne({ _id: appointmentId });
    return { success: true, message: "Appointment deleted successfully" };
  }

  // Check availability
  async checkAvailability(stylistId, date, startTime, endTime) {
    const conflictingAppointment = await Appointment.findOne({
      stylist: stylistId,
      date,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    return {
      available: !conflictingAppointment,
      conflictingAppointment,
    };
  }
}

export default AppointmentService;
