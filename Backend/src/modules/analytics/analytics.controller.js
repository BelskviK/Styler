// Backend/controllers/analytics.controller.js
import AnalyticsService from "../services/analytics.service.js";

export async function getRevenueAnalytics(req, res) {
  try {
    const { timeframe = "monthly", startDate, endDate } = req.query;
    const userCompany = req.user.company;

    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    const params = {
      timeframe,
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const revenueData = await AnalyticsService.getRevenueAnalytics(params);

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

    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    const params = {
      timeframe,
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const appointmentData = await AnalyticsService.getAppointmentAnalytics(
      params
    );

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

    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    const params = {
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const customerData = await AnalyticsService.getCustomerAnalytics(params);

    res.json({
      ...customerData,
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

    const params = {
      timeframe,
      limit,
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const result = await AnalyticsService.getPopularServices(params);

    res.json(result);
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

    const params = {
      serviceId,
      timeframe,
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const result = await AnalyticsService.getServicePerformance(params);

    res.json({
      ...result,
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

    const params = { companyId: effectiveCompanyId };
    const data = await AnalyticsService.getReviewStatistics(params);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error in getReviewStatistics:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
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

    const params = {
      companyId: effectiveCompanyId,
      startDate,
      endDate,
    };

    const data = await AnalyticsService.getReviewAnalytics(params);

    res.status(200).json({
      success: true,
      data,
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
    const userCompany = req.user.company;

    if (!userCompany) {
      return res.status(403).json({ message: "Company access not authorized" });
    }

    const params = {
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const result = await AnalyticsService.getDashboardStats(params);

    res.json({
      ...result,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
      company: userCompany,
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

    const params = {
      startDate,
      endDate,
      companyId: userCompany.toString(),
    };

    const result = await AnalyticsService.getEmployeePerformance(params);

    res.json({
      ...result,
      filters: { startDate, endDate },
      company: userCompany,
    });
  } catch (error) {
    console.error("Error fetching employee analytics:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
