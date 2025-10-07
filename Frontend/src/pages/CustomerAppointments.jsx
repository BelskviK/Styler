// Frontend\src\pages\CustomerAppointments.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppointmentService from "../services/AppointmentService";

const CustomerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("🔍 Fetching customer appointments...");

        const response = await AppointmentService.getAppointmentsByCustomer();
        console.log("📦 API Response:", response);

        // Handle different response structures
        let appointmentsData;

        if (response.data && Array.isArray(response.data)) {
          // Direct array response
          appointmentsData = response.data;
        } else if (response.data && response.data.data) {
          // Nested data response
          appointmentsData = response.data.data;
        } else if (response.data) {
          // Any other data structure
          appointmentsData = response.data;
        } else {
          appointmentsData = response;
        }

        console.log("📋 Appointments data:", appointmentsData);

        if (Array.isArray(appointmentsData)) {
          const formattedAppointments = appointmentsData.map((appointment) => ({
            id: appointment._id || appointment.id,
            service: appointment.service?.name || "Hair Service",
            date: formatAppointmentDate(
              appointment.date,
              appointment.startTime
            ),
            specialist: appointment.stylist?.name || "Our Stylist",
            image:
              appointment.stylist?.profileImage ||
              appointment.company?.image ||
              getDefaultImage(),
            status: getAppointmentStatus(appointment),
            rawData: appointment,
          }));

          setAppointments(formattedAppointments);
          console.log(
            "✅ Successfully loaded",
            formattedAppointments.length,
            "appointments"
          );
        } else {
          console.error("❌ Invalid data format:", appointmentsData);
          throw new Error("Invalid data format received from server");
        }
      } catch (err) {
        console.error("❌ Error fetching appointments:", err);

        let errorMessage = "Failed to load appointments";

        if (err.response) {
          // Server responded with error status
          console.error(
            "📡 Server response:",
            err.response.status,
            err.response.data
          );
          errorMessage =
            err.response.data?.message ||
            `Server error: ${err.response.status}`;
        } else if (err.request) {
          // Request made but no response received
          console.error("🌐 Network error - no response received");
          errorMessage = "Network error: Unable to connect to server";
        } else {
          // Something else happened
          errorMessage = err.message || "Unknown error occurred";
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // Helper function to format date and time
  const formatAppointmentDate = (dateString, timeString) => {
    try {
      if (!dateString) return "Date not scheduled";

      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };

      const formattedDate = date.toLocaleDateString("en-US", options);
      return timeString ? `${formattedDate}, ${timeString}` : formattedDate;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date not available";
    }
  };

  // Helper function to determine appointment status for UI
  const getAppointmentStatus = (appointment) => {
    try {
      const now = new Date();
      const appointmentDate = new Date(appointment.date);

      // First check backend status
      if (
        appointment.status === "cancelled" ||
        appointment.status === "noShow"
      ) {
        return "cancelled";
      } else if (appointment.status === "completed") {
        return "past";
      }

      // Then check date logic
      if (appointmentDate < now) {
        return "past";
      } else {
        return "upcoming";
      }
    } catch (error) {
      console.error("Status determination error:", error);
      return "upcoming";
    }
  };

  // Helper function to get status display text and styling
  const getStatusDisplay = (appointment) => {
    const status = appointment.rawData.status;
    const baseClasses = "text-xs font-medium px-2 py-1 rounded capitalize";

    switch (status) {
      case "pending":
        return {
          text: "Pending",
          className: `${baseClasses} bg-yellow-100 text-yellow-800`,
        };
      case "confirmed":
        return {
          text: "Confirmed",
          className: `${baseClasses} bg-blue-100 text-blue-800`,
        };
      case "completed":
        return {
          text: "Completed",
          className: `${baseClasses} bg-green-100 text-green-800`,
        };
      case "cancelled":
        return {
          text: "Cancelled",
          className: `${baseClasses} bg-red-100 text-red-800`,
        };
      case "noShow":
        return {
          text: "No Show",
          className: `${baseClasses} bg-gray-100 text-gray-800`,
        };
      default:
        return {
          text: status,
          className: `${baseClasses} bg-gray-100 text-gray-800`,
        };
    }
  };

  // Default image fallback
  const getDefaultImage = () => {
    return "https://via.placeholder.com/70x70/E7EDF4/49739c?text=Stylist";
  };

  // Update this function to check for existing review
  const shouldShowReviewButton = (appointment) => {
    const status = appointment.rawData.status;
    const hasReview = appointment.rawData.review; // Check if review field exists and has value

    // Only show button for completed appointments that don't have reviews
    return (status === "completed" || status === "cancelled") && !hasReview;
  };

  // Add this function to handle review button click
  const handleReviewClick = (appointmentId) => {
    navigate(`/review/${appointmentId}`);
  };

  // NEW: Star Rating Component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center gap-1 ml-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              rating >= star ? "text-amber-500" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs text-gray-500 ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // NEW: Get service rating from review data
  const getServiceRating = (appointment) => {
    // Check if review exists and has serviceRating
    if (
      appointment.rawData.review &&
      appointment.rawData.review.serviceRating
    ) {
      return appointment.rawData.review.serviceRating;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#49739c] mx-auto mb-4"></div>
              <p className="text-[#49739c] text-lg">
                Loading your appointments...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex justify-center items-center min-h-64">
            <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-red-700 text-lg font-bold mb-2">
                Unable to Load Appointments
              </h3>
              <p className="text-red-600 mb-4">{error}</p>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-4 py-2 bg-[#49739c] text-white rounded-lg hover:bg-[#3a5a7a] transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Sign In Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(
    (app) => app.status === "upcoming"
  );
  const pastAppointments = appointments.filter((app) => app.status === "past");
  const cancelledAppointments = appointments.filter((app) =>
    ["cancelled", "noShow"].includes(app.status)
  );

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">
            Your Appointments
          </p>
        </div>

        {/* Upcoming Appointments Section */}
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Upcoming Appointments ({upcomingAppointments.length})
        </h3>

        {upcomingAppointments.length === 0 ? (
          <div className="bg-slate-50 px-4 py-8 rounded-lg text-center">
            <p className="text-[#49739c]">No upcoming appointments</p>
          </div>
        ) : (
          upcomingAppointments.map((appointment) => {
            const statusDisplay = getStatusDisplay(appointment);
            return (
              <div
                key={appointment.id}
                className="flex gap-4 bg-slate-50 px-4 py-3 justify-between mb-3 rounded-lg border-l-4 border-blue-400"
              >
                <div className="flex items-start gap-4 w-full">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px]"
                    style={{ backgroundImage: `url("${appointment.image}")` }}
                  ></div>
                  <div className="flex flex-1 flex-col justify-between w-full">
                    <div className="flex flex-row items-start justify-between w-full gap-4">
                      <p className="text-[#0d141c] text-base font-medium leading-normal flex-1">
                        {appointment.service}
                      </p>
                      <div className="mt-1">
                        <span className={statusDisplay.className}>
                          {statusDisplay.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-end justify-between w-full gap-4 mt-2">
                      <p className="text-[#49739c] text-sm font-normal leading-normal flex-1">
                        {appointment.date}
                      </p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">
                        {appointment.specialist}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Past Appointments Section */}
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Past Appointments ({pastAppointments.length})
        </h3>

        {pastAppointments.length === 0 ? (
          <div className="bg-slate-50 px-4 py-8 rounded-lg text-center">
            <p className="text-[#49739c]">No past appointments</p>
          </div>
        ) : (
          pastAppointments.map((appointment) => {
            const statusDisplay = getStatusDisplay(appointment);
            const showReviewButton = shouldShowReviewButton(appointment);
            const serviceRating = getServiceRating(appointment);

            return (
              <div
                key={appointment.id}
                className="flex gap-4 bg-slate-50 px-4 py-3 justify-between mb-3 rounded-lg border-l-4 border-gray-400"
              >
                <div className="flex items-start gap-4 w-full">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px]"
                    style={{ backgroundImage: `url("${appointment.image}")` }}
                  ></div>
                  <div className="flex flex-1 flex-col justify-between w-full">
                    <div className="flex flex-row items-start justify-between w-full gap-4">
                      <div className="flex items-center gap-2 flex-1">
                        <p className="text-[#0d141c] text-base font-medium leading-normal">
                          {appointment.service}
                        </p>
                        {/* Show review button OR star rating */}
                        {showReviewButton ? (
                          <button
                            onClick={() => handleReviewClick(appointment.id)}
                            className="text-amber-500 hover:text-amber-600 text-sm font-medium transition-colors ml-2"
                            title="Add review for this appointment"
                          >
                            Add Review
                          </button>
                        ) : serviceRating ? (
                          <StarRating rating={serviceRating} />
                        ) : null}
                      </div>
                      <div className="mt-1">
                        <span className={statusDisplay.className}>
                          {statusDisplay.text}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-row items-end justify-between w-full gap-4 mt-2">
                      <p className="text-[#49739c] text-sm font-normal leading-normal flex-1">
                        {appointment.date}
                      </p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">
                        {appointment.specialist}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Cancelled Appointments Section */}
        {cancelledAppointments.length > 0 && (
          <>
            <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Cancelled Appointments ({cancelledAppointments.length})
            </h3>
            {cancelledAppointments.map((appointment) => {
              const statusDisplay = getStatusDisplay(appointment);
              const showReviewButton = shouldShowReviewButton(appointment);
              const serviceRating = getServiceRating(appointment);

              return (
                <div
                  key={appointment.id}
                  className="flex gap-4 bg-red-50 px-4 py-3 justify-between mb-3 rounded-lg border-l-4 border-red-500"
                >
                  <div className="flex items-start gap-4 w-full">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px] opacity-60"
                      style={{ backgroundImage: `url("${appointment.image}")` }}
                    ></div>
                    <div className="flex flex-1 flex-col justify-between w-full">
                      <div className="flex flex-row items-start justify-between w-full gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <p className="text-[#0d141c] text-base font-medium leading-normal line-through">
                            {appointment.service}
                          </p>
                          {/* Show review button OR star rating for cancelled appointments too */}
                          {showReviewButton ? (
                            <button
                              onClick={() => handleReviewClick(appointment.id)}
                              className="text-amber-500 hover:text-amber-600 text-sm font-medium transition-colors ml-2"
                              title="Add review for this appointment"
                            >
                              Add Review
                            </button>
                          ) : serviceRating ? (
                            <StarRating rating={serviceRating} />
                          ) : null}
                        </div>
                        <div className="mt-1">
                          <span className={statusDisplay.className}>
                            {statusDisplay.text}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row items-end justify-between w-full gap-4 mt-2">
                        <p className="text-[#49739c] text-sm font-normal leading-normal flex-1">
                          {appointment.date}
                        </p>
                        <p className="text-[#49739c] text-sm font-normal leading-normal">
                          {appointment.specialist}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;
