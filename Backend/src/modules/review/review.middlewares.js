// Backend/src/modules/review/review.middlewares.js
import mongoose from "mongoose";
import Company from "../company/company.model.js";
import User from "../user/user.model.js";
import Appointment from "../appointment/appointment.model.js";
import Review from "./review.model.js";

/**
 * Pre-save middleware to validate appointment before saving review
 */
export const validateAppointmentBeforeSave = async function (next) {
  try {
    const appointment = await Appointment.findById(this.appointment).populate(
      "company"
    );

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (!["completed", "cancelled"].includes(appointment.status)) {
      throw new Error("Can only review completed or cancelled appointments");
    }

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
      await Appointment.findByIdAndUpdate(review.appointment, {
        $unset: { review: "" },
      });
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
 * MAIN RATING SYNC MIDDLEWARE - Handles all rating synchronizations
 */
export const syncAllRatingsAfterSave = async function (doc) {
  try {
    console.log("🔄 Syncing all ratings for review:", doc._id);

    // Sync company ratings
    await syncCompanyRatings(doc.company);

    // Sync stylist ratings
    await syncStylistRatings(doc.stylist);

    // Link review to appointment
    await linkReviewToAppointment(doc);

    console.log("✅ All ratings synced successfully");
  } catch (error) {
    console.error("❌ Error syncing ratings:", error);
  }
};

/**
 * Sync company ratings (using NESTED structure)
 */
const syncCompanyRatings = async (companyId) => {
  try {
    const companyReviews = await Review.find({ company: companyId });

    if (companyReviews.length === 0) {
      await Company.findByIdAndUpdate(companyId, {
        "reviews.rating": 0,
        "reviews.companyRating": 0,
        "reviews.serviceRating": 0,
        "reviews.count": 0,
      });
      return;
    }

    // FIXED: Use nested ratings structure
    const companyRatingAvg =
      companyReviews.reduce((sum, review) => sum + review.ratings.company, 0) /
      companyReviews.length;

    const serviceRatingAvg =
      companyReviews.reduce((sum, review) => sum + review.ratings.service, 0) /
      companyReviews.length;

    const overallRatingAvg = (companyRatingAvg + serviceRatingAvg) / 2;

    await Company.findByIdAndUpdate(companyId, {
      "reviews.rating": parseFloat(overallRatingAvg.toFixed(1)),
      "reviews.companyRating": parseFloat(companyRatingAvg.toFixed(1)),
      "reviews.serviceRating": parseFloat(serviceRatingAvg.toFixed(1)),
      "reviews.count": companyReviews.length,
    });

    console.log("✅ Company ratings synced:", {
      overall: parseFloat(overallRatingAvg.toFixed(1)),
      company: parseFloat(companyRatingAvg.toFixed(1)),
      service: parseFloat(serviceRatingAvg.toFixed(1)),
      count: companyReviews.length,
    });
  } catch (error) {
    console.error("❌ Error syncing company ratings:", error);
    throw error;
  }
};

/**
 * Sync stylist ratings (using NESTED structure)
 */
const syncStylistRatings = async (stylistId) => {
  try {
    const stylistReviews = await Review.find({ stylist: stylistId });

    if (stylistReviews.length === 0) {
      await User.findByIdAndUpdate(stylistId, {
        rating: 0,
        reviewCount: 0,
      });
      return;
    }

    // FIXED: Use nested ratings structure
    const stylistRatingAvg =
      stylistReviews.reduce((sum, review) => sum + review.ratings.stylist, 0) /
      stylistReviews.length;

    await User.findByIdAndUpdate(stylistId, {
      rating: parseFloat(stylistRatingAvg.toFixed(1)),
      reviewCount: stylistReviews.length,
    });

    console.log("✅ Stylist ratings synced:", {
      rating: parseFloat(stylistRatingAvg.toFixed(1)),
      count: stylistReviews.length,
    });
  } catch (error) {
    console.error("❌ Error syncing stylist ratings:", error);
    throw error;
  }
};

/**
 * Link review to appointment and update references
 */
const linkReviewToAppointment = async (doc) => {
  try {
    await Appointment.findByIdAndUpdate(doc.appointment, {
      review: doc._id,
    });

    await Company.findByIdAndUpdate(doc.company, {
      $addToSet: { appointments: doc.appointment },
    });

    await User.findByIdAndUpdate(doc.stylist, {
      $addToSet: { appointments: doc.appointment },
    });

    console.log("✅ Review linked to appointment");
  } catch (error) {
    console.error("❌ Error linking review to appointment:", error);
    throw error;
  }
};

/**
 * Post-update middleware
 */
export const syncAllRatingsAfterUpdate = async function (doc) {
  if (doc) {
    try {
      console.log("🔄 Syncing ratings after review update:", doc._id);
      await syncAllRatingsAfterSave(doc);
    } catch (error) {
      console.error("❌ Error syncing ratings after update:", error);
    }
  }
};

/**
 * Post-delete middleware
 */
export const syncAllRatingsAfterDelete = async function (doc) {
  if (doc) {
    try {
      console.log("🔄 Syncing ratings after review deletion:", doc._id);

      // Sync both company and stylist that lost this review
      await syncCompanyRatings(doc.company);
      await syncStylistRatings(doc.stylist);

      console.log("✅ Ratings synced after deletion");
    } catch (error) {
      console.error("❌ Error syncing ratings after deletion:", error);
    }
  }
};

/**
 * Utility to verify rating synchronization
 */
export const verifyRatingSync = async function (
  companyId = null,
  stylistId = null
) {
  try {
    console.log("🔍 Verifying rating synchronization...");

    if (companyId) {
      const companyReviews = await Review.find({ company: companyId });
      const company = await Company.findById(companyId);

      const calculatedOverall =
        companyReviews.length > 0
          ? (companyReviews.reduce((sum, r) => sum + r.ratings.company, 0) /
              companyReviews.length +
              companyReviews.reduce((sum, r) => sum + r.ratings.service, 0) /
                companyReviews.length) /
            2
          : 0;

      console.log("📊 Company Rating Sync Check:", {
        stored: company.reviews.rating,
        calculated: parseFloat(calculatedOverall.toFixed(1)),
        inSync:
          company.reviews.rating === parseFloat(calculatedOverall.toFixed(1)),
      });
    }

    if (stylistId) {
      const stylistReviews = await Review.find({ stylist: stylistId });
      const stylist = await User.findById(stylistId);

      const calculatedRating =
        stylistReviews.length > 0
          ? stylistReviews.reduce((sum, r) => sum + r.ratings.stylist, 0) /
            stylistReviews.length
          : 0;

      console.log("📊 Stylist Rating Sync Check:", {
        stored: stylist.rating,
        calculated: parseFloat(calculatedRating.toFixed(1)),
        inSync: stylist.rating === parseFloat(calculatedRating.toFixed(1)),
      });
    }
  } catch (error) {
    console.error("❌ Error verifying rating sync:", error);
  }
};
