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
  getReviewsByAppointment,
  getRecentReviews,
} from "./review.controller.js";

/**
 * Review Routes
 */

// ---- PUBLIC ROUTES ----

// ✅ Get all reviews for a company
ReviewRouter.get("/company/:companyId", getReviewsByCompany);

// ✅ Get all reviews for a stylist
ReviewRouter.get("/stylist/:stylistId", getReviewsByStylist);

// ✅ Get review by appointment
ReviewRouter.get("/appointment/:appointmentId", getReviewsByAppointment);

// ✅ Get most recent reviews
ReviewRouter.get("/recent", getRecentReviews);

// ✅ Get a specific review by ID
ReviewRouter.get("/:reviewId", getReview);

// ---- PROTECTED ROUTES ----

// ✅ Create a new review (authenticated users only)
ReviewRouter.post("/", auth, createReview);

// ✅ Get my reviews (authenticated customer only)
ReviewRouter.get("/customer/my-reviews", auth, getReviewsByCustomer);

export default ReviewRouter;
