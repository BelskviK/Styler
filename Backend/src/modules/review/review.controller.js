import reviewService from "./review.service.js";

// @desc    Create review with validation - UPDATED
// @route   POST /api/reviews
// @access  Private (customer)
export async function createReview(req, res) {
  try {
    const result = await reviewService.createReview(req.body, req.user._id);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(201).json({
      success: true,
      data: result.review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Check if appointment can be reviewed - NEW
// @route   GET /api/reviews/can-review/:appointmentId
// @access  Private (customer)
export async function canReviewAppointment(req, res) {
  try {
    const result = await reviewService.canReviewAppointment(
      req.params.appointmentId,
      req.user._id
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Get review by appointment ID - UPDATED
// @route   GET /api/reviews/appointment/:appointmentId
// @access  Private (customer)
export async function getReviewByAppointment(req, res) {
  try {
    const result = await reviewService.getReviewByAppointment(
      req.params.appointmentId,
      req.user._id
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      data: result.review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
// @desc    Get reviews by company with full details
// @route   GET /api/reviews/company/:companyId
// @access  Public
export async function getReviewsByCompany(req, res) {
  try {
    const result = await reviewService.getReviewsByCompany(
      req.params.companyId,
      req.query
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Get reviews by customer
// @route   GET /api/reviews/customer
// @access  Private (customer)
export async function getReviewsByCustomer(req, res) {
  try {
    const result = await reviewService.getReviewsByCustomer(
      req.user.id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Get reviews by stylist
// @route   GET /api/reviews/stylist/:stylistId
// @access  Public
export async function getReviewsByStylist(req, res) {
  try {
    const result = await reviewService.getReviewsByStylist(
      req.params.stylistId,
      req.query
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      data: result.reviews,
      stylistStats: result.stylistStats,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Get single review with all details
// @route   GET /api/reviews/:reviewId
// @access  Public
export async function getReview(req, res) {
  try {
    const result = await reviewService.getReviewById(req.params.reviewId);

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      data: result.review,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Get reviews for a specific appointment
// @route   GET /api/reviews/appointment/:appointmentId
// @access  Private
export async function getReviewsByAppointment(req, res) {
  try {
    const result = await reviewService.getReviewsByAppointment(
      req.params.appointmentId
    );

    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }

    res.status(200).json({
      success: true,
      data: result.reviews,
      appointmentDetails: result.appointmentDetails,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// @desc    Get recent reviews with all details
// @route   GET /api/reviews/recent
// @access  Public
export async function getRecentReviews(req, res) {
  try {
    const result = await reviewService.getRecentReviews(req.query);

    res.status(200).json({
      success: true,
      data: result.reviews,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
