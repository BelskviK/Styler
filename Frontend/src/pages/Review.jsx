// Frontend\src\pages\Review.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppointmentService from "@/services/AppointmentService";
import ReviewService from "@/services/ReviewService";
import CompanyService from "@/services/CompanyService";

export default function ReviewPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [serviceRating, setServiceRating] = useState(0);
  const [stylistRating, setStylistRating] = useState(0);
  const [companyRating, setCompanyRating] = useState(0); // NEW: Company rating state
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch appointment data and company data
  useEffect(() => {
    const fetchAppointmentData = async () => {
      try {
        setLoading(true);
        const response = await AppointmentService.getAppointmentById(
          appointmentId
        );
        console.log("Appointment data:", response.data);
        setAppointment(response.data);

        // If company is just an ObjectId, fetch company details separately
        if (
          response.data.company &&
          typeof response.data.company === "string"
        ) {
          console.log("Fetching company details for:", response.data.company);
          const companyResponse = await CompanyService.getCompanyById(
            response.data.company
          );
          console.log("Company data:", companyResponse.data);
          setCompany(companyResponse.data);
        } else if (response.data.company && response.data.company._id) {
          // If company is already populated
          console.log("Company already populated:", response.data.company);
          setCompany(response.data.company);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load appointment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (appointmentId) {
      fetchAppointmentData();
    }
  }, [appointmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Submitting review with data:", {
        appointmentId,
        serviceRating,
        stylistRating,
        companyRating, // ADDED: Include companyRating
        comment: reviewText,
      });

      // UPDATED: Submit review with all three ratings
      const response = await ReviewService.submitReview({
        appointmentId,
        serviceRating,
        stylistRating,
        companyRating, // ADDED
        comment: reviewText,
      });

      console.log("Review submission response:", response);

      if (response.data.success) {
        setSubmitted(true);
      } else {
        throw new Error(response.data.message || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to submit review. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // StarRating component
  const StarRating = ({ rating, setRating, disabled, title }) => {
    const [hoverRating, setHoverRating] = useState(0);

    return (
      <div className="mb-6">
        {title && (
          <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2">
            {title}
          </h3>
        )}
        <div className="flex flex-wrap gap-2 p-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`p-1 transition-transform duration-150 ${
                disabled
                  ? "cursor-not-allowed"
                  : "cursor-pointer hover:scale-110"
              }`}
              onClick={() => !disabled && setRating(star)}
              onMouseEnter={() => !disabled && setHoverRating(star)}
              onMouseLeave={() => !disabled && setHoverRating(0)}
              disabled={disabled}
            >
              <svg
                className={`w-10 h-10 ${
                  rating >= star || hoverRating >= star
                    ? "text-yellow-400"
                    : "text-gray-300"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Get company type with fallback
  const getCompanyType = () => {
    if (company?.type) {
      return company.type;
    }
    if (appointment?.company?.type) {
      return appointment.company.type;
    }
    return "barbershop"; // Default fallback
  };

  // Get company name with fallback
  const getCompanyName = () => {
    if (company?.name) {
      return company.name;
    }
    if (appointment?.company?.name) {
      return appointment.company.name;
    }
    return "the company";
  };

  // UPDATED: Check if all required ratings are selected (now including companyRating)
  const isFormValid =
    serviceRating > 0 && stylistRating > 0 && companyRating > 0;

  // Debug info - remove in production
  const debugInfo = {
    appointmentCompany: appointment?.company,
    companyData: company,
    companyType: getCompanyType(),
    companyName: getCompanyName(),
  };
  console.log("Debug info:", debugInfo);

  if (loading) {
    return (
      <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49739c] mx-auto mb-4"></div>
              <p className="text-[#49739c] text-lg">
                Loading appointment details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !isSubmitting) {
    return (
      <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-red-700 text-lg font-bold mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-[#49739c] text-white rounded-lg hover:bg-[#3a5a7a] transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/history")}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back to Appointments
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5 flex-1 items-center justify-center text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0d141c] mb-4">
            Thank You for Your Review!
          </h2>
          <p className="text-[#49739c] mb-8">
            Your feedback has been successfully submitted.
          </p>
          <button
            onClick={() => navigate("/history")}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-colors"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col w-full max-w-[512px] py-5 flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">
              Leave a Review
            </p>
            {/* Optional: Show basic info without the box */}
            <p className="text-[#49739c] text-sm">
              Reviewing your experience with{" "}
              {appointment?.stylist?.name || "your stylist"} at{" "}
              {getCompanyName()}
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* 1. Service Experience - Dynamic Name */}
          <StarRating
            rating={serviceRating}
            setRating={setServiceRating}
            disabled={isSubmitting}
            title={`${appointment?.service?.name || "Service"} Experience`}
          />

          {/* 2. Stylist Rating */}
          <StarRating
            rating={stylistRating}
            setRating={setStylistRating}
            disabled={isSubmitting}
            title="Stylist Rating"
          />

          {/* 3. Company Rating - Dynamic */}
          <StarRating
            rating={companyRating}
            setRating={setCompanyRating}
            disabled={isSubmitting}
            title={`${
              getCompanyType().charAt(0).toUpperCase() +
              getCompanyType().slice(1)
            } Experience`}
          />

          {/* Review Text Area */}
          <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
            <label className="flex flex-col min-w-40 flex-1">
              <textarea
                placeholder="Share your experience (optional, max 500 characters)"
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] min-h-36 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal disabled:opacity-50"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="text-right text-xs text-[#49739c] mt-1">
                {reviewText.length}/500 characters
              </div>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex px-4 py-6 justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !isFormValid}
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#0d80f2] text-white text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>

          {/* UPDATED: Form validation hint */}
          {!isFormValid && (
            <div className="px-4 pb-4">
              <p className="text-sm text-amber-600 text-center">
                Please rate all three categories to submit your review
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
