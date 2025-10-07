// Backend/controllers/analytics.controller.js
import mongoose from "mongoose";

import Appointment from "../appointment/appointment.model.js";
import User from "../user/user.model.js";
import Service from "../service/service.model.js";
import Review from "../review/review.model.js";

export async function getRevenueAnalytics(req, res) {
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
}

export async function getAppointmentAnalytics(req, res) {
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
}

export async function getCustomerAnalytics(req, res) {
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
}

export async function getPopularServices(req, res) {
  try {
    const { timeframe = "monthly", limit = 5, startDate, endDate } = req.query;
    const userCompany = req.user.company;

    if (!userCompany) {
      return res.status(403).json({
        success: false,
        message: "Company access not authorized",
      });
    }

    let query = {
      company: new mongoose.Types.ObjectId(userCompany),
      status: "completed",
    };

    // Date range filtering - simplify for debugging
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    } else {
      // Remove date filtering temporarily for debugging
    }

    // Debug: Check if there are any appointments at all
    const totalAppointments = await Appointment.countDocuments(query);

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
}

export async function getServicePerformance(req, res) {
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
}

export async function getReviewStatistics(req, res) {
  try {
    const userCompany = req.user.company;
    const effectiveCompanyId = userCompany ? userCompany.toString() : null;

    if (!effectiveCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    // Get all reviews for this company
    const reviews = await Review.find({
      company: effectiveCompanyId,
      // Include all reviews regardless of status
    }).select("ratings status createdAt");

    if (reviews.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalReviews: 0,
          averageRating: 0,
          averageServiceRating: 0,
          averageCompanyRating: 0,
          averageStylistRating: 0,
          ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          percentageDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        },
      });
    }

    // UPDATED: Use nested ratings structure in aggregation
    const stats = await Review.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(effectiveCompanyId),
          // Include all reviews
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageServiceRating: { $avg: "$ratings.service" },
          averageCompanyRating: { $avg: "$ratings.company" },
          averageStylistRating: { $avg: "$ratings.stylist" },
          averageOverallRating: {
            $avg: {
              $avg: [
                "$ratings.service",
                "$ratings.company",
                "$ratings.stylist",
              ],
            },
          },
          serviceRatings: { $push: "$ratings.service" },
          companyRatings: { $push: "$ratings.company" },
          stylistRatings: { $push: "$ratings.stylist" },
        },
      },
    ]);

    const result = stats[0] || {
      totalReviews: 0,
      averageServiceRating: 0,
      averageCompanyRating: 0,
      averageStylistRating: 0,
      averageOverallRating: 0,
      serviceRatings: [],
      companyRatings: [],
      stylistRatings: [],
    };

    // Calculate distribution from service ratings (or any rating type)
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const serviceRatings = result.serviceRatings || [];

    serviceRatings.forEach((rating) => {
      if (distribution.hasOwnProperty(rating)) {
        distribution[rating]++;
      }
    });

    const totalReviews = result.totalReviews || 0;
    const percentageDistribution = {
      5: totalReviews ? Math.round((distribution[5] / totalReviews) * 100) : 0,
      4: totalReviews ? Math.round((distribution[4] / totalReviews) * 100) : 0,
      3: totalReviews ? Math.round((distribution[3] / totalReviews) * 100) : 0,
      2: totalReviews ? Math.round((distribution[2] / totalReviews) * 100) : 0,
      1: totalReviews ? Math.round((distribution[1] / totalReviews) * 100) : 0,
    };

    const response = {
      success: true,
      data: {
        totalReviews: totalReviews,
        averageRating: parseFloat(result.averageOverallRating.toFixed(1)),
        averageServiceRating: parseFloat(
          result.averageServiceRating.toFixed(1)
        ),
        averageCompanyRating: parseFloat(
          result.averageCompanyRating.toFixed(1)
        ),
        averageStylistRating: parseFloat(
          result.averageStylistRating.toFixed(1)
        ),
        ratingDistribution: distribution,
        percentageDistribution: percentageDistribution,
        // Add breakdown by rating type
        ratingBreakdown: {
          service: {
            average: parseFloat(result.averageServiceRating.toFixed(1)),
            distribution: calculateRatingDistribution(result.serviceRatings),
          },
          company: {
            average: parseFloat(result.averageCompanyRating.toFixed(1)),
            distribution: calculateRatingDistribution(result.companyRatings),
          },
          stylist: {
            average: parseFloat(result.averageStylistRating.toFixed(1)),
            distribution: calculateRatingDistribution(result.stylistRatings),
          },
        },
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Error in getReviewStatistics:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

function calculateRatingDistribution(ratings = []) {
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((rating) => {
    if (distribution.hasOwnProperty(rating)) {
      distribution[rating]++;
    }
  });
  return distribution;
}

export async function getReviewAnalytics(req, res) {
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

    // UPDATED: Use nested ratings structure
    const analytics = await Review.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageServiceRating: { $avg: "$ratings.service" },
          averageCompanyRating: { $avg: "$ratings.company" },
          averageStylistRating: { $avg: "$ratings.stylist" },
          averageOverallRating: {
            $avg: {
              $avg: [
                "$ratings.service",
                "$ratings.company",
                "$ratings.stylist",
              ],
            },
          },
          monthlyData: {
            $push: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              serviceRating: "$ratings.service",
              companyRating: "$ratings.company",
              stylistRating: "$ratings.stylist",
            },
          },
        },
      },
      {
        $project: {
          totalReviews: 1,
          averageServiceRating: { $round: ["$averageServiceRating", 1] },
          averageCompanyRating: { $round: ["$averageCompanyRating", 1] },
          averageStylistRating: { $round: ["$averageStylistRating", 1] },
          averageOverallRating: { $round: ["$averageOverallRating", 1] },
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
                averageServiceRating: {
                  $avg: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$monthlyData",
                          as: "data",
                          cond: { $eq: ["$$data.month", "$$month"] },
                        },
                      },
                      as: "data",
                      in: "$$data.serviceRating",
                    },
                  },
                },
                averageCompanyRating: {
                  $avg: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$monthlyData",
                          as: "data",
                          cond: { $eq: ["$$data.month", "$$month"] },
                        },
                      },
                      as: "data",
                      in: "$$data.companyRating",
                    },
                  },
                },
                averageStylistRating: {
                  $avg: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$monthlyData",
                          as: "data",
                          cond: { $eq: ["$$data.month", "$$month"] },
                        },
                      },
                      as: "data",
                      in: "$$data.stylistRating",
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
        averageServiceRating: 0,
        averageCompanyRating: 0,
        averageStylistRating: 0,
        averageOverallRating: 0,
        monthlyBreakdown: Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          reviews: 0,
          averageServiceRating: 0,
          averageCompanyRating: 0,
          averageStylistRating: 0,
        })),
      },
    });
  } catch (error) {
    console.error("Error in getReviewAnalytics:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function getDashboardStats(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const userRole = req.user.role;
    const userCompany = req.user.company;

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

    // UPDATED: Review statistics using nested ratings
    const reviewStats = await Review.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(userCompany),
        },
      },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageServiceRating: { $avg: "$ratings.service" },
          averageCompanyRating: { $avg: "$ratings.company" },
          averageStylistRating: { $avg: "$ratings.stylist" },
          averageOverallRating: {
            $avg: {
              $avg: [
                "$ratings.service",
                "$ratings.company",
                "$ratings.stylist",
              ],
            },
          },
        },
      },
    ]);

    const reviewData = reviewStats[0] || {
      totalReviews: 0,
      averageServiceRating: 0,
      averageCompanyRating: 0,
      averageStylistRating: 0,
      averageOverallRating: 0,
    };

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

    // Customer counts
    const totalCustomers = await User.countDocuments({
      role: "customer",
      company: userCompany,
    });

    // Employee counts
    const totalStylists = await User.countDocuments({
      role: "styler",
      company: userCompany,
    });

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
        // UPDATED: Use nested ratings data
        totalReviews: reviewData.totalReviews,
        averageRating: parseFloat(reviewData.averageOverallRating.toFixed(1)),
        averageServiceRating: parseFloat(
          reviewData.averageServiceRating.toFixed(1)
        ),
        averageCompanyRating: parseFloat(
          reviewData.averageCompanyRating.toFixed(1)
        ),
        averageStylistRating: parseFloat(
          reviewData.averageStylistRating.toFixed(1)
        ),
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
}

export async function getEmployeePerformance(req, res) {
  try {
    const { startDate, endDate } = req.query;
    const userCompany = req.user.company;

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
        $lookup: {
          from: "reviews",
          let: { employeeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$stylist", "$$employeeId"] },
              },
            },
          ],
          as: "reviews",
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
          // UPDATED: Use nested ratings from reviews
          avgStylistRating: {
            $avg: {
              $map: {
                input: "$reviews",
                as: "review",
                in: "$$review.ratings.stylist",
              },
            },
          },
          totalReviews: { $size: "$reviews" },
          utilizationRate: {
            $cond: {
              if: { $gt: ["$totalAppointments", 0] },
              then: {
                $multiply: [
                  {
                    $divide: ["$completedAppointments", "$totalAppointments"],
                  },
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
}
