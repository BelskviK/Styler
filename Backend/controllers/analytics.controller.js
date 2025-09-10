// Backend/controllers/analytics.controller.js
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const Review = require("../models/Review");
const mongoose = require("mongoose");

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userRole = req.user.role;
    const userCompany = req.user.company;

    // EVERY user (including superadmins) can only see their own company's data
    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    let query = { company: new mongoose.Types.ObjectId(userCompany) };

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    // Get current date for today's appointments
    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    // Appointment counts
    const totalAppointments = await Appointment.countDocuments(query);

    const todayAppointments = await Appointment.countDocuments({
      ...query,
      date: todayFormatted,
    });

    const completedAppointments = await Appointment.countDocuments({
      ...query,
      status: "completed",
    });

    // Revenue calculations
    const revenuePipeline = [
      {
        $match: {
          ...query,
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "serviceData",
        },
      },
      { $unwind: "$serviceData" },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$serviceData.price" },
          avgRevenuePerAppointment: { $avg: "$serviceData.price" },
        },
      },
    ];

    const revenueStats = await Appointment.aggregate(revenuePipeline);
    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const avgRevenue = revenueStats[0]?.avgRevenuePerAppointment || 0;

    // Customer counts - only for this company
    const totalCustomers = await User.countDocuments({
      role: "customer",
      company: userCompany,
    });

    // Employee counts (stylists) - only for this company
    const totalStylists = await User.countDocuments({
      role: "styler",
      company: userCompany,
    });

    // Rating calculations
    const ratingStats = await Appointment.aggregate([
      {
        $match: {
          ...query,
          rating: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const avgRating = ratingStats[0]?.avgRating || 0;
    const totalRatings = ratingStats[0]?.totalRatings || 0;

    // Recent appointments
    const recentAppointments = await Appointment.find(query)
      .sort({ date: -1, startTime: -1 })
      .limit(5)
      .populate("customer", "name")
      .populate("service", "name price")
      .populate("stylist", "name");

    res.json({
      overview: {
        totalAppointments,
        todayAppointments,
        completedAppointments,
        totalRevenue,
        avgRevenuePerAppointment: avgRevenue,
        totalCustomers,
        totalStylists,
        avgRating: Math.round(avgRating * 10) / 10,
        totalRatings,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
        company: userCompany,
      },
      recentAppointments,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
// @access  Private
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { timeframe = "monthly", startDate, endDate } = req.query;
    const userCompany = req.user.company;

    // Only allow access to user's own company data
    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    let query = {
      status: "completed",
      company: new mongoose.Types.ObjectId(userCompany),
    };

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    let groupByFormat;
    switch (timeframe) {
      case "daily":
        groupByFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupByFormat = "%Y-%U";
        break;
      case "monthly":
        groupByFormat = "%Y-%m";
        break;
      case "yearly":
        groupByFormat = "%Y";
        break;
      default:
        groupByFormat = "%Y-%m";
    }

    const revenuePipeline = [
      { $match: query },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "serviceData",
        },
      },
      { $unwind: "$serviceData" },
      {
        $group: {
          _id: {
            period: {
              $dateToString: {
                format: groupByFormat,
                date: { $toDate: { $concat: ["$date", "T00:00:00"] } },
              },
            },
          },
          totalRevenue: { $sum: "$serviceData.price" },
          appointmentCount: { $sum: 1 },
          avgRevenue: { $avg: "$serviceData.price" },
        },
      },
      { $sort: { "_id.period": 1 } },
      {
        $project: {
          period: "$_id.period",
          totalRevenue: 1,
          appointmentCount: 1,
          avgRevenue: 1,
          _id: 0,
        },
      },
    ];

    const revenueData = await Appointment.aggregate(revenuePipeline);

    res.json({
      timeframe,
      data: revenueData,
      filters: { startDate, endDate },
      company: userCompany,
    });
  } catch (error) {
    console.error("Error fetching revenue analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get appointment analytics
// @route   GET /api/analytics/appointments
// @access  Private
exports.getAppointmentAnalytics = async (req, res) => {
  try {
    const { timeframe = "monthly", startDate, endDate } = req.query;
    const userCompany = req.user.company;

    // Only allow access to user's own company data
    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    let query = { company: new mongoose.Types.ObjectId(userCompany) };

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    let groupByFormat;
    switch (timeframe) {
      case "daily":
        groupByFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupByFormat = "%Y-%U";
        break;
      case "monthly":
        groupByFormat = "%Y-%m";
        break;
      case "yearly":
        groupByFormat = "%Y";
        break;
      default:
        groupByFormat = "%Y-%m";
    }

    const appointmentPipeline = [
      { $match: query },
      {
        $group: {
          _id: {
            period: {
              $dateToString: {
                format: groupByFormat,
                date: { $toDate: { $concat: ["$date", "T00:00:00"] } },
              },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.period": 1, "_id.status": 1 } },
      {
        $group: {
          _id: "$_id.period",
          statusCounts: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
          total: { $sum: "$count" },
        },
      },
      { $sort: { _id: 1 } },
    ];

    const appointmentData = await Appointment.aggregate(appointmentPipeline);

    res.json({
      timeframe,
      data: appointmentData,
      filters: { startDate, endDate },
      company: userCompany,
    });
  } catch (error) {
    console.error("Error fetching appointment analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get customer analytics
// @route   GET /api/analytics/customers
// @access  Private
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userCompany = req.user.company;

    // Only allow access to user's own company data
    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    let customerQuery = {
      role: "customer",
      company: new mongoose.Types.ObjectId(userCompany),
    };

    let appointmentMatch = {
      company: new mongoose.Types.ObjectId(userCompany),
    };

    // Date range filtering for appointments
    if (startDate && endDate) {
      appointmentMatch.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    const customerStats = await User.aggregate([
      { $match: customerQuery },
      {
        $lookup: {
          from: "appointments",
          let: { customerId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$customer", "$$customerId"] },
                ...appointmentMatch,
              },
            },
            {
              $lookup: {
                from: "services",
                localField: "service",
                foreignField: "_id",
                as: "serviceData",
              },
            },
            { $unwind: "$serviceData" },
          ],
          as: "appointments",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          joinDate: 1,
          totalAppointments: { $size: "$appointments" },
          completedAppointments: {
            $size: {
              $filter: {
                input: "$appointments",
                as: "appt",
                cond: { $eq: ["$$appt.status", "completed"] },
              },
            },
          },
          totalSpent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$appointments",
                    as: "appt",
                    cond: { $eq: ["$$appt.status", "completed"] },
                  },
                },
                as: "appt",
                in: "$$appt.serviceData.price",
              },
            },
          },
          lastAppointment: { $max: "$appointments.date" },
        },
      },
      { $sort: { totalSpent: -1 } },
    ]);

    res.json({
      totalCustomers: customerStats.length,
      customers: customerStats,
      filters: { startDate, endDate },
      company: userCompany,
    });
  } catch (error) {
    console.error("Error fetching customer analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get employee performance analytics
// @route   GET /api/analytics/employees
// @access  Private
exports.getEmployeePerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userCompany = req.user.company;

    // Only allow access to user's own company data
    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    let employeeQuery = {
      role: "styler",
      company: new mongoose.Types.ObjectId(userCompany),
    };

    let appointmentMatch = {
      company: new mongoose.Types.ObjectId(userCompany),
    };

    // Date range filtering for appointments
    if (startDate && endDate) {
      appointmentMatch.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    const employeeStats = await User.aggregate([
      { $match: employeeQuery },
      {
        $lookup: {
          from: "appointments",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$stylist", "$$employeeId"] },
                ...appointmentMatch,
              },
            },
            {
              $lookup: {
                from: "services",
                localField: "service",
                foreignField: "_id",
                as: "serviceData",
              },
            },
            { $unwind: "$serviceData" },
          ],
          as: "appointments",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          totalAppointments: { $size: "$appointments" },
          completedAppointments: {
            $size: {
              $filter: {
                input: "$appointments",
                as: "appt",
                cond: { $eq: ["$$appt.status", "completed"] },
              },
            },
          },
          totalRevenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$appointments",
                    as: "appt",
                    cond: { $eq: ["$$appt.status", "completed"] },
                  },
                },
                as: "appt",
                in: "$$appt.serviceData.price",
              },
            },
          },
          avgRating: {
            $avg: {
              $filter: {
                input: "$appointments.rating",
                as: "rating",
                cond: { $ne: ["$$rating", null] },
              },
            },
          },
          utilizationRate: {
            $cond: {
              if: { $gt: ["$totalAppointments", 0] },
              then: {
                $multiply: [
                  { $divide: ["$completedAppointments", "$totalAppointments"] },
                  100,
                ],
              },
              else: 0,
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    res.json({
      totalEmployees: employeeStats.length,
      employees: employeeStats,
      filters: { startDate, endDate },
      company: userCompany,
    });
  } catch (error) {
    console.error("Error fetching employee analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Backend/controllers/analytics.controller.js
exports.getPopularServices = async (req, res) => {
  try {
    console.log("getPopularServices called by user:", req.user._id);
    console.log("User company:", req.user.company);

    const { timeframe = "monthly", limit = 5, startDate, endDate } = req.query;
    const userCompany = req.user.company;

    if (!userCompany) {
      console.log("No company found for user");
      return res.status(403).json({
        success: false,
        message: "Company access not authorized",
      });
    }

    let query = {
      company: new mongoose.Types.ObjectId(userCompany),
      status: "completed",
    };

    console.log("Base query:", query);

    // Date range filtering - simplify for debugging
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
      console.log("With date range:", query.date);
    } else {
      // Remove date filtering temporarily for debugging
      console.log("No date range provided, skipping date filter");
    }

    // Debug: Check if there are any appointments at all
    const totalAppointments = await Appointment.countDocuments(query);
    console.log("Total appointments matching query:", totalAppointments);

    const popularServicesPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "serviceData",
        },
      },
      { $unwind: "$serviceData" },
      {
        $group: {
          _id: "$service",
          name: { $first: "$serviceData.name" },
          appointmentCount: { $sum: 1 },
          totalRevenue: { $sum: "$serviceData.price" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { appointmentCount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          serviceId: "$_id",
          name: 1,
          appointments: "$appointmentCount",
          revenue: "$totalRevenue",
          avgRating: { $ifNull: ["$avgRating", 0] },
        },
      },
    ];

    const popularServices = await Appointment.aggregate(
      popularServicesPipeline
    );
    console.log("Aggregation result:", popularServices);

    // Always return the expected format, even if empty
    res.json({
      success: true,
      data: popularServices,
      total: popularServices.length,
    });
  } catch (error) {
    console.error("Error fetching popular services:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
// @desc    Get service performance analytics
// @route   GET /api/analytics/services/:serviceId
// @access  Private (Admin/SuperAdmin only)
exports.getServicePerformance = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { timeframe = "monthly", startDate, endDate } = req.query;
    const userCompany = req.user.company;

    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    let query = {
      service: new mongoose.Types.ObjectId(serviceId),
      company: new mongoose.Types.ObjectId(userCompany),
      status: "completed",
    };

    // Date range filtering
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    let groupByFormat;
    switch (timeframe) {
      case "daily":
        groupByFormat = "%Y-%m-%d";
        break;
      case "weekly":
        groupByFormat = "%Y-%U";
        break;
      case "monthly":
        groupByFormat = "%Y-%m";
        break;
      case "yearly":
        groupByFormat = "%Y";
        break;
      default:
        groupByFormat = "%Y-%m";
    }

    const servicePerformancePipeline = [
      { $match: query },
      {
        $lookup: {
          from: "services",
          localField: "service",
          foreignField: "_id",
          as: "serviceData",
        },
      },
      { $unwind: "$serviceData" },
      {
        $group: {
          _id: {
            period: {
              $dateToString: {
                format: groupByFormat,
                date: { $toDate: { $concat: ["$date", "T00:00:00"] } },
              },
            },
          },
          appointmentCount: { $sum: 1 },
          totalRevenue: { $sum: "$serviceData.price" },
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { "_id.period": 1 } },
      {
        $project: {
          period: "$_id.period",
          appointmentCount: 1,
          totalRevenue: 1,
          avgRating: { $ifNull: ["$avgRating", 0] },
          _id: 0,
        },
      },
    ];

    const servicePerformance = await Appointment.aggregate(
      servicePerformancePipeline
    );

    // Get service details
    const service = await Service.findById(serviceId);

    res.json({
      service: {
        _id: service._id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        category: service.category,
      },
      performance: servicePerformance,
      timeframe,
      filters: { startDate, endDate },
    });
  } catch (error) {
    console.error("Error fetching service performance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}; // Get review statistics for dashboard
// Backend/controllers/analytics.controller.js
// Backend/controllers/analytics.controller.js
exports.getReviewStatistics = async (req, res) => {
  try {
    const { companyId } = req.params;

    // If companyId is not provided and user is company-specific, use user's company
    const effectiveCompanyId =
      companyId || (req.user.company ? req.user.company.toString() : null);

    if (!effectiveCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const stats = await Review.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(effectiveCompanyId), // ← FIXED: added 'new'
          status: "approved",
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating",
          },
        },
      },
    ]);

    // Calculate rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    if (stats[0]?.ratingDistribution) {
      stats[0].ratingDistribution.forEach((rating) => {
        distribution[rating] = (distribution[rating] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalReviews: stats[0]?.totalReviews || 0,
        averageRating: stats[0]?.averageRating
          ? parseFloat(stats[0].averageRating.toFixed(1))
          : 0,
        ratingDistribution: distribution,
        percentageDistribution: {
          5: stats[0]?.totalReviews
            ? Math.round((distribution[5] / stats[0].totalReviews) * 100)
            : 0,
          4: stats[0]?.totalReviews
            ? Math.round((distribution[4] / stats[0].totalReviews) * 100)
            : 0,
          3: stats[0]?.totalReviews
            ? Math.round((distribution[3] / stats[0].totalReviews) * 100)
            : 0,
          2: stats[0]?.totalReviews
            ? Math.round((distribution[2] / stats[0].totalReviews) * 100)
            : 0,
          1: stats[0]?.totalReviews
            ? Math.round((distribution[1] / stats[0].totalReviews) * 100)
            : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error in getReviewStatistics:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// Optional: Add comprehensive review analytics with time series
exports.getReviewAnalytics = async (req, res) => {
  try {
    const { companyId, startDate, endDate } = req.query;
    const effectiveCompanyId =
      companyId || (req.user.company ? req.user.company.toString() : null);

    if (!effectiveCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    const matchStage = {
      company: mongoose.Types.ObjectId(effectiveCompanyId),
      status: "approved",
    };

    // Add date filter if provided
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = new Date(startDate);
      if (endDate) matchStage.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          monthlyData: {
            $push: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              rating: "$rating",
            },
          },
        },
      },
      {
        $project: {
          totalReviews: 1,
          averageRating: { $round: ["$averageRating", 1] },
          monthlyBreakdown: {
            $map: {
              input: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
              as: "month",
              in: {
                month: "$$month",
                reviews: {
                  $size: {
                    $filter: {
                      input: "$monthlyData",
                      as: "data",
                      cond: { $eq: ["$$data.month", "$$month"] },
                    },
                  },
                },
                averageRating: {
                  $avg: {
                    $filter: {
                      input: "$monthlyData",
                      as: "data",
                      cond: { $eq: ["$$data.month", "$$month"] },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0] || {
        totalReviews: 0,
        averageRating: 0,
        monthlyBreakdown: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          reviews: 0,
          averageRating: 0,
        })),
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
