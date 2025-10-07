// Backend/src/modules/review/review.model.js
import mongoose from "mongoose";
import {
  validateAppointmentBeforeSave,
  updateTimestampsBeforeUpdate,
  removeReviewReferenceBeforeDelete,
  syncAllRatingsAfterSave,
  syncAllRatingsAfterUpdate,
  syncAllRatingsAfterDelete,
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
  // Rating components - clear naming
  ratings: {
    service: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    company: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    stylist: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overall: {
      type: Number,
      default: function () {
        // Auto-calculate overall as average of three components
        return (
          (this.ratings.service + this.ratings.company + this.ratings.stylist) /
          3
        );
      },
    },
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

// Pre-save middleware to calculate overall rating
reviewSchema.pre("save", function (next) {
  // Check if any ratings are being modified and are valid numbers
  if (
    (this.isModified("ratings.service") && this.ratings.service) ||
    (this.isModified("ratings.company") && this.ratings.company) ||
    (this.isModified("ratings.stylist") && this.ratings.stylist)
  ) {
    const { service, company, stylist } = this.ratings;

    // Only calculate if all ratings are valid numbers
    if (
      typeof service === "number" &&
      typeof company === "number" &&
      typeof stylist === "number" &&
      !isNaN(service) &&
      !isNaN(company) &&
      !isNaN(stylist)
    ) {
      this.ratings.overall = (service + company + stylist) / 3;
    }
  }
  next();
});

// Simplified middleware registration
reviewSchema.pre("save", validateAppointmentBeforeSave);
reviewSchema.pre("findOneAndUpdate", updateTimestampsBeforeUpdate);
reviewSchema.pre("findOneAndDelete", removeReviewReferenceBeforeDelete);

// Single post-save middleware for all rating sync
reviewSchema.post("save", syncAllRatingsAfterSave);
reviewSchema.post("findOneAndUpdate", syncAllRatingsAfterUpdate);
reviewSchema.post("findOneAndDelete", syncAllRatingsAfterDelete);

export default mongoose.model("Review", reviewSchema);
