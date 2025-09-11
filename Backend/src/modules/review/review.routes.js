// Backend\routes\review.routes.js

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

// Public routes
ReviewRouter.get("/company/:companyId", getReviewsByCompany);
ReviewRouter.get("/stylist/:stylistId", getReviewsByStylist);
ReviewRouter.get("/appointment/:appointmentId", getReviewsByAppointment);
ReviewRouter.get("/recent", getRecentReviews);
ReviewRouter.get("/:reviewId", getReview);

//  d routes
ReviewRouter.post("/", auth, createReview);
ReviewRouter.get(
  "/customer/my-reviews",

  getReviewsByCustomer
);

export default ReviewRouter;
