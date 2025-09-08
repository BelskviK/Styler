// src/components/Appointments/AppointmentTable.jsx
import { useState, useMemo, memo } from "react";

function AppointmentTable({
  appointments,
  search,
  onSort,
  onStatusUpdate,
  onDelete,
  userRole,
  maxHeight = "max-h-96",
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    onSort(key, direction);
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter(
      (appointment) =>
        appointment.customer?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        appointment.stylist?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        appointment.service?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [appointments, search]);

  const SortableHeader = ({ children, sortKey }) => (
    <th
      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 flex-1 min-w-0"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-between w-full">
        <span className="truncate">{children}</span>
        {sortConfig.key === sortKey && (
          <span className="ml-1 flex-shrink-0">
            {sortConfig.direction === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  if (filteredAppointments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Fixed Header */}
      <div className="flex-1 min-w-full bg-gray-50">
        <div className="flex px-4 py-3">
          <div className="flex-[180px] min-w-0">
            <span className="text-sm font-medium text-gray-700">Customer</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700">Stylist</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700">Service</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700">Date</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700">Time</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700">Status</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-700">Actions</span>
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className={`flex-1 overflow-y-auto ${maxHeight}`}>
        <div className="divide-y divide-gray-200">
          {filteredAppointments.map((appointment) => (
            <MemoizedAppointmentRow
              key={appointment._id}
              appointment={appointment}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
              userRole={userRole}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Memoized AppointmentRow component
const AppointmentRow = memo(function AppointmentRow({
  appointment,
  onStatusUpdate,
  onDelete,
  userRole,
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleStatusChange = (e) => {
    onStatusUpdate(appointment._id, e.target.value);
  };

  const handleDelete = () => {
    onDelete(appointment._id);
  };

  return (
    <div className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors duration-150">
      {/* Customer */}
      <div className="flex-[200px] min-w-0 pr-4">
        <div className="text-sm text-gray-900">
          <div className="font-medium truncate">
            {appointment.customerName || appointment.customer?.name}
          </div>
          {appointment.customerPhone && (
            <div className="text-sm text-gray-500 truncate">
              {appointment.customerPhone}
            </div>
          )}
          {appointment.customer?.email && (
            <div className="text-sm text-gray-500 truncate">
              {appointment.customer.email}
            </div>
          )}
        </div>
      </div>

      {/* Stylist */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm text-gray-900 truncate">
          {appointment.stylist?.name}
        </div>
      </div>

      {/* Service */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm text-gray-900">
          <div className="font-medium truncate">
            {appointment.service?.name}
          </div>
          <div className="text-gray-500 truncate">
            {appointment.service?.duration}min • ${appointment.service?.price}
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm text-gray-900 truncate">
          {formatDate(appointment.date)}
        </div>
      </div>

      {/* Time */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="text-sm text-gray-900 truncate">
          {appointment.startTime} - {appointment.endTime}
        </div>
      </div>

      {/* Status */}
      <div className="flex-1 min-w-0 pr-4">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            appointment.status
          )} truncate`}
        >
          {appointment.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col space-y-2">
          {(userRole === "admin" || userRole === "styler") && (
            <select
              value={appointment.status}
              onChange={handleStatusChange}
              className="text-sm border rounded px-2 py-1 hover:border-gray-300 transition-colors duration-150 w-full"
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          )}
          {(userRole === "admin" || userRole === "superadmin") && (
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm transition-colors duration-150 w-full text-left"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

// Create memoized version
const MemoizedAppointmentRow = memo(AppointmentRow);

export default memo(AppointmentTable);
