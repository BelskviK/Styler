// Backend/controllers/analytics.controller.js
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Service = require("../models/Service");
const Company = require("../models/Company");
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
