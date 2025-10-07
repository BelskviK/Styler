// src/components/dashboard/ReviewAnalytics.jsx - UPDATED with safe data access
import React, { useState, useEffect } from "react";

import {
  Star,
  Users,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Building,
  Scissors,
} from "lucide-react";
import AnalyticsService from "@/services/AnalyticsService";

const ReviewAnalytics = ({ companyId = null }) => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    averageServiceRating: 0,
    averageCompanyRating: 0,
    averageStylistRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentageDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    ratingBreakdown: {
      service: { average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      company: { average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
      stylist: { average: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviewStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching review statistics...");

      const response = await AnalyticsService.getReviewStatistics(companyId);
      console.log("📊 Review stats response:", response);

      if (response.data.success) {
        console.log("✅ Review stats data:", response.data.data);
        setStats(response.data.data);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch review statistics"
        );
      }
    } catch (err) {
      console.error("❌ Error fetching review analytics:", err);
      console.error("❌ Error details:", err.response?.data);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load review analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviewStats();
  }, [companyId]);

  // Safe data access functions
  const getServiceRating = () => {
    return (
      stats.ratingBreakdown?.service?.average || stats.averageServiceRating || 0
    );
  };

  const getCompanyRating = () => {
    return (
      stats.ratingBreakdown?.company?.average || stats.averageCompanyRating || 0
    );
  };

  const getStylistRating = () => {
    return (
      stats.ratingBreakdown?.stylist?.average || stats.averageStylistRating || 0
    );
  };

  const getServiceDistribution = () => {
    return (
      stats.ratingBreakdown?.service?.distribution ||
      stats.ratingDistribution || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );
  };

  const getCompanyDistribution = () => {
    return (
      stats.ratingBreakdown?.company?.distribution || {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      }
    );
  };

  const getStylistDistribution = () => {
    return (
      stats.ratingBreakdown?.stylist?.distribution || {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      }
    );
  };

  const getPositivePercentage = (distribution) => {
    const dist = distribution || stats.ratingDistribution;
    return (dist[5] || 0) + (dist[4] || 0);
  };

  const RatingBar = ({ stars, count, percentage }) => (
    <div className="flex items-center gap-2 mb-2">
      <div className="flex items-center w-8">
        <span className="text-sm font-medium text-gray-600 w-4">{stars}</span>
        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 ml-1" />
      </div>
      <div className="flex-1 bg-gray-200 rounded-full h-2">
        <div
          className="bg-yellow-400 h-2 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm text-gray-600 w-14 text-right truncate">
        {count} ({percentage}%)
      </span>
    </div>
  );

  const RatingCard = ({ title, average, distribution, icon, color }) => {
    const colorClasses = {
      green: {
        bg: "bg-green-50",
        text: "text-green-800",
        darkText: "text-green-900",
        icon: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-800",
        darkText: "text-purple-900",
        icon: "text-purple-600",
      },
      orange: {
        bg: "bg-orange-50",
        text: "text-orange-800",
        darkText: "text-orange-900",
        icon: "text-orange-600",
      },
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-800",
        darkText: "text-blue-900",
        icon: "text-blue-600",
      },
    };

    const colorConfig = colorClasses[color] || colorClasses.blue;

    return (
      <div className={`${colorConfig.bg} rounded-lg p-4`}>
        <div className="flex items-center gap-2 mb-2">
          {React.cloneElement(icon, {
            className: `w-5 h-5 ${colorConfig.icon}`,
          })}
          <span className={`text-sm font-medium ${colorConfig.text}`}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <p className={`text-2xl font-bold ${colorConfig.darkText}`}>
            {average.toFixed(1)}
          </p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(average)
                    ? `fill-${color}-400 text-${color}-400`
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-600">
          {getPositivePercentage(distribution)}% positive
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 text-red-600 mb-4">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Error Loading Reviews</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchReviewStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Review Analytics
        </h3>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <span className="text-sm text-gray-600">Customer Feedback</span>
        </div>
      </div>

      {/* No Reviews State */}
      {stats.totalReviews === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">
            No Reviews Yet
          </h4>
          <p className="text-gray-500 mb-4">
            Customer reviews will appear here once they start submitting
            feedback.
          </p>
        </div>
      )}

      {/* Summary Cards - Only show if there are reviews */}
      {stats.totalReviews > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Total Reviews
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalReviews}
              </p>
            </div>

            <RatingCard
              title="Service Rating"
              average={getServiceRating()}
              distribution={getServiceDistribution()}
              icon={<Scissors />}
              color="green"
            />

            <RatingCard
              title="Company Rating"
              average={getCompanyRating()}
              distribution={getCompanyDistribution()}
              icon={<Building />}
              color="purple"
            />

            <RatingCard
              title="Stylist Rating"
              average={getStylistRating()}
              distribution={getStylistDistribution()}
              icon={<Users />}
              color="orange"
            />
          </div>

          {/* Overall Rating Distribution */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-4">
              Overall Rating Distribution
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <RatingBar
                  key={stars}
                  stars={stars}
                  count={stats.ratingDistribution[stars] || 0}
                  percentage={stats.percentageDistribution[stars] || 0}
                />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {stats.percentageDistribution[5] || 0}%
              </p>
              <p className="text-gray-600">5-Star Reviews</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">
                {(stats.percentageDistribution[1] || 0) +
                  (stats.percentageDistribution[2] || 0)}
                %
              </p>
              <p className="text-gray-600">Needs Improvement</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReviewAnalytics;
