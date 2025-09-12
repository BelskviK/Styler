import mongoose from "mongoose";
import {
  updateCompanyAppointments,
  updateCustomerAppointments,
  updateStylistAppointments,
  removeCompanyAppointmentRef,
  removeCustomerAppointmentRef,
  removeStylistAppointmentRef,
} from "../../middleware/appointment.middlewares.js";
export const appointmentSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return !this.isGuestBooking; // Only required for non-guest bookings
    },
  },
  customerName: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    default: "",
  },
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
    default: "pending",
  },
  notes: {
    type: String,
    default: "",
  },
  isGuestBooking: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Post-save middleware to update Company
appointmentSchema.post("save", { document: true }, updateCompanyAppointments);

// Post-save middleware to update Customer (user with role 'customer')
appointmentSchema.post("save", { document: true }, updateCustomerAppointments);

// Post-save middleware to update Stylist (user with role 'styler')
appointmentSchema.post("save", { document: true }, updateStylistAppointments);

// Post-remove middleware
appointmentSchema.post(
  "remove",
  { document: true },
  removeCompanyAppointmentRef
);
appointmentSchema.post(
  "remove",
  { document: true },
  removeCustomerAppointmentRef
);
appointmentSchema.post(
  "remove",
  { document: true },
  removeStylistAppointmentRef
);
export default mongoose.model("Appointment", appointmentSchema);
