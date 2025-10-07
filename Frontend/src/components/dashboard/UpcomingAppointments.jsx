// src/components/dashboard/UpcomingAppointments.jsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentService from "@/services/AppointmentService";
import { useSortableData } from "@/hooks/useSortableData";

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
      setAppointments(response.data || []);
    } catch (err) {
      setError("Failed to fetch upcoming appointments");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helpers: parse date/time more defensively
  const tryParseDate = (val) => {
    if (val == null) return null;

    // If numeric-ish, treat as timestamp (seconds or ms)
    if (typeof val === "number" || /^\d+$/.test(String(val))) {
      let n = Number(val);
      // If it's seconds (10-digit), convert to ms
      if (n > 0 && n < 1e12) n = n * 1000;
      const d = new Date(n);
      if (!isNaN(d.getTime())) return d;
    }

    // Try native parse for strings (ISO, "YYYY-MM-DD", etc.)
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;

    return null;
  };

  const parseTimeParts = (rawTime) => {
    if (!rawTime) return null;
    // matches: "9:00", "09:00", "09:00:00", "9.00", "9h00"
    const m = String(rawTime).match(/(\d{1,2})(?::|\.|h)?(\d{2})?/);
    if (!m) return null;
    const hours = parseInt(m[1], 10);
    const minutes = m[2] ? parseInt(m[2], 10) : 0;
    if (Number.isFinite(hours) && Number.isFinite(minutes)) {
      return { hours, minutes };
    }
    return null;
  };

  // Build formatted appointments once (useMemo for mild perf)
  const formattedAppointments = useMemo(
    () =>
      (appointments || []).map((appt, idx) => {
        // Keep unique id where possible
        const id = appt._id ?? appt.id ?? `fallback-${idx}`;

        // Prefer an explicit appointmentTime if backend provides it
        let appointmentDateObj =
          tryParseDate(appt.appointmentTime) || tryParseDate(appt.date);

        // If we have a separate startTime, apply it (common case: date stored without time)
        const timeParts = parseTimeParts(appt.startTime ?? appt.time);
        if (timeParts && appointmentDateObj) {
          // Only set hours/minutes if it changes something or date lacked time
          appointmentDateObj.setHours(timeParts.hours, timeParts.minutes, 0, 0);
        } else if (!appointmentDateObj && appt.date && timeParts) {
          // If date couldn't be parsed alone, try combining into an ISO-ish string
          const dateStr = String(appt.date).trim();
          // If dateStr looks like YYYY-MM-DD, combine into YYYY-MM-DDTHH:MM:00
          const hoursPadded = String(timeParts.hours).padStart(2, "0");
          const minsPadded = String(timeParts.minutes).padStart(2, "0");
          const combined = `${dateStr}T${hoursPadded}:${minsPadded}:00`;
          appointmentDateObj = tryParseDate(combined);
        }

        const appointmentISO =
          appointmentDateObj && !isNaN(appointmentDateObj.getTime())
            ? appointmentDateObj.toISOString()
            : null;

        return {
          id,
          appointmentTime: appointmentISO, // may be null if unparseable
          customerName:
            appt.customer?.name ??
            appt.customerName ??
            appt.customer_name ??
            "Unknown Customer",
          stylerName:
            appt.stylist?.name ??
            appt.stylerName ??
            appt.stylistName ??
            "Unknown Styler",
          serviceName:
            appt.service?.name ?? appt.serviceName ?? "Unknown Service",
          status: (appt.status ?? "pending").toString(),
          date: appt.date ?? null,
          startTime: appt.startTime ?? appt.time ?? null,
          endTime: appt.endTime ?? null,
          companyId: appt.company?._id ?? null,
          companyName: appt.company?.name ?? "Unknown Company",
          // keep original raw object if needed later
          raw: appt,
        };
      }),
    [appointments]
  );

  const {
    items: sortedAppointments,
    requestSort,
    sortConfig,
  } = useSortableData(formattedAppointments);

  const getClassNamesFor = (name) => {
    if (!sortConfig) return;
    return sortConfig.key === name ? sortConfig.direction : undefined;
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
                <th
                  className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal cursor-pointer hover:bg-gray-50"
                  onClick={() => requestSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {getClassNamesFor("date") === "ascending" && (
                      <span className="ml-1">↑</span>
                    )}
                    {getClassNamesFor("date") === "descending" && (
                      <span className="ml-1">↓</span>
                    )}
                  </div>
                </th>
                <th
                  className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal cursor-pointer hover:bg-gray-50"
                  onClick={() => requestSort("appointmentTime")}
                >
                  <div className="flex items-center">
                    Time
                    {getClassNamesFor("appointmentTime") === "ascending" && (
                      <span className="ml-1">↑</span>
                    )}
                    {getClassNamesFor("appointmentTime") === "descending" && (
                      <span className="ml-1">↓</span>
                    )}
                  </div>
                </th>
                <th
                  className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal cursor-pointer hover:bg-gray-50"
                  onClick={() => requestSort("customerName")}
                >
                  <div className="flex items-center">
                    Client
                    {getClassNamesFor("customerName") === "ascending" && (
                      <span className="ml-1">↑</span>
                    )}
                    {getClassNamesFor("customerName") === "descending" && (
                      <span className="ml-1">↓</span>
                    )}
                  </div>
                </th>
                {user.role === "superadmin" || user.role === "admin" ? (
                  <th
                    className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal cursor-pointer hover:bg-gray-50"
                    onClick={() => requestSort("stylerName")}
                  >
                    <div className="flex items-center">
                      Styler
                      {getClassNamesFor("stylerName") === "ascending" && (
                        <span className="ml-1">↑</span>
                      )}
                      {getClassNamesFor("stylerName") === "descending" && (
                        <span className="ml-1">↓</span>
                      )}
                    </div>
                  </th>
                ) : null}
                <th
                  className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-600 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal cursor-pointer hover:bg-gray-50"
                  onClick={() => requestSort("serviceName")}
                >
                  <div className="flex items-center">
                    Service
                    {getClassNamesFor("serviceName") === "ascending" && (
                      <span className="ml-1">↑</span>
                    )}
                    {getClassNamesFor("serviceName") === "descending" && (
                      <span className="ml-1">↓</span>
                    )}
                  </div>
                </th>
                <th
                  className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-720 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal cursor-pointer hover:bg-gray-50"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {getClassNamesFor("status") === "ascending" && (
                      <span className="ml-1">↑</span>
                    )}
                    {getClassNamesFor("status") === "descending" && (
                      <span className="ml-1">↓</span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedAppointments.length === 0 ? (
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
                sortedAppointments.map((appointment) => {
                  // Safely create display date/time
                  const apptDate = appointment.appointmentTime
                    ? new Date(appointment.appointmentTime)
                    : null;
                  const validDate =
                    apptDate && !isNaN(apptDate.getTime()) ? apptDate : null;

                  return (
                    <tr
                      key={appointment.id}
                      className="border-t border-t-[#dbe0e6]"
                    >
                      <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        {validDate ? validDate.toLocaleDateString() : "—"}
                      </td>
                      <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                        {validDate
                          ? validDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
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
                              ? "bg-blue-100 text-blue-800"
                              : appointment.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : appointment.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : appointment.status === "noShow"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
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
