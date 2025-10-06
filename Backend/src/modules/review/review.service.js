// Backend/src/modules/review/review.service.js
import mongoose from "mongoose";
import Review from "./review.model.js";
import Appointment from "../appointment/appointment.model.js";
import Company from "../company/company.model.js";
import User from "../user/user.model.js";
class ReviewService {
  // @desc    Create review with validation - UPDATED for dual ratings
  // @param   {Object} reviewData - Review data (appointmentId, overallRating, stylistRating, comment)
  // @param   {string} customerId - ID of the customer creating the review
  // @returns {Object} Result object with created review or error
  async createReview(reviewData, customerId) {
    try {
      const { appointmentId, overallRating, stylistRating, comment } =
        reviewData;

      // Validate required fields
      if (!appointmentId || !overallRating || !stylistRating) {
        return {
          success: false,
          status: 400,
          message:
            "Missing required fields: appointmentId, overallRating, and stylistRating are required",
        };
      }

      // Check if appointment exists and is valid for review
      const appointment = await Appointment.findById(appointmentId)
        .populate("customer")
        .populate("company")
        .populate("stylist");

      if (!appointment) {
        return {
          success: false,
          status: 404,
          message: "Appointment not found",
        };
      }

      // Check if user is the customer who made the appointment
      if (appointment.customer._id.toString() !== customerId.toString()) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to review this appointment",
        };
      }

