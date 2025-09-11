// Backend/models/Review.js
import mongoose from "mongoose";

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
    unique: true, // Prevent multiple reviews for same appointment
  },
  rating: {
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
    default: "pending",
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

// Pre-save middleware to validate appointment status
reviewSchema.pre("save", async function (next) {
  try {
    const appointment = await mongoose
      .model("Appointment")
      .findById(this.appointment);

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Check if appointment is completed (not cancelled or pending)
    if (appointment.status !== "completed") {
      throw new Error("Can only review completed appointments");
    }

    // Check if customer matches appointment customer
    if (this.customer.toString() !== appointment.customer.toString()) {
      throw new Error("Only the appointment customer can leave a review");
    }

    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Update company rating when a review is saved
reviewSchema.post("save", async function () {
  try {
    const Review = mongoose.model("Review");
    const Company = mongoose.model("Company");

    // Calculate new average rating
    const reviews = await Review.find({
      company: this.company,
      status: "approved",
    });

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    // Update company rating and count
    await Company.findByIdAndUpdate(this.company, {
      "reviews.rating": averageRating,
      "reviews.count": reviews.length,
    });
  } catch (error) {
    console.error("Error updating company rating:", error);
  }
});

export default mongoose.model("Review", reviewSchema);
