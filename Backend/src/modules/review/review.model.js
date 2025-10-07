// Backend/src/modules/review/review.model.js
import mongoose from "mongoose";
import {
  validateAppointmentBeforeSave,
  updateTimestampsBeforeUpdate,
  removeReviewReferenceBeforeDelete,
  updateCompanyAfterSave,
  updateStylistAfterSave,
  linkReviewToAppointmentAfterSave,
  recalculateRatingsAfterUpdate,
  recalculateRatingsAfterDelete,
} from "./review.middlewares.js";

export const reviewSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  stylist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: true,
    unique: true,
  },
  serviceRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  companyRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  stylistRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

reviewSchema.pre("save", validateAppointmentBeforeSave);
reviewSchema.pre("findOneAndUpdate", updateTimestampsBeforeUpdate);
reviewSchema.pre("findOneAndDelete", removeReviewReferenceBeforeDelete);

reviewSchema.post("save", updateCompanyAfterSave);
reviewSchema.post("save", updateStylistAfterSave);
reviewSchema.post("save", linkReviewToAppointmentAfterSave);
reviewSchema.post("findOneAndUpdate", recalculateRatingsAfterUpdate);
reviewSchema.post("findOneAndDelete", recalculateRatingsAfterDelete);

export default mongoose.model("Review", reviewSchema);
