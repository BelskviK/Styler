// Backend/src/modules/appointment/appointment.service.js
import Appointment from "./appointment.model.js";
import User from "../user/user.model.js";
import Service from "../service/service.model.js";
import mongoose from "mongoose";
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

  // Get appointments by customer
  async getAppointmentsByCustomer(user) {
    if (user.role !== "customer") {
      throw new Error(
        "Access denied. Only customers can view their appointments"
      );
    }

    const appointments = await Appointment.find({ customer: user._id })
      .populate("stylist", "name email phone profileImage expertise rating")
      .populate("service", "name price duration description")
      .populate("company", "name location image")
      .populate("review")
      .sort({ date: 1, startTime: 1 })
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
  // Backend/src/modules/appointment/appointment.service.js

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
      customerId,
    } = appointmentData;

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

    // Determine if this is an admin/superadmin creation
    const isAdminCreation =
      user && (user.role === "admin" || user.role === "superadmin");
    const isCustomerCreation = user && user.role === "customer";

    let customerIdToUse = null;
    let isGuestBooking = true;

    // STRATEGY 1: If customer is creating their own appointment
    if (isCustomerCreation) {
      customerIdToUse = user._id;
      isGuestBooking = false;
      console.log("✅ Customer creating own appointment:", user._id);
    }
    // STRATEGY 2: If admin is creating appointment with specific customer ID
    else if (isAdminCreation && customerId) {
      customerIdToUse = customerId;
      isGuestBooking = false;
      console.log(
        "👑 Admin creating appointment for specific customer:",
        customerId
      );
    }
    // STRATEGY 3: Search for existing customer by phone or email
    else {
      let foundCustomer = null;

      // Search by phone number with normalization
      if (customerPhone) {
        const normalizedPhone = this.normalizePhoneNumber(customerPhone);
        console.log(
          "📱 Searching for customer with normalized phone:",
          normalizedPhone
        );

        if (normalizedPhone) {
          // Find all customers and check for phone matches
          const allCustomers = await User.find({ role: "customer" });

          for (const customer of allCustomers) {
            if (customer.phone) {
              const normalizedCustomerPhone = this.normalizePhoneNumber(
                customer.phone
              );
              if (
                this.doPhoneNumbersMatch(
                  normalizedPhone,
                  normalizedCustomerPhone
                )
              ) {
                foundCustomer = customer;
                console.log(
                  "📱 Found customer by normalized phone:",
                  customer._id
                );
                break;
              }
            }
          }

          // If not found with normalization, try direct search as fallback
          if (!foundCustomer) {
            foundCustomer = await User.findOne({
              phone: customerPhone,
              role: "customer",
            });
            if (foundCustomer) {
              console.log(
                "📱 Found customer by exact phone:",
                foundCustomer._id
              );
            }
          }
        }
      }

      // If not found by phone, search by email
      if (
        !foundCustomer &&
        customerEmail &&
        customerEmail !== "guest@example.com"
      ) {
        foundCustomer = await User.findOne({
          email: customerEmail.toLowerCase().trim(),
          role: "customer",
        });
        if (foundCustomer) {
          console.log("📧 Found customer by email:", foundCustomer._id);
        }
      }

      if (foundCustomer) {
        customerIdToUse = foundCustomer._id;
        isGuestBooking = false;
        console.log("🔍 Assigning to existing customer:", foundCustomer._id);
      } else {
        console.log("👤 Creating as guest booking - no customer found");
      }
    }

    // Find stylist and service
    const stylist = await User.findById(stylistId);
    if (!stylist || stylist.role !== "styler") {
      throw new Error("Stylist not found");
    }

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

    // ✅ Create appointment with flags to prevent middleware duplication
    const appointment = new Appointment({
      customer: customerIdToUse,
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
      isGuestBooking,
      createdBy: user ? user._id : null,
      isAdminCreation: isAdminCreation,
      customerAssignedByService: !!customerIdToUse, // ✅ Set flag
      // ✅ Add flag for stylist to prevent middleware duplication
      relationshipsHandledByService: true, // ✅ NEW FLAG
    });

    await appointment.save();

    // ✅ MANUALLY update relationships to prevent middleware duplication
    try {
      // Update stylist's appointments array
      await User.findByIdAndUpdate(
        stylistId,
        { $addToSet: { appointments: appointment._id } },
        { new: true }
      );
      console.log("✅ Stylist appointments updated manually");

      // Update company's appointments array
      const Company = mongoose.model("Company");
      await Company.findByIdAndUpdate(
        stylist.company,
        { $addToSet: { appointments: appointment._id } },
        { new: true }
      );
      console.log("✅ Company appointments updated manually");

      // Update customer's appointments array if customer exists
      if (customerIdToUse) {
        await User.findByIdAndUpdate(
          customerIdToUse,
          { $addToSet: { appointments: appointment._id } },
          { new: true }
        );
        console.log("✅ Customer appointments updated manually");
      }
    } catch (updateError) {
      console.error("❌ Error updating relationships manually:", updateError);
    }

    // ✅ Send notifications (only once)
    if (this.notificationService) {
      try {
        // Send notification to stylist
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

        // Send notification to customer if assigned
        if (customerIdToUse) {
          await this.notificationService.sendToUser(
            customerIdToUse,
            "Appointment Scheduled",
            `Your appointment with ${stylist.name} is scheduled for ${new Date(
              date
            ).toLocaleDateString()} at ${startTime} for ${service.name}`,
            "appointment",
            appointment._id
          );
          console.log("✅ Notification sent to customer:", customerIdToUse);
        } else {
          console.log(
            "ℹ️ No customer notification sent - no customer ID found"
          );
        }
      } catch (notificationError) {
        console.error("❌ Error sending notifications:", notificationError);
      }
    }

    // Populate and return the appointment
    return await Appointment.findById(appointment._id)
      .populate("customer", "name email phone")
      .populate("stylist", "name email")
      .populate("service", "name price duration imageUrl")
      .populate("company", "name");
  }

  // Phone number helper functions
  normalizePhoneNumber(phone) {
    if (!phone) return null;
    try {
      return phone.toString().trim().replace(/\D/g, "");
    } catch (error) {
      console.error("❌ Error normalizing phone number:", error);
      return phone;
    }
  }

  doPhoneNumbersMatch(phone1, phone2) {
    if (!phone1 || !phone2) return false;
    return (
      phone1 === phone2 || phone1.includes(phone2) || phone2.includes(phone1)
    );
  } // Backend/src/modules/appointment/appointment.service.js
  // Add this method to the AppointmentService class
  async getAppointmentById(appointmentId, user) {
    const appointment = await Appointment.findById(appointmentId)
      .populate("customer", "name email phone")
      .populate("stylist", "name email profileImage expertise rating")
      .populate("service", "name price duration description")
      .populate("company", "name type location image");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Check authorization
    if (
      user.role === "customer" &&
      appointment.customer._id.toString() !== user._id.toString()
    ) {
      throw new Error("Not authorized to access this appointment");
    }

    if (
      user.role === "styler" &&
      appointment.stylist._id.toString() !== user._id.toString()
    ) {
      throw new Error("Not authorized to access this appointment");
    }

    if (
      user.role === "admin" &&
      appointment.company._id.toString() !== user.company.toString()
    ) {
      throw new Error("Not authorized to access this appointment");
    }

    return appointment;
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
  // Backend/src/modules/appointment/appointment.service.js

  // Check availability - returns all busy time slots
  async checkAvailability(companyId, stylistId, date) {
    try {
      // Validate inputs
      if (!companyId || !stylistId || !date) {
        throw new Error("companyId, stylistId, and date are required");
      }

      // Find all appointments for the specific company, stylist, and date
      const appointments = await Appointment.find({
        company: companyId,
        stylist: stylistId,
        date: new Date(date),
        status: { $in: ["pending", "confirmed"] }, // Only active appointments
      })
        .select("startTime endTime status customerName service notes")
        .populate("service", "name duration")
        .populate("customer", "name phone")
        .sort({ startTime: 1 }); // Sort by start time

      // Format the response to show busy slots
      const busySlots = appointments.map((appointment) => ({
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        customerName: appointment.customerName,
        service: appointment.service?.name || "Unknown Service",
        duration: appointment.service?.duration || 30,
        notes: appointment.notes || "",
      }));

      return busySlots;
    } catch (error) {
      console.error("❌ Error in checkAvailability:", error);
      throw new Error(`Failed to check availability: ${error.message}`);
    }
  }
}

export default AppointmentService;