      // CHANGE: Allow both completed AND cancelled appointments
      if (!["completed", "cancelled"].includes(appointment.status)) {
        return {
          success: false,
          status: 400,
          message: "Can only review completed or cancelled appointments",
        };
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        appointment: appointmentId,
      });
      if (existingReview) {
        return {
          success: false,
          status: 400,
          message: "Review already exists for this appointment",
        };
      }

      // Create review with dual ratings
      const review = await Review.create({
        customer: customerId,
        company: appointment.company._id,
        stylist: appointment.stylist._id,
        appointment: appointmentId,
        overallRating,
        stylistRating,
        comment: comment || "",
      });

      // Populate the newly created review
      const populatedReview = await Review.findById(review._id)
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage")
        .populate("company", "name type") // ADDED: Include company type
        .populate({
          path: "appointment",
          select: "date service status",
          populate: {
            path: "service",
            select: "name price",
          },
        });

      return {
        success: true,
        review: populatedReview,
      };
    } catch (error) {
      console.error("createReview service error:", error);
      throw error;
    }
  }

  // @desc    Check if appointment can be reviewed - NEW METHOD
  // @param   {string} appointmentId - ID of the appointment
  // @param   {string} customerId - ID of the customer
  // @returns {Object} Result object with canReview flag and reason
  async canReviewAppointment(appointmentId, customerId) {
    try {
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        return {
          success: false,
          canReview: false,
          reason: "Appointment not found",
        };
      }

      // Check if user is the customer
      if (appointment.customer.toString() !== customerId.toString()) {
        return {
          success: false,
          canReview: false,
          reason: "Not your appointment",
        };
      }

      // Check if appointment status allows reviewing
      if (!["completed", "cancelled"].includes(appointment.status)) {
        return {
          success: false,
          canReview: false,
          reason: "Can only review completed or cancelled appointments",
        };
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        appointment: appointmentId,
      });
      if (existingReview) {
        return {
          success: false,
          canReview: false,
          reason: "Review already submitted",
        };
      }

      return {
        success: true,
        canReview: true,
      };
    } catch (error) {
      console.error("canReviewAppointment service error:", error);
      throw error;
    }
  }

  // @desc    Get review by appointment ID - NEW METHOD
  // @param   {string} appointmentId - ID of the appointment
  // @param   {string} customerId - ID of the customer (for authorization)
  // @returns {Object} Result object with review or error
  async getReviewByAppointment(appointmentId, customerId) {
    try {
      const review = await Review.findOne({ appointment: appointmentId })
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage")
        .populate("company", "name type") // ADDED: Include company type
        .populate({
          path: "appointment",
          select: "date service status",
          populate: {
            path: "service",
            select: "name price",
          },
        });

      if (!review) {
        return {
          success: false,
          status: 404,
          message: "Review not found for this appointment",
        };
      }

      // Check authorization
      if (review.customer._id.toString() !== customerId.toString()) {
        return {
          success: false,
          status: 403,
          message: "Not authorized to access this review",
        };
      }

      return {
        success: true,
        review,
      };
    } catch (error) {
      console.error("getReviewByAppointment service error:", error);
      throw error;
    }
  }

  // UPDATE existing methods to handle dual ratings in aggregations:

  // In getReviewsByStylist method, update the aggregation:
  async getReviewsByStylist(stylistId, queryParams) {
    try {
      const { page = 1, limit = 10 } = queryParams;

      // Check if stylist exists
      const stylist = await User.findById(stylistId);
      if (!stylist || stylist.role !== "styler") {
        return {
          success: false,
          status: 404,
          message: "Stylist not found",
        };
      }

      const reviews = await Review.find({
        stylist: stylistId,
        status: "approved",
      })
        .populate("customer", "name profileImage")
        .populate("company", "name image")
        .populate({
          path: "appointment",
          select: "date service",
          populate: {
            path: "service",
            select: "name",
          },
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments({
        stylist: stylistId,
        status: "approved",
      });

      // CHANGE: Calculate average rating using stylistRating
      const averageRating = await Review.aggregate([
        {
          $match: {
            stylist: mongoose.Types.ObjectId(stylistId),
            status: "approved",
          },
        },
        { $group: { _id: null, avgRating: { $avg: "$stylistRating" } } },
      ]);

      return {
        success: true,
        reviews,
        stylistStats: {
          averageRating: averageRating[0]?.avgRating || 0,
          totalReviews: total,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
      };
    } catch (error) {
      console.error("getReviewsByStylist service error:", error);
      throw error;
    }
  }

  // Keep all other existing methods as they are...

  // Add all the other methods that are missing but referenced in your controller
  async getReviewsByCompany(companyId, queryParams) {
    try {
      const { page = 1, limit = 10, status = "approved" } = queryParams;

      // Check if company exists
      const company = await Company.findById(companyId);
      if (!company) {
        return {
          success: false,
          status: 404,
          message: "Company not found",
        };
      }

      const reviews = await Review.find({
        company: companyId,
        status: status,
      })
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage expertise")
        .populate({
          path: "appointment",
          select: "date service startTime endTime",
          populate: {
            path: "service",
            select: "name price duration",
          },
        })
        .populate("company", "name image")
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments({
        company: companyId,
        status: status,
      });

      return {
        success: true,
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("getReviewsByCompany service error:", error);
      throw error;
    }
  }

  async getReviewsByCustomer(customerId, queryParams) {
    try {
      const { page = 1, limit = 10 } = queryParams;

      const reviews = await Review.find({ customer: customerId })
        .populate("company", "name image location")
        .populate("stylist", "name profileImage expertise")
        .populate({
          path: "appointment",
          select: "date service status",
          populate: {
            path: "service",
            select: "name price",
          },
        })
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Review.countDocuments({ customer: customerId });

      return {
        success: true,
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
      };
    } catch (error) {
      console.error("getReviewsByCustomer service error:", error);
      throw error;
    }
  }

  async getReviewById(reviewId) {
    try {
      const review = await Review.findById(reviewId)
        .populate("customer", "name profileImage email phone")
        .populate("stylist", "name profileImage expertise rating")
        .populate("company", "name image location")
        .populate({
          path: "appointment",
          select: "date service startTime endTime status notes",
          populate: {
            path: "service",
            select: "name price description",
          },
        });

      if (!review) {
        return {
          success: false,
          status: 404,
          message: "Review not found",
        };
      }

      return {
        success: true,
        review,
      };
    } catch (error) {
      console.error("getReviewById service error:", error);
      throw error;
    }
  }

  async getReviewsByAppointment(appointmentId) {
    try {
      // Check if appointment exists
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return {
          success: false,
          status: 404,
          message: "Appointment not found",
        };
      }

      const reviews = await Review.find({ appointment: appointmentId })
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage")
        .populate("company", "name image");

      return {
        success: true,
        reviews,
        appointmentDetails: {
          id: appointment._id,
          date: appointment.date,
          status: appointment.status,
          service: appointment.service,
        },
      };
    } catch (error) {
      console.error("getReviewsByAppointment service error:", error);
      throw error;
    }
  }

  async getRecentReviews(queryParams) {
    try {
      const { limit = 5 } = queryParams;

      const reviews = await Review.find({ status: "approved" })
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage expertise")
        .populate("company", "name image location")
        .populate({
          path: "appointment",
          select: "date service",
          populate: {
            path: "service",
            select: "name",
          },
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      return {
        success: true,
        reviews,
      };
    } catch (error) {
      console.error("getRecentReviews service error:", error);
      throw error;
    }
  }
}

const reviewService = new ReviewService();
export default reviewService;
