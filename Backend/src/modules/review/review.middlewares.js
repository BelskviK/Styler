// Backend\src\modules\review\review.model.js
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
// Backend/src/middleware/review.middlewares.js - UPDATED updateCompanyAfterSave
export const updateCompanyAfterSave = async function (doc) {
  try {
    console.log("🔄 Updating company ratings for review:", doc._id);
    console.log("📊 Review status:", doc.status);

    // REMOVED: Status check - process ALL reviews regardless of status
    console.log("✅ Processing review for company ratings (all statuses)");

    const companyReviews = await Review.find({
      company: doc.company,
      // REMOVED: status: "approved" - include all reviews
    });

    console.log("📊 Found ALL reviews for company:", companyReviews.length);

    if (companyReviews.length === 0) {
      // Reset company ratings if no reviews
      await Company.findByIdAndUpdate(doc.company, {
        "reviews.rating": 0,
        "reviews.companyRating": 0,
        "reviews.serviceRating": 0,
        "reviews.count": 0,
      });
      console.log("✅ Company ratings reset (no reviews)");
      return;
    }

    // Calculate company rating average
    const companyRatingTotal = companyReviews.reduce(
      (sum, review) => sum + review.companyRating,
      0
    );
    const companyRatingAverage = companyRatingTotal / companyReviews.length;

    // Calculate service rating average
    const serviceRatingTotal = companyReviews.reduce(
      (sum, review) => sum + review.serviceRating,
      0
    );
    const serviceRatingAverage = serviceRatingTotal / companyReviews.length;

    // Calculate overall average (combination of company and service ratings)
    const overallRatingAverage =
      (companyRatingAverage + serviceRatingAverage) / 2;

    // Update company with all rating statistics
    await Company.findByIdAndUpdate(doc.company, {
      "reviews.rating": parseFloat(overallRatingAverage.toFixed(1)),
      "reviews.companyRating": parseFloat(companyRatingAverage.toFixed(1)),
      "reviews.serviceRating": parseFloat(serviceRatingAverage.toFixed(1)),
      "reviews.count": companyReviews.length,
    });

    console.log("✅ Company ratings updated successfully:", {
      overall: parseFloat(overallRatingAverage.toFixed(1)),
      company: parseFloat(companyRatingAverage.toFixed(1)),
      service: parseFloat(serviceRatingAverage.toFixed(1)),
      count: companyReviews.length,
    });
  } catch (error) {
    console.error("❌ Error updating company ratings:", error);
  }
};

