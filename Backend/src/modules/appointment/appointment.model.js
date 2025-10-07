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
      return !this.isGuestBooking;
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
  isAdminCreation: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
    default: null,
  },
});

// Post-save middleware
appointmentSchema.post("save", updateCompanyAppointments);
appointmentSchema.post("save", updateCustomerAppointments);
appointmentSchema.post("save", updateStylistAppointments);

// Post-remove middleware
appointmentSchema.post("findOneAndDelete", removeCompanyAppointmentRef);
appointmentSchema.post("findOneAndDelete", removeCustomerAppointmentRef);
appointmentSchema.post("findOneAndDelete", removeStylistAppointmentRef);

export default mongoose.model("Appointment", appointmentSchema);
