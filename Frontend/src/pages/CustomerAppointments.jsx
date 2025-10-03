import React, { useState, useEffect } from "react";
import AppointmentService from "../services/AppointmentService";

const CustomerAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            action: getActionByStatus(appointment.status),
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
        appointment.status === "no-show"
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

  // Helper function to determine action button text
  const getActionByStatus = (status) => {
    switch (status) {
      case "pending":
        return "Confirm";
      case "confirmed":
        return "Reschedule";
      case "completed":
        return "View Details";
      case "cancelled":
        return "Book Again";
      case "no-show":
        return "Book Again";
      default:
        return "View Details";
    }
  };

  // Default image fallback
  const getDefaultImage = () => {
    return "https://via.placeholder.com/70x70/E7EDF4/49739c?text=Stylist";
  };

  const handleAction = async (appointmentId, actionType, appointment) => {
    try {
      console.log(`🎯 Action: ${actionType} for appointment ${appointmentId}`);

      switch (actionType) {
        case "Reschedule":
          alert(`Reschedule appointment ${appointmentId}`);
          // Implement reschedule logic
          break;
        case "Cancel":
          if (
            window.confirm("Are you sure you want to cancel this appointment?")
          ) {
            await AppointmentService.updateAppointmentStatus(
              appointmentId,
              "cancelled"
            );
            alert("Appointment cancelled successfully");
            window.location.reload(); // Refresh to show updated list
          }
          break;
        case "Confirm":
          await AppointmentService.updateAppointmentStatus(
            appointmentId,
            "confirmed"
          );
          alert("Appointment confirmed successfully");
          window.location.reload();
          break;
        case "View Details":
          showAppointmentDetails(appointment);
          break;
        case "Leave a Review":
          alert(`Leave review for appointment ${appointmentId}`);
          break;
        case "Book Again":
          alert(`Book again with ${appointment.rawData.stylist?.name}`);
          break;
        default:
          alert(`${actionType} action for appointment ${appointmentId}`);
      }
    } catch (err) {
      console.error("Error handling appointment action:", err);
      alert("Failed to perform action. Please try again.");
    }
  };

  const showAppointmentDetails = (appointment) => {
    const details = `
Service: ${appointment.service}
Date: ${appointment.date}
Stylist: ${appointment.specialist}
Status: ${appointment.rawData.status}
Company: ${appointment.rawData.company?.name || "N/A"}
Location: ${appointment.rawData.company?.location || "N/A"}
Notes: ${appointment.rawData.notes || "None"}
    `;
    alert(details);
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
  const cancelledAppointments = appointments.filter(
    (app) => app.status === "cancelled"
  );

  return (
    <div className="px-4 md:px-40 flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <DebugInfo />

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
            <p className="text-[#49739c] text-lg">No upcoming appointments</p>
            <p className="text-[#49739c] text-sm mt-2">
              Book your next appointment to see it here
            </p>
          </div>
        ) : (
          upcomingAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex gap-4 bg-slate-50 px-4 py-3 justify-between mb-3 rounded-lg border-l-4 border-green-500"
            >
              <div className="flex items-start gap-4">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px]"
                  style={{ backgroundImage: `url("${appointment.image}")` }}
                ></div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    {appointment.service}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.date}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.specialist}
                  </p>
                  <p className="text-xs text-gray-500 capitalize mt-1">
                    Status: {appointment.rawData.status}
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex flex-col gap-2">
                <button
                  onClick={() =>
                    handleAction(
                      appointment.id,
                      appointment.action,
                      appointment
                    )
                  }
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit hover:bg-[#d0d9e5] transition-colors"
                >
                  <span className="truncate">{appointment.action}</span>
                </button>
                {appointment.rawData.status === "confirmed" && (
                  <button
                    onClick={() =>
                      handleAction(appointment.id, "Cancel", appointment)
                    }
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-red-100 text-red-600 text-sm font-medium leading-normal w-fit hover:bg-red-200 transition-colors"
                  >
                    <span className="truncate">Cancel</span>
                  </button>
                )}
              </div>
            </div>
          ))
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
          pastAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex gap-4 bg-slate-50 px-4 py-3 justify-between mb-3 rounded-lg border-l-4 border-gray-400"
            >
              <div className="flex items-start gap-4">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px]"
                  style={{ backgroundImage: `url("${appointment.image}")` }}
                ></div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-[#0d141c] text-base font-medium leading-normal">
                    {appointment.service}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.date}
                  </p>
                  <p className="text-[#49739c] text-sm font-normal leading-normal">
                    {appointment.specialist}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <button
                  onClick={() =>
                    handleAction(
                      appointment.id,
                      appointment.action,
                      appointment
                    )
                  }
                  className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit hover:bg-[#d0d9e5] transition-colors"
                >
                  <span className="truncate">{appointment.action}</span>
                </button>
              </div>
            </div>
          ))
        )}

        {/* Cancelled Appointments Section */}
        {cancelledAppointments.length > 0 && (
          <>
            <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
              Cancelled Appointments ({cancelledAppointments.length})
            </h3>
            {cancelledAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex gap-4 bg-red-50 px-4 py-3 justify-between mb-3 rounded-lg border-l-4 border-red-500"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg size-[70px] opacity-60"
                    style={{ backgroundImage: `url("${appointment.image}")` }}
                  ></div>
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-[#0d141c] text-base font-medium leading-normal line-through">
                      {appointment.service}
                    </p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">
                      {appointment.date}
                    </p>
                    <p className="text-[#49739c] text-sm font-normal leading-normal">
                      {appointment.specialist}
                    </p>
                    <p className="text-xs text-red-500 capitalize mt-1">
                      Status: {appointment.rawData.status}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <button
                    onClick={() =>
                      handleAction(
                        appointment.id,
                        appointment.action,
                        appointment
                      )
                    }
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-medium leading-normal w-fit hover:bg-[#d0d9e5] transition-colors"
                  >
                    <span className="truncate">{appointment.action}</span>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerAppointments;
