// src/components/Appointments/AppointmentTable.jsx
import { useState } from "react";

export default function AppointmentTable({
  appointments,
  search,
  onSort,
  onStatusUpdate,
  onDelete,
  userRole,
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

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.customer?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      appointment.stylist?.name?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.service?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const SortableHeader = ({ children, sortKey }) => (
    <th
      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center">
        {children}
        {sortConfig.key === sortKey && (
          <span className="ml-1">
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
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortableHeader sortKey="customer.name">Customer</SortableHeader>
            <SortableHeader sortKey="stylist.name">Stylist</SortableHeader>
            <SortableHeader sortKey="service.name">Service</SortableHeader>
            <SortableHeader sortKey="date">Date</SortableHeader>
            <SortableHeader sortKey="startTime">Time</SortableHeader>
            <SortableHeader sortKey="status">Status</SortableHeader>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredAppointments.map((appointment) => (
            <AppointmentRow
              key={appointment._id}
              appointment={appointment}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDelete}
              userRole={userRole}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppointmentRow({ appointment, onStatusUpdate, onDelete, userRole }) {
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

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">{appointment.customer?.name}</div>
          <div className="text-gray-500">{appointment.customer?.phone}</div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">
        {appointment.stylist?.name}
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">
        <div>
          <div className="font-medium">{appointment.service?.name}</div>
          <div className="text-gray-500">
            {appointment.service?.duration}min • ${appointment.service?.price}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">
        {formatDate(appointment.date)}
      </td>
      <td className="px-4 py-4 text-sm text-gray-900">
        {appointment.startTime} - {appointment.endTime}
      </td>
      <td className="px-4 py-4 text-sm">
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
            appointment.status
          )}`}
        >
          {appointment.status}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-gray-900 space-x-2">
        {(userRole === "admin" || userRole === "styler") && (
          <select
            value={appointment.status}
            onChange={(e) => onStatusUpdate(appointment._id, e.target.value)}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
        {(userRole === "admin" || userRole === "superadmin") && (
          <button
            onClick={() => onDelete(appointment._id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}
