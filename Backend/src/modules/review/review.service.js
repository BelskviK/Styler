import mongoose from "mongoose";

import Review from "./review.model.js";
import Appointment from "../appointment/appointment.model.js";
import Company from "../company/company.model.js";
import User from "../user/user.model.js";

class ReviewService {
  // @desc    Create review with validation
  // @param   {Object} reviewData - Review data (appointmentId, rating, comment)
  // @param   {string} customerId - ID of the customer creating the review
  // @returns {Object} Result object with created review or error
  async createReview(reviewData, customerId) {
    try {
      const { appointmentId, rating, comment } = reviewData;

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

      // Check if appointment is completed
      if (appointment.status !== "completed") {
        return {
          success: false,
          status: 400,
          message: "Can only review completed appointments",
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

      // Create review
      const review = await Review.create({
        customer: customerId,
        company: appointment.company._id,
        stylist: appointment.stylist._id,
        appointment: appointmentId,
        rating,
        comment,
      });

      // Populate the newly created review
      const populatedReview = await Review.findById(review._id)
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage")
        .populate("company", "name")
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

  // @desc    Get reviews by company with full details
  // @param   {string} companyId - ID of the company
  // @param   {Object} queryParams - Query parameters (page, limit, status)
  // @returns {Object} Result object with reviews and pagination info
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

  // @desc    Get reviews by customer
  // @param   {string} customerId - ID of the customer
  // @param   {Object} queryParams - Query parameters (page, limit)
  // @returns {Object} Result object with reviews and pagination info
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

  // @desc    Get reviews by stylist
  // @param   {string} stylistId - ID of the stylist
  // @param   {Object} queryParams - Query parameters (page, limit)
  // @returns {Object} Result object with reviews, stats, and pagination info
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

      // Calculate average rating for stylist
      const averageRating = await Review.aggregate([
        {
          $match: {
            stylist: mongoose.Types.ObjectId(stylistId),
            status: "approved",
          },
        },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
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

  // @desc    Get single review by ID
  // @param   {string} reviewId - ID of the review
  // @returns {Object} Result object with review details or error
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

  // @desc    Get reviews for a specific appointment
  // @param   {string} appointmentId - ID of the appointment
  // @returns {Object} Result object with reviews and appointment details
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

  // @desc    Get recent reviews with all details
  // @param   {Object} queryParams - Query parameters (limit)
  // @returns {Object} Result object with recent reviews
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

export default new ReviewService();
