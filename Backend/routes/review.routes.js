// Backend\routes\review.routes.js

import express from "express";
const ReviewRouter = express.Router();
import auth from "../middleware/auth.js";

import reviewController from "../controllers/review.controller.js";

// Public routes
ReviewRouter.get("/company/:companyId", reviewController.getReviewsByCompany);
ReviewRouter.get("/stylist/:stylistId", reviewController.getReviewsByStylist);
ReviewRouter.get(
  "/appointment/:appointmentId",
  reviewController.getReviewsByAppointment
);
ReviewRouter.get("/recent", reviewController.getRecentReviews);
ReviewRouter.get("/:reviewId", reviewController.getReview);

//  d routes
ReviewRouter.post("/", auth, reviewController.createReview);
ReviewRouter.get(
  "/customer/my-reviews",

  reviewController.getReviewsByCustomer
);

export default ReviewRouter;
