// Backend\controllers\review.controller.js
import Review from "../models/Review.js";
import Appointment from "../models/Appointment.js";
import Company from "../models/Company.js";
import User from "../models/User.js";
class reviewController {
  // Create review with validation
  async createReview(req, res) {
    try {
      const { appointmentId, rating, comment } = req.body;
      const customerId = req.user._id;
      // Check if appointment exists and is valid for review
      const appointment = await Appointment.findById(appointmentId)
        .populate("customer")
        .populate("company")
        .populate("stylist");

      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Check if user is the customer who made the appointment
      if (appointment.customer._id.toString() !== customerId.toString()) {
        console.log(
          `appointment.customer._id. ${appointment.customer._id.toString()} customerId ${customerId.toString()}`
        );
        return res
          .status(403)
          .json({ message: "Not authorized to review this appointment" });
      }

      // Check if appointment is completed
      if (appointment.status !== "completed") {
        return res.status(400).json({
          message: "Can only review completed appointments",
        });
      }

      // Check if review already exists
      const existingReview = await Review.findOne({
        appointment: appointmentId,
      });
      if (existingReview) {
        return res
          .status(400)
          .json({ message: "Review already exists for this appointment" });
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

      res.status(201).json({
        success: true,
        data: populatedReview,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get reviews by company with full details
  async getReviewsByCompany(req, res) {
    try {
      const { companyId } = req.params;
      const { page = 1, limit = 10, status = "approved" } = req.query;

      // Check if company exists
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
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

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get reviews by customer
  async getReviewsByCustomer(req, res) {
    try {
      const customerId = req.user.id;
      const { page = 1, limit = 10 } = req.query;

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

      res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get reviews by stylist
  async getReviewsByStylist(req, res) {
    try {
      const { stylistId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Check if stylist exists
      const stylist = await User.findById(stylistId);
      if (!stylist || stylist.role !== "styler") {
        return res.status(404).json({ message: "Stylist not found" });
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

      res.status(200).json({
        success: true,
        data: reviews,
        stylistStats: {
          averageRating: averageRating[0]?.avgRating || 0,
          totalReviews: total,
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get single review with all details
  async getReview(req, res) {
    try {
      const { reviewId } = req.params;

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
        return res.status(404).json({ message: "Review not found" });
      }

      res.status(200).json({
        success: true,
        data: review,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get reviews for a specific appointment
  async getReviewsByAppointment(req, res) {
    try {
      const { appointmentId } = req.params;

      // Check if appointment exists
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const reviews = await Review.find({ appointment: appointmentId })
        .populate("customer", "name profileImage")
        .populate("stylist", "name profileImage")
        .populate("company", "name image");

      res.status(200).json({
        success: true,
        data: reviews,
        appointmentDetails: {
          id: appointment._id,
          date: appointment.date,
          status: appointment.status,
          service: appointment.service,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get recent reviews with all details
  async getRecentReviews(req, res) {
    try {
      const { limit = 5 } = req.query;

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

      res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new reviewController();
