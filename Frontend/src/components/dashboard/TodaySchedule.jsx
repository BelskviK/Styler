// src/components/dashboard/TodaySchedule.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentService from "@/services/AppointmentService";

export default function TodaySchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTodayAppointments();
  }, [user]);

  const fetchTodayAppointments = async () => {
    try {
      setLoading(true);
      const response = await AppointmentService.getTodayAppointments(
        user.id,
        user.role
      );
      setAppointments(response.data);
    } catch (err) {
      setError("Failed to fetch today's appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await AppointmentService.updateStatus(appointmentId, newStatus);
      fetchTodayAppointments(); // Refresh the list
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return (
      <>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Today's Schedule
        </h2>
        <div className="px-4 py-3">
          <div className="flex items-center justify-center h-32 bg-white rounded-lg border border-[#dbe0e6]">
            <p>Loading appointments...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Today's Schedule
        </h2>
        <div className="px-4 py-3">
          <div className="flex items-center justify-center h-32 bg-white rounded-lg border border-[#dbe0e6] text-red-500">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Today's Schedule
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Time
                </th>
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Client
                </th>
                {user.role === "superadmin" || user.role === "admin" ? (
                  <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Styler
                  </th>
                ) : null}
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Service
                </th>
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-600 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      user.role === "superadmin" || user.role === "admin"
                        ? 5
                        : 4
                    }
                    className="h-32 text-center text-[#60758a]"
                  >
                    No appointments for today
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-t-[#dbe0e6]"
                  >
                    <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {new Date(appointment.appointmentTime).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </td>
                    <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                      {appointment.customerName}
                    </td>
                    {user.role === "superadmin" || user.role === "admin" ? (
                      <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        {appointment.stylerName}
                      </td>
                    ) : null}
                    <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {appointment.serviceName}
                    </td>
                    <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-600 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <select
                        value={appointment.status}
                        onChange={(e) =>
                          handleStatusUpdate(appointment.id, e.target.value)
                        }
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no-show">No Show</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <style>
          {`@container(max-width:120px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120{display: none;}}
          @container(max-width:240px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240{display: none;}}
          @container(max-width:360px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360{display: none;}}
          @container(max-width:480px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480{display: none;}}
          @container(max-width:600px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-600{display: none;}}`}
        </style>
      </div>
    </>
  );
}
