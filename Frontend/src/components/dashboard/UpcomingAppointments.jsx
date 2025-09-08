// src/components/dashboard/UpcomingAppointments.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentService from "@/services/AppointmentService";

export default function UpcomingAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, [user]);

  const fetchUpcomingAppointments = async () => {
    try {
      setLoading(true);
      const response = await AppointmentService.getUpcomingAppointments(
        user.id,
        user.role
      );
      setAppointments(response.data);
    } catch (err) {
      setError("Failed to fetch upcoming appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Upcoming Appointments
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
          Upcoming Appointments
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
        Upcoming Appointments
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Date
                </th>
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Time
                </th>
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Client
                </th>
                {user.role === "superadmin" || user.role === "admin" ? (
                  <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Styler
                  </th>
                ) : null}
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-600 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Service
                </th>
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-720 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">
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
                        ? 6
                        : 5
                    }
                    className="h-32 text-center text-[#60758a]"
                  >
                    No upcoming appointments
                  </td>
                </tr>
              ) : (
                appointments.map((appointment) => (
                  <tr
                    key={appointment.id}
                    className="border-t border-t-[#dbe0e6]"
                  >
                    <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {new Date(
                        appointment.appointmentTime
                      ).toLocaleDateString()}
                    </td>
                    <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {new Date(appointment.appointmentTime).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </td>
                    <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                      {appointment.customerName}
                    </td>
                    {user.role === "superadmin" || user.role === "admin" ? (
                      <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                        {appointment.stylerName}
                      </td>
                    ) : null}
                    <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-600 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {appointment.serviceName}
                    </td>
                    <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-720 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          appointment.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : appointment.status === "no-show"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <style>
          {`@container(max-width:120px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120{display: none;}}
          @container(max-width:240px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240{display: none;}}
          @container(max-width:360px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360{display: none;}}
          @container(max-width:480px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480{display: none;}}
          @container(max-width:600px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-600{display: none;}}
          @container(max-width:720px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-720{display: none;}}`}
        </style>
      </div>
    </>
  );
}
