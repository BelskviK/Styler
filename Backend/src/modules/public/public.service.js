import Appointment from "../appointment/appointment.model.js";
import User from "../user/user.model.js";
import Service from "../service/service.model.js";

class PublicService {
  /**
   * Get available stylists for a company
   * @param {string} companyId - Company ID
   * @returns {Promise<Array>} List of stylists
   */
  async getCompanyStylists(companyId) {
    try {
      const stylists = await User.find({
        company: companyId,
        role: "styler",
      })
        .select("name profileImage expertise schedule description rating")
        .populate("services", "name description duration price imageUrl");

      return { success: true, data: stylists };
    } catch (error) {
      console.error("Error fetching public stylists:", error);
      return { success: false, error: "Failed to fetch stylists" };
    }
  }

  /**
   * Get available services for a stylist
   * @param {string} stylistId - Stylist ID
   * @returns {Promise<Array>} List of services
   */
  async getStylistServices(stylistId) {
    try {
      const stylist = await User.findById(stylistId).populate(
        "services",
        "name description duration price image"
      );

      if (!stylist) {
        return { success: false, error: "Stylist not found", status: 404 };
      }

      return { success: true, data: stylist.services || [] };
    } catch (error) {
      console.error("Error fetching public services:", error);
      return { success: false, error: "Failed to fetch services" };
    }
  }

  /**
   * Create appointment for non-authenticated users
   * @param {Object} appointmentData - Appointment data
   * @param {Object} notificationService - Notification service instance
   * @returns {Promise<Object>} Created appointment
   */
  async createPublicAppointment(appointmentData, notificationService = null) {
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
        return {
          success: false,
          error: "Missing required fields",
          status: 400,
        };
      }

      // Find stylist
      const stylist = await User.findById(stylistId);
      if (!stylist || stylist.role !== "styler") {
        return { success: false, error: "Stylist not found", status: 404 };
      }

      // Find service
      const service = await Service.findById(serviceId);
      if (!service) {
        return { success: false, error: "Service not found", status: 404 };
      }

      // Check if stylist is assigned to this service
      if (!stylist.services.includes(serviceId)) {
        return {
          success: false,
          error: "Stylist is not assigned to this service",
          status: 400,
        };
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
        return {
          success: false,
          error: "Time slot already booked",
          conflictingAppointment,
          status: 400,
        };
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
        isGuestBooking: true,
      });

      await appointment.save();

      // Send notification to stylist if notification service is available
      if (notificationService) {
        try {
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
        } catch (notificationError) {
          console.error("❌ Error sending notification:", notificationError);
          // Don't fail the appointment creation if notification fails
        }
      }

      // Populate and return the created appointment
      const populatedAppointment = await Appointment.findById(appointment._id)
        .populate("stylist", "name email")
        .populate("service", "name price duration imageUrl")
        .populate("company", "name");

      return { success: true, data: populatedAppointment, status: 201 };
    } catch (error) {
      console.error("Public appointment creation error:", error);
      return {
        success: false,
        error: error.message || "Server error",
        status: 500,
      };
    }
  }
}

export default new PublicService();
