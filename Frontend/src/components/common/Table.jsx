// src/components/common/Table.jsx
import { useState, useMemo, memo } from "react";
import { useAuth } from "@/hooks/useAuth";
import StatusModal from "./StatusModal";
import CustomerCallModal from "./CustomerCallModal";

function Table({
  appointments = [],
  search = "",
  onSort,
  onStatusUpdate,
  onDelete,
  viewType = "all", // 'today', 'upcoming', 'all'
  maxHeight = "max-h-96",
  showHeader = true,
  emptyMessage = "No appointments found",
  loading = false,
  error = null,
}) {
  const { user } = useAuth();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    appointment: null,
  });
  const [callModal, setCallModal] = useState({
    isOpen: false,
    customer: null,
    phone: null,
  });

  const formattedAppointments = useMemo(() => {
    return appointments.map((appt, idx) => {
      const appointmentDate = appt.date || appt.appointmentTime;
      const dateObj = appointmentDate ? new Date(appointmentDate) : null;

      return {
        id: appt._id ?? appt.id ?? `fallback-${idx}`,
        customerName:
          appt.customer?.name ?? appt.customerName ?? "Unknown Customer",
        customerPhone: appt.customer?.phone ?? appt.customerPhone,
        customerEmail: appt.customer?.email,
        stylistName:
          appt.stylist?.name ??
          appt.stylerName ??
          appt.stylistName ??
          "Unknown Stylist",
        serviceName:
          appt.service?.name ?? appt.serviceName ?? "Unknown Service",
        serviceDuration: appt.service?.duration,
        servicePrice: appt.service?.price,
        date: appointmentDate,
        dateObj: dateObj,
        startTime: appt.startTime ?? appt.time,
        endTime: appt.endTime,
        status: (appt.status ?? "pending").toLowerCase(),
        appointmentTime: appt.appointmentTime,
        // Raw data for reference
        raw: appt,
      };
    });
  }, [appointments]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const newSortConfig = { key, direction };
    setSortConfig(newSortConfig);

    if (onSort) {
      onSort(key, direction);
    }
  };
  // Sort appointments based on sortConfig
  const sortedAppointments = useMemo(() => {
    if (!sortConfig.key) return formattedAppointments;

    return [...formattedAppointments].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle date sorting specially
      if (sortConfig.key === "date") {
        aVal = a.dateObj ? a.dateObj.getTime() : 0;
        bVal = b.dateObj ? b.dateObj.getTime() : 0;
      }

      // Handle null/undefined values
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      // Convert to lowercase for string comparison
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aVal > bVal) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [formattedAppointments, sortConfig]);

  // FIXED: Use internal sorting with the formatted appointments

  // For Today view, apply additional sorting rules if no manual sort is active
  const processedAppointments = useMemo(() => {
    if (viewType !== "today" || sortConfig.key) return sortedAppointments;

    return [...sortedAppointments].sort((a, b) => {
      // Move completed, cancelled, noShow to bottom
      const statusPriority = {
        completed: 3,
        cancelled: 2,
        noShow: 1,
        pending: 0,
        confirmed: 0,
        scheduled: 0,
      };

      const aPriority = statusPriority[a.status] || 0;
      const bPriority = statusPriority[b.status] || 0;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Then sort by time
      const aTime = a.dateObj ? a.dateObj.getTime() : 0;
      const bTime = b.dateObj ? b.dateObj.getTime() : 0;
      return aTime - bTime;
    });
  }, [sortedAppointments, viewType, sortConfig.key]);
  // Filter appointments based on search
  const filteredAppointments = useMemo(() => {
    if (!search) return processedAppointments;

    return processedAppointments.filter(
      (appointment) =>
        appointment.customerName
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        appointment.stylistName?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.serviceName?.toLowerCase().includes(search.toLowerCase()) ||
        appointment.customerPhone?.includes(search) ||
        appointment.customerEmail?.toLowerCase().includes(search.toLowerCase())
    );
  }, [processedAppointments, search]);

  const SortableHeader = ({ children, sortKey, className = "" }) => (
    <div
      className={`px-3 py-2 text-left text-xs font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex-1 min-w-0 ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{children}</span>
        {sortConfig.key === sortKey && (
          <span className="ml-1 flex-shrink-0 text-gray-400">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </div>
  );

  const handleStatusClick = (appointment) => {
    setStatusModal({ isOpen: true, appointment });
  };

  const handleCustomerNameClick = (appointment) => {
    if (appointment.customerPhone) {
      setCallModal({
        isOpen: true,
        customer: appointment.customerName,
        phone: appointment.customerPhone,
      });
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    if (onStatusUpdate) {
      await onStatusUpdate(appointmentId, newStatus);
    }
    setStatusModal({ isOpen: false, appointment: null });
  };

  const handleDelete = async (appointmentId) => {
    if (onDelete) {
      await onDelete(appointmentId);
    }
    setStatusModal({ isOpen: false, appointment: null });
  };

  if (loading) {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        {showHeader && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          </div>
        )}
        <div className="flex items-center justify-center h-20">
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg border border-red-200 bg-red-50">
        {showHeader && (
          <div className="px-4 py-2 bg-red-100 border-b border-red-200">
            <h3 className="text-red-800 font-medium text-sm">
              {viewType === "today"
                ? "Today's Schedule"
                : viewType === "upcoming"
                ? "Upcoming Appointments"
                : "Appointments"}
            </h3>
          </div>
        )}
        <div className="flex items-center justify-center h-20 text-red-600 text-sm">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (filteredAppointments.length === 0) {
    return (
      <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        {showHeader && (
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
            <h3 className="text-gray-800 font-medium text-sm">
              {viewType === "today"
                ? "Today's Schedule"
                : viewType === "upcoming"
                ? "Upcoming Appointments"
                : "Appointments"}
            </h3>
          </div>
        )}
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
        {/* Scrollable Container - Header and Body together */}
        <div className={`flex-1 overflow-y-auto ${maxHeight}`}>
          {/* Header - Now scrolls with content */}
          {showHeader && (
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
              <div className="flex px-3 py-2">
                {/* Date - Moved to first column */}
                <div className="flex-1 min-w-0">
                  <SortableHeader sortKey="date">
                    {viewType === "today" ? "Time" : "Date"}
                  </SortableHeader>
                </div>

                {/* Customer */}
                <div className="flex-1 min-w-0">
                  <SortableHeader sortKey="customerName">
                    Customer
                  </SortableHeader>
                </div>

                {/* Stylist - Only for admin/superadmin */}
                {(user.role === "superadmin" || user.role === "admin") && (
                  <div className="flex-1 min-w-0">
                    <SortableHeader sortKey="stylistName">
                      Stylist
                    </SortableHeader>
                  </div>
                )}

                {/* Service */}
                <div className="flex-1 min-w-0">
                  <SortableHeader sortKey="serviceName">Service</SortableHeader>
                </div>

                {/* Status */}
                <div className="flex-1 min-w-0">
                  <SortableHeader sortKey="status">Status</SortableHeader>
                </div>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <MemoizedAppointmentRow
                key={appointment.id}
                appointment={appointment}
                onStatusClick={handleStatusClick}
                onCustomerNameClick={handleCustomerNameClick}
                userRole={user.role}
                viewType={viewType}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        appointment={statusModal.appointment}
        onStatusUpdate={handleStatusUpdate}
        onDelete={handleDelete}
        onClose={() => setStatusModal({ isOpen: false, appointment: null })}
        userRole={user.role}
      />

      {/* Customer Call Modal */}
      <CustomerCallModal
        isOpen={callModal.isOpen}
        customerName={callModal.customer}
        phoneNumber={callModal.phone}
        onClose={() =>
          setCallModal({ isOpen: false, customer: null, phone: null })
        }
      />
    </>
  );
}

// Memoized AppointmentRow component
const AppointmentRow = memo(function AppointmentRow({
  appointment,
  onStatusClick,
  onCustomerNameClick,
  userRole,
  viewType = "all",
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB"); // dd/mm/yyyy format
  };

  const formatTime = (timeString) => {
    if (!timeString) return "—";
    // Handle both time strings and date objects
    if (timeString instanceof Date || !isNaN(new Date(timeString))) {
      return new Date(timeString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return timeString;
  };

  const formatDuration = (duration) => {
    if (!duration) return "";
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      noShow: "bg-gray-100 text-gray-800 border-gray-200",
      scheduled: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Date and Time display in one column
  const renderDateTime = () => {
    if (viewType === "today") {
      // For today, show time and duration
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-900">
            {formatTime(appointment.appointmentTime || appointment.startTime)}
          </span>
          {appointment.serviceDuration && (
            <span className="text-xs text-gray-500">
              {formatDuration(appointment.serviceDuration)}
            </span>
          )}
        </div>
      );
    } else {
      // For other views, show date and time
      return (
        <div className="flex flex-col">
          <span className="text-xs font-medium text-gray-900">
            {formatDate(appointment.date || appointment.appointmentTime)}
          </span>
          <span className="text-xs text-gray-500">
            {formatTime(appointment.startTime)}
            {appointment.serviceDuration &&
              ` • ${formatDuration(appointment.serviceDuration)}`}
          </span>
        </div>
      );
    }
  };

  return (
    <div className="flex items-center px-3 py-2 hover:bg-gray-50 transition-colors duration-150 min-h-[48px]">
      {/* Date/Time - Moved to first column */}
      <div className="flex-1 min-w-0 pr-3">{renderDateTime()}</div>

      {/* Customer */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="text-xs text-gray-900">
          <button
            onClick={() => onCustomerNameClick(appointment)}
            className="font-medium truncate hover:text-blue-600 transition-colors duration-150 text-left w-full text-xs"
          >
            {appointment.customerName}
          </button>
          {appointment.customerPhone && (
            <div className="text-xs text-gray-500 truncate">
              {appointment.customerPhone}
            </div>
          )}
          {appointment.customerEmail && (
            <div className="text-xs text-gray-500 truncate">
              {appointment.customerEmail}
            </div>
          )}
        </div>
      </div>

      {/* Stylist - Only for admin/superadmin */}
      {(userRole === "superadmin" || userRole === "admin") && (
        <div className="flex-1 min-w-0 pr-3">
          <div className="text-xs text-gray-900 truncate">
            {appointment.stylistName}
          </div>
        </div>
      )}

      {/* Service */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="text-xs text-gray-900">
          <div className="font-medium truncate text-xs">
            {appointment.serviceName}
          </div>
          {appointment.servicePrice && (
            <div className="text-xs text-gray-500">
              ${appointment.servicePrice}
            </div>
          )}
        </div>
      </div>

      {/* Status - Clickable */}
      <div className="flex-1 min-w-0 pr-3">
        <button
          onClick={() => onStatusClick(appointment)}
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
            appointment.status
          )} truncate capitalize hover:shadow-sm transition-all duration-150 cursor-pointer text-[10px]`}
        >
          {appointment.status}
        </button>
      </div>
    </div>
  );
});

// Create memoized version
const MemoizedAppointmentRow = memo(AppointmentRow);

export default memo(Table);
