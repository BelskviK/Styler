// Backend/src/modules/review/review.model.js
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
    unique: true,
  },
  // CHANGE: Split rating into overall and stylist rating
  overallRating: {
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
      .findById(this.appointment)
      .populate("company");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // CHANGE: Allow both completed AND cancelled appointments
    if (!["completed", "cancelled"].includes(appointment.status)) {
      throw new Error("Can only review completed or cancelled appointments");
    }

    // Check if customer matches appointment customer
    if (this.customer.toString() !== appointment.customer.toString()) {
      throw new Error("Only the appointment customer can leave a review");
    }

    // Set company and stylist from appointment
    this.company = appointment.company._id;
    this.stylist = appointment.stylist;

    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Update company and stylist ratings when a review is saved
reviewSchema.post("save", async function () {
  try {
    const Review = mongoose.model("Review");
    const Company = mongoose.model("Company");
    const User = mongoose.model("User");

    // Calculate new average rating for company (using overallRating)
    const companyReviews = await Review.find({
      company: this.company,
      status: "approved",
    });

    const companyTotalRating = companyReviews.reduce(
      (sum, review) => sum + review.overallRating,
      0
    );
    const companyAverageRating =
      companyReviews.length > 0
        ? companyTotalRating / companyReviews.length
        : 0;

    // Update company rating and count
    await Company.findByIdAndUpdate(this.company, {
      "reviews.rating": companyAverageRating,
      "reviews.count": companyReviews.length,
    });

    // Calculate new average rating for stylist (using stylistRating)
    const stylistReviews = await Review.find({
      stylist: this.stylist,
      status: "approved",
    });

    const stylistTotalRating = stylistReviews.reduce(
      (sum, review) => sum + review.stylistRating,
      0
    );
    const stylistAverageRating =
      stylistReviews.length > 0
        ? stylistTotalRating / stylistReviews.length
        : 0;

    // Update stylist rating
    await User.findByIdAndUpdate(this.stylist, {
      rating: stylistAverageRating,
      reviewCount: stylistReviews.length,
    });
  } catch (error) {
    console.error("Error updating ratings:", error);
  }
});

export default mongoose.model("Review", reviewSchema);