// UPDATED updateStylistAfterSave
export const updateStylistAfterSave = async function (doc) {
  try {
    console.log("🔄 Updating stylist ratings for review:", doc._id);
    console.log("📊 Review status:", doc.status);

    // REMOVED: Status check - process ALL reviews regardless of status
    console.log("✅ Processing review for stylist ratings (all statuses)");

    const stylistReviews = await Review.find({
      stylist: doc.stylist,
      // REMOVED: status: "approved" - include all reviews
    });

    console.log("📊 Found ALL reviews for stylist:", stylistReviews.length);

    if (stylistReviews.length === 0) {
      // Reset stylist ratings if no reviews
      await User.findByIdAndUpdate(doc.stylist, {
        rating: 0,
        reviewCount: 0,
      });
      console.log("✅ Stylist ratings reset (no reviews)");
      return;
    }

    // Calculate stylist rating average
    const stylistTotalRating = stylistReviews.reduce(
      (sum, review) => sum + review.stylistRating,
      0
    );
    const stylistAverageRating = stylistTotalRating / stylistReviews.length;

    // Update stylist rating and review count
    await User.findByIdAndUpdate(doc.stylist, {
      rating: parseFloat(stylistAverageRating.toFixed(1)),
      reviewCount: stylistReviews.length,
    });

    console.log("✅ Stylist ratings updated successfully:", {
      rating: parseFloat(stylistAverageRating.toFixed(1)),
      count: stylistReviews.length,
    });
  } catch (error) {
    console.error("❌ Error updating stylist ratings:", error);
  }
};
// UPDATED updateStylistAfterSave
// Backend/controllers/analytics.controller.js - FIXED getReviewStatistics
export async function getReviewStatistics(req, res) {
  try {
    console.log("🔍 [DEBUG] getReviewStatistics called");
    const userCompany = req.user.company;
    const userRole = req.user.role;

    console.log("🔍 [DEBUG] User role:", userRole);
    console.log("🔍 [DEBUG] User company:", userCompany);

    let effectiveCompanyId;

    // Superadmin can view all companies or specific company
    if (userRole === "superadmin") {
      const { companyId } = req.query; // Allow superadmin to specify company
      effectiveCompanyId = companyId || userCompany;
      console.log(
        "🔍 [DEBUG] Superadmin mode, effective company:",
        effectiveCompanyId
      );
    } else {
      // Other roles can only view their own company
      effectiveCompanyId = userCompany;
    }

    if (!effectiveCompanyId) {
      console.log("❌ [DEBUG] No company ID found");
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    console.log("🔍 [DEBUG] Using company ID:", effectiveCompanyId);

    // First, let's check if the company exists
    const company = await Company.findById(effectiveCompanyId);
    if (!company) {
      console.log("❌ [DEBUG] Company not found:", effectiveCompanyId);
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    console.log("🔍 [DEBUG] Company found:", company.name);

    // Get ALL reviews for this company (including pending) for analytics
    const reviews = await Review.find({
      company: effectiveCompanyId,
      // Remove status filter to see all reviews
    }).select("serviceRating companyRating stylistRating status createdAt");

    console.log("🔍 [DEBUG] Total reviews found:", reviews.length);

    // Separate approved and pending reviews
    const approvedReviews = reviews.filter((r) => r.status === "approved");
    const pendingReviews = reviews.filter((r) => r.status === "pending");

    console.log("📊 [DEBUG] Approved reviews:", approvedReviews.length);
    console.log("📊 [DEBUG] Pending reviews:", pendingReviews.length);

    if (approvedReviews.length === 0) {
      console.log("⚠️ [DEBUG] No approved reviews found");
      // Return zeros but with debug info
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          averageServiceRating: 0,
          averageCompanyRating: 0,
          averageStylistRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          percentageDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          debug: {
            totalReviews: reviews.length,
            approvedReviews: approvedReviews.length,
            pendingReviews: pendingReviews.length,
            companyName: company.name,
          },
        },
      });
    }

    // Calculate statistics from APPROVED reviews only
    const stats = await Review.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(effectiveCompanyId),
          status: "approved", // Only approved reviews for statistics
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageServiceRating: { $avg: "$serviceRating" },
          averageCompanyRating: { $avg: "$companyRating" },
          averageStylistRating: { $avg: "$stylistRating" },
          averageOverallRating: {
            $avg: {
              $avg: ["$serviceRating", "$companyRating", "$stylistRating"],
            },
          },
          serviceRatings: { $push: "$serviceRating" },
        },
      },
    ]);

    console.log(
      "🔍 [DEBUG] Aggregation result:",
      JSON.stringify(stats, null, 2)
    );

    const result = stats[0] || {
      totalReviews: 0,
      averageServiceRating: 0,
      averageCompanyRating: 0,
      averageStylistRating: 0,
      averageOverallRating: 0,
      serviceRatings: [],
    };

    // Calculate distribution from service ratings
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const serviceRatings = result.serviceRatings || [];

    console.log("📊 [DEBUG] Service ratings for distribution:", serviceRatings);

    serviceRatings.forEach((rating) => {
      if (distribution.hasOwnProperty(rating)) {
        distribution[rating]++;
      }
    });

    console.log("📊 [DEBUG] Calculated distribution:", distribution);

    const totalReviews = result.totalReviews || 0;
    const percentageDistribution = {
      5: totalReviews ? Math.round((distribution[5] / totalReviews) * 100) : 0,
      4: totalReviews ? Math.round((distribution[4] / totalReviews) * 100) : 0,
      3: totalReviews ? Math.round((distribution[3] / totalReviews) * 100) : 0,
      2: totalReviews ? Math.round((distribution[2] / totalReviews) * 100) : 0,
      1: totalReviews ? Math.round((distribution[1] / totalReviews) * 100) : 0,
    };

    const response = {
      success: true,
      data: {
        totalReviews: totalReviews,
        averageRating: parseFloat(result.averageOverallRating.toFixed(1)),
        averageServiceRating: parseFloat(
          result.averageServiceRating.toFixed(1)
        ),
        averageCompanyRating: parseFloat(
          result.averageCompanyRating.toFixed(1)
        ),
        averageStylistRating: parseFloat(
          result.averageStylistRating.toFixed(1)
        ),
        ratingDistribution: distribution,
        percentageDistribution: percentageDistribution,
        debug: {
          totalReviewsInDB: reviews.length,
          approvedReviews: approvedReviews.length,
          pendingReviews: pendingReviews.length,
          companyName: company.name,
        },
      },
    };

    console.log(
      "✅ [DEBUG] Final response:",
      JSON.stringify(response, null, 2)
    );
    res.status(200).json(response);
  } catch (error) {
    console.error("❌ [DEBUG] Error in getReviewStatistics:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * Post-save middleware to link review to appointment
 */
// Backend/src/middleware/review.middlewares.js - FIXED linkReviewToAppointmentAfterSave
export const linkReviewToAppointmentAfterSave = async function (doc) {
  try {
    console.log("🔄 Linking review to appointment:", doc._id);

    // Use $addToSet to prevent duplicates instead of direct assignment
    await mongoose.model("Appointment").findByIdAndUpdate(doc.appointment, {
      review: doc._id,
      // Also update company and user appointments without duplicates
      $addToSet: {
        // This ensures the appointment is only added once to each array
      },
    });

    // Update company appointments without duplicates
    await Company.findByIdAndUpdate(doc.company, {
      $addToSet: { appointments: doc.appointment },
    });

    // Update stylist appointments without duplicates
    await User.findByIdAndUpdate(doc.stylist, {
      $addToSet: { appointments: doc.appointment },
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
// Backend/src/middleware/review.middlewares.js - ADD THIS UTILITY
/**
 * Utility to verify ratings are in sync
 */
export const verifyRatingSync = async function (
  companyId = null,
  stylistId = null
) {
  try {
    console.log("🔍 Verifying rating synchronization...");

    if (companyId) {
      const companyReviews = await Review.find({
        company: companyId,
        status: "approved",
      });

      const company = await Company.findById(companyId);

      const calculatedOverall =
        companyReviews.length > 0
          ? (companyReviews.reduce((sum, r) => sum + r.companyRating, 0) /
              companyReviews.length +
              companyReviews.reduce((sum, r) => sum + r.serviceRating, 0) /
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
      const stylistReviews = await Review.find({
        stylist: stylistId,
        status: "approved",
      });

      const stylist = await User.findById(stylistId);

      const calculatedRating =
        stylistReviews.length > 0
          ? stylistReviews.reduce((sum, r) => sum + r.stylistRating, 0) /
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
