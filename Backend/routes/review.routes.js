// Backend\routes\review.routes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/review.controller");
const auth = require("../middleware/auth");

// Public routes
router.get("/company/:companyId", reviewController.getReviewsByCompany);
router.get("/stylist/:stylistId", reviewController.getReviewsByStylist);
router.get(
  "/appointment/:appointmentId",
  reviewController.getReviewsByAppointment
);
router.get("/recent", reviewController.getRecentReviews);
router.get("/:reviewId", reviewController.getReview);

//  d routes
router.post("/", auth, reviewController.createReview);
router.get(
  "/customer/my-reviews",

  reviewController.getReviewsByCustomer
);

module.exports = router;
