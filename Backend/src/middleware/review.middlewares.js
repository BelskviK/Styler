// Backend/src/middleware/review.middlewares.js
import mongoose from "mongoose";
import Company from "../modules/company/company.model.js";
import User from "../modules/user/user.model.js";
import Appointment from "../modules/appointment/appointment.model.js";
import Review from "../modules/review/review.model.js";

/**
 * Pre-save middleware to validate appointment before saving review
 */
export const validateAppointmentBeforeSave = async function (next) {
  try {
    const appointment = await mongoose
      .model("Appointment")
      .findById(this.appointment)
      .populate("company");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Allow both completed AND cancelled appointments
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
};

/**
 * Pre-update middleware to update timestamps
 */
export const updateTimestampsBeforeUpdate = function (next) {
  this.set({ updatedAt: Date.now() });
  next();
};

/**
 * Pre-delete middleware to remove review reference from appointment
 */
export const removeReviewReferenceBeforeDelete = async function (next) {
  try {
    const review = await this.model.findOne(this.getFilter());
    if (review) {
      await mongoose
        .model("Appointment")
        .findByIdAndUpdate(review.appointment, { $unset: { review: "" } });
      console.log("✅ Review reference removed from appointment");
    }
    next();
  } catch (error) {
    console.error(
      "❌ Error removing review reference from appointment:",
      error
    );
    next(error);
  }
};

/**
 * Post-save middleware to update company ratings
 */
export const updateCompanyAfterSave = async function (doc) {
  try {
    console.log("🔄 Updating company ratings for review:", doc._id);

    const companyReviews = await Review.find({
      company: doc.company,
      status: "approved",
    });

    // Calculate company rating average
    const companyRatingTotal = companyReviews.reduce(
      (sum, review) => sum + review.companyRating,
      0
    );
    const companyRatingAverage =
      companyReviews.length > 0
        ? companyRatingTotal / companyReviews.length
        : 0;

    // Calculate service rating average
    const serviceRatingTotal = companyReviews.reduce(
      (sum, review) => sum + review.serviceRating,
      0
    );
    const serviceRatingAverage =
      companyReviews.length > 0
        ? serviceRatingTotal / companyReviews.length
        : 0;

    // Calculate overall average (combination of company and service ratings)
    const overallRatingAverage =
      companyReviews.length > 0
        ? (companyRatingAverage + serviceRatingAverage) / 2
        : 0;

    // Update company with all rating statistics
    await Company.findByIdAndUpdate(doc.company, {
      "reviews.rating": overallRatingAverage,
      "reviews.companyRating": companyRatingAverage,
      "reviews.serviceRating": serviceRatingAverage,
      "reviews.count": companyReviews.length,
    });

    console.log("✅ Company ratings updated successfully");
  } catch (error) {
    console.error("❌ Error updating company ratings:", error);
  }
};

/**
 * Post-save middleware to update stylist ratings
 */
export const updateStylistAfterSave = async function (doc) {
  try {
    console.log("🔄 Updating stylist ratings for review:", doc._id);

    const stylistReviews = await Review.find({
      stylist: doc.stylist,
      status: "approved",
    });

    // Calculate stylist rating average
    const stylistTotalRating = stylistReviews.reduce(
      (sum, review) => sum + review.stylistRating,
      0
    );
    const stylistAverageRating =
      stylistReviews.length > 0
        ? stylistTotalRating / stylistReviews.length
        : 0;

    // Update stylist rating and review count
    await User.findByIdAndUpdate(doc.stylist, {
      rating: stylistAverageRating,
      reviewCount: stylistReviews.length,
    });

    console.log("✅ Stylist ratings updated successfully");
  } catch (error) {
    console.error("❌ Error updating stylist ratings:", error);
  }
};

/**
 * Post-save middleware to link review to appointment
 */
export const linkReviewToAppointmentAfterSave = async function (doc) {
  try {
    console.log("🔄 Linking review to appointment:", doc._id);

    await Appointment.findByIdAndUpdate(doc.appointment, {
      review: doc._id,
    });

    console.log("✅ Review linked to appointment successfully");
  } catch (error) {
    console.error("❌ Error linking review to appointment:", error);
  }
};

/**
 * Post-update middleware to recalculate ratings after review update
 * Uses document: true to get the updated document
 */
export const recalculateRatingsAfterUpdate = async function (doc) {
  if (doc) {
    try {
      console.log("🔄 Recalculating ratings after review update:", doc._id);
      await updateCompanyAfterSave(doc);
      await updateStylistAfterSave(doc);
      console.log("✅ Ratings recalculated after update");
    } catch (error) {
      console.error("❌ Error recalculating ratings after update:", error);
    }
  }
};

/**
 * Post-delete middleware to recalculate ratings after review deletion
 */
export const recalculateRatingsAfterDelete = async function (doc) {
  if (doc) {
    try {
      console.log("🔄 Recalculating ratings after review deletion:", doc._id);
      await recalculateAllRatingsForDeletedReview();
      console.log("✅ Ratings recalculated after deletion");
    } catch (error) {
      console.error("❌ Error recalculating ratings after deletion:", error);
    }
  }
};

/**
 * Utility function to recalculate all ratings when a review is deleted
 */
const recalculateAllRatingsForDeletedReview = async function () {
  try {
    console.log("🔄 Recalculating all ratings after review deletion");

    // Recalculate all company ratings
    const companies = await Company.find({});
    for (const company of companies) {
      const companyReviews = await Review.find({
        company: company._id,
        status: "approved",
      });

      if (companyReviews.length > 0) {
        const companyRatingTotal = companyReviews.reduce(
          (sum, review) => sum + review.companyRating,
          0
        );
        const companyRatingAverage = companyRatingTotal / companyReviews.length;

        const serviceRatingTotal = companyReviews.reduce(
          (sum, review) => sum + review.serviceRating,
          0
        );
        const serviceRatingAverage = serviceRatingTotal / companyReviews.length;

        const overallRatingAverage =
          (companyRatingAverage + serviceRatingAverage) / 2;

        await Company.findByIdAndUpdate(company._id, {
          "reviews.rating": overallRatingAverage,
          "reviews.companyRating": companyRatingAverage,
          "reviews.serviceRating": serviceRatingAverage,
          "reviews.count": companyReviews.length,
        });
      } else {
        // Reset if no reviews left
        await Company.findByIdAndUpdate(company._id, {
          "reviews.rating": 0,
          "reviews.companyRating": 0,
          "reviews.serviceRating": 0,
          "reviews.count": 0,
        });
      }
    }

    // Recalculate all stylist ratings
    const stylists = await User.find({ role: "styler" });
    for (const stylist of stylists) {
      const stylistReviews = await Review.find({
        stylist: stylist._id,
        status: "approved",
      });

      if (stylistReviews.length > 0) {
        const stylistTotalRating = stylistReviews.reduce(
          (sum, review) => sum + review.stylistRating,
          0
        );
        const stylistAverageRating = stylistTotalRating / stylistReviews.length;

        await User.findByIdAndUpdate(stylist._id, {
          rating: stylistAverageRating,
          reviewCount: stylistReviews.length,
        });
      } else {
        // Reset if no reviews left
        await User.findByIdAndUpdate(stylist._id, {
          rating: 0,
          reviewCount: 0,
        });
      }
    }

    console.log("✅ All ratings recalculated after deletion");
  } catch (error) {
    console.error("❌ Error recalculating ratings after deletion:", error);
  }
};

/**
 * Update customer statistics (placeholder for future functionality)
 */
export const updateCustomerAfterSave = async function (doc) {
  try {
    console.log("🔄 Updating customer statistics for review:", doc._id);
    // Future implementation: Update customer review count, loyalty points, etc.
    console.log("✅ Customer statistics updated successfully");
  } catch (error) {
    console.error("❌ Error updating customer statistics:", error);
  }
};
