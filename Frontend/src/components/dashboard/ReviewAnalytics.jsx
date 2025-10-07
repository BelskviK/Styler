import { useState, useEffect } from "react";
import {
  Star,
  Users,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import AnalyticsService from "@/services/AnalyticsService";

const ReviewAnalytics = ({ companyId = null }) => {
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentageDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchReviewStats = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        "🔍 [FRONTEND] Fetching review stats for company:",
        companyId
      );

      const response = await AnalyticsService.getReviewStatistics(companyId);

      console.log("🔍 [FRONTEND] Raw API response:", response);

      if (response.data.success) {
        console.log(
          "✅ [FRONTEND] API success, data received:",
          response.data.data
        );
        setStats(response.data.data);

        // Store debug info if available
        if (response.data.data.debug) {
          setDebugInfo(response.data.data.debug);
        }

        // Debug the distribution data
        console.log(
          "📊 [FRONTEND] Rating distribution:",
          response.data.data.ratingDistribution
        );
        console.log(
          "📊 [FRONTEND] Percentage distribution:",
          response.data.data.percentageDistribution
        );

        // Verify the data makes sense
        const totalFromDistribution = Object.values(
          response.data.data.ratingDistribution
        ).reduce((sum, count) => sum + count, 0);
        console.log("🔢 [FRONTEND] Data verification:", {
          totalReviews: response.data.data.totalReviews,
          totalFromDistribution: totalFromDistribution,
          match: response.data.data.totalReviews === totalFromDistribution,
        });
      } else {
        console.log("❌ [FRONTEND] API returned success: false", response.data);
      }
    } catch (err) {
      console.error("❌ [FRONTEND] Error fetching review analytics:", err);
      console.error("❌ [FRONTEND] Error response:", err.response);
      setError(
        err.response?.data?.message || "Failed to load review analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("🔍 [FRONTEND] ReviewAnalytics mounted, companyId:", companyId);
    fetchReviewStats();
  }, [companyId]);
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
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
          <h3 className="text-lg font-semibold">Error</h3>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchReviewStats}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="  rounded-lg shadow p-6">
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Average Rating
            </span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-yellow-900">
              {stats.averageRating.toFixed(1)}
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(stats.averageRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Positive Reviews
            </span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {stats.percentageDistribution[5] + stats.percentageDistribution[4]}%
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-4">
          Rating Distribution
        </h4>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => (
            <RatingBar
              key={stars}
              stars={stars}
              count={stats.ratingDistribution[stars]}
              percentage={stats.percentageDistribution[stars]}
            />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-800">
            {stats.percentageDistribution[5]}%
          </p>
          <p className="text-gray-600">5-Star Reviews</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold text-gray-800">
            {stats.percentageDistribution[1] + stats.percentageDistribution[2]}%
          </p>
          <p className="text-gray-600">Needs Improvement</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics;
