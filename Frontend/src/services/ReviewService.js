// src/services/ReviewService.js
import api from "@/services/api";

class ReviewService {
  //TODO NOT IN USE WITH FRONTEND
  // Create a new review
  static async createReview(reviewData) {
    return api.post("/reviews", reviewData);
  }

  // Get reviews by company
  static async getReviewsByCompany(companyId, params = {}) {
    return api.get(`/reviews/company/${companyId}`, { params });
  }

  // Get reviews by stylist
  static async getReviewsByStylist(stylistId, params = {}) {
    return api.get(`/reviews/stylist/${stylistId}`, { params });
  }

  // Get reviews by appointment
  static async getReviewsByAppointment(appointmentId) {
    return api.get(`/reviews/appointment/${appointmentId}`);
  }

  // Get recent reviews
  static async getRecentReviews(limit = 5) {
    return api.get("/reviews/recent", { params: { limit } });
  }

  // Get single review
  static async getReview(reviewId) {
    return api.get(`/reviews/${reviewId}`);
  }

  // Get customer's own reviews
  static async getMyReviews(params = {}) {
    return api.get("/reviews/customer/my-reviews", { params });
  }

  // Get review statistics (uses analytics endpoint)
  static async getReviewStats(companyId = null) {
    const params = companyId ? { companyId } : {};
    return api.get("/analytics/reviews", { params });
  }

  // Get detailed review analytics
  static async getReviewAnalytics(timeframe = "monthly", companyId = null) {
    const params = { timeframe };
    if (companyId) params.companyId = companyId;
    return api.get("/analytics/reviews/analytics", { params });
  }
  static async submitReview(reviewData) {
    return api.post("/reviews", reviewData);
  }

  static async getReviewByAppointment(appointmentId) {
    return api.get(`/reviews/appointment/${appointmentId}`);
  }

  static async canReviewAppointment(appointmentId) {
    return api.get(`/reviews/can-review/${appointmentId}`);
  }
}

export default ReviewService;
