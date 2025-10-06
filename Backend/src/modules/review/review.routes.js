// Backend/routes/review.routes.js
import express from "express";
const ReviewRouter = express.Router();

import auth from "../../middleware/auth.js";
import {
  createReview,
  getReviewsByCompany,
  getReviewsByCustomer,
  getReviewsByStylist,
  getReview,
  getReviewByAppointment, // CHANGED: from getReviewsByAppointment
  getRecentReviews,
  canReviewAppointment, // NEW
} from "./review.controller.js";

/**
 * Review Routes
 */

// ---- PUBLIC ROUTES ----

// ✅ Get all reviews for a company
ReviewRouter.get("/company/:companyId", getReviewsByCompany);

// ✅ Get all reviews for a stylist
ReviewRouter.get("/stylist/:stylistId", getReviewsByStylist);

// ✅ Get most recent reviews
ReviewRouter.get("/recent", getRecentReviews);

// ✅ Get a specific review by ID
ReviewRouter.get("/:reviewId", getReview);

// ---- PROTECTED ROUTES ----

// ✅ Create a new review (authenticated users only)
ReviewRouter.post("/", auth, createReview);

// ✅ Get my reviews (authenticated customer only)
ReviewRouter.get("/customer/my-reviews", auth, getReviewsByCustomer);

// ✅ Get review by appointment ID (authenticated customer only) - CHANGED
ReviewRouter.get("/appointment/:appointmentId", auth, getReviewByAppointment);

// ✅ Check if appointment can be reviewed (authenticated customer only) - NEW
ReviewRouter.get("/can-review/:appointmentId", auth, canReviewAppointment);

export default ReviewRouter;
