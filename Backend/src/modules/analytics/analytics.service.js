// Backend/services/analytics.service.js
import mongoose from "mongoose";
import Appointment from "../appointment/appointment.model.js";
import User from "../user/user.model.js";
import Service from "../service/service.model.js";
import Review from "../review/review.model.js";

class AnalyticsService {
  static async getRevenueAnalytics(params) {
    const { timeframe = "monthly", startDate, endDate, companyId } = params;

    let query = {
      status: "completed",
      company: new mongoose.Types.ObjectId(companyId),
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    let groupByFormat = this.getGroupByFormat(timeframe);

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

    return await Appointment.aggregate(revenuePipeline);
  }

  static async getAppointmentAnalytics(params) {
    const { timeframe = "monthly", startDate, endDate, companyId } = params;

    let query = { company: new mongoose.Types.ObjectId(companyId) };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    let groupByFormat = this.getGroupByFormat(timeframe);

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

    return await Appointment.aggregate(appointmentPipeline);
  }

  static async getCustomerAnalytics(params) {
    const { startDate, endDate, companyId } = params;

    let customerQuery = {
      role: "customer",
      company: new mongoose.Types.ObjectId(companyId),
    };

    let appointmentMatch = {
      company: new mongoose.Types.ObjectId(companyId),
    };

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

    return {
      totalCustomers: customerStats.length,
      customers: customerStats,
    };
  }

  static async getPopularServices(params) {
    const {
      timeframe = "monthly",
      limit = 5,
      startDate,
      endDate,
      companyId,
    } = params;

    let query = {
      company: new mongoose.Types.ObjectId(companyId),
      status: "completed",
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

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

    return {
      success: true,
      data: popularServices,
      total: popularServices.length,
    };
  }

  static async getServicePerformance(params) {
    const {
      serviceId,
      timeframe = "monthly",
      startDate,
      endDate,
      companyId,
    } = params;

    let query = {
      service: new mongoose.Types.ObjectId(serviceId),
      company: new mongoose.Types.ObjectId(companyId),
      status: "completed",
    };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    let groupByFormat = this.getGroupByFormat(timeframe);

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
    const service = await Service.findById(serviceId);

    return {
      service: {
        _id: service._id,
        name: service.name,
        price: service.price,
        duration: service.duration,
        category: service.category,
      },
      performance: servicePerformance,
    };
  }

  static async getReviewStatistics(params) {
    const { companyId } = params;

    const reviews = await Review.find({
      company: companyId,
    }).select("ratings status createdAt");

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        averageServiceRating: 0,
        averageCompanyRating: 0,
        averageStylistRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        percentageDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const stats = await Review.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
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

    return {
      totalReviews: totalReviews,
      averageRating: parseFloat(result.averageOverallRating.toFixed(1)),
      averageServiceRating: parseFloat(result.averageServiceRating.toFixed(1)),
      averageCompanyRating: parseFloat(result.averageCompanyRating.toFixed(1)),
      averageStylistRating: parseFloat(result.averageStylistRating.toFixed(1)),
      ratingDistribution: distribution,
      percentageDistribution: percentageDistribution,
      ratingBreakdown: {
        service: {
          average: parseFloat(result.averageServiceRating.toFixed(1)),
          distribution: this.calculateRatingDistribution(result.serviceRatings),
        },
        company: {
          average: parseFloat(result.averageCompanyRating.toFixed(1)),
          distribution: this.calculateRatingDistribution(result.companyRatings),
        },
        stylist: {
          average: parseFloat(result.averageStylistRating.toFixed(1)),
          distribution: this.calculateRatingDistribution(result.stylistRatings),
        },
      },
    };
  }

  static async getReviewAnalytics(params) {
    const { companyId, startDate, endDate } = params;

    const matchStage = {
      company: mongoose.Types.ObjectId(companyId),
      status: "approved",
    };

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

    return (
      analytics[0] || {
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
      }
    );
  }

  static async getDashboardStats(params) {
    const { startDate, endDate, companyId } = params;

    let query = { company: new mongoose.Types.ObjectId(companyId) };

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate).toISOString().split("T")[0],
        $lte: new Date(endDate).toISOString().split("T")[0],
      };
    }

    const today = new Date();
    const todayFormatted = today.toISOString().split("T")[0];

    const totalAppointments = await Appointment.countDocuments(query);
    const todayAppointments = await Appointment.countDocuments({
      ...query,
      date: todayFormatted,
    });
    const completedAppointments = await Appointment.countDocuments({
      ...query,
      status: "completed",
    });

    const reviewStats = await Review.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
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

    const totalCustomers = await User.countDocuments({
      role: "customer",
      company: companyId,
    });

    const totalStylists = await User.countDocuments({
      role: "styler",
      company: companyId,
    });

    const recentAppointments = await Appointment.find(query)
      .sort({ date: -1, startTime: -1 })
      .limit(5)
      .populate("customer", "name")
      .populate("service", "name price")
      .populate("stylist", "name");

    return {
      overview: {
        totalAppointments,
        todayAppointments,
        completedAppointments,
        totalRevenue,
        avgRevenuePerAppointment: avgRevenue,
        totalCustomers,
        totalStylists,
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
      },
      recentAppointments,
    };
  }

  static async getEmployeePerformance(params) {
    const { startDate, endDate, companyId } = params;

    let employeeQuery = {
      role: "styler",
      company: new mongoose.Types.ObjectId(companyId),
    };

    let appointmentMatch = {
      company: new mongoose.Types.ObjectId(companyId),
    };

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

    return {
      totalEmployees: employeeStats.length,
      employees: employeeStats,
    };
  }

  static getGroupByFormat(timeframe) {
    switch (timeframe) {
      case "daily":
        return "%Y-%m-%d";
      case "weekly":
        return "%Y-%U";
      case "monthly":
        return "%Y-%m";
      case "yearly":
        return "%Y";
      default:
        return "%Y-%m";
    }
  }

  static calculateRatingDistribution(ratings = []) {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach((rating) => {
      if (distribution.hasOwnProperty(rating)) {
        distribution[rating]++;
      }
    });
    return distribution;
  }
}

export default AnalyticsService;
