// src/components/common/StatusModal.jsx
import { useState } from "react";
function StatusModal({
  isOpen,
  appointment,
  onStatusUpdate,
  onDelete,
  onClose,
  userRole,
}) {
  const [selectedStatus, setSelectedStatus] = useState(
    appointment?.status || ""
  );
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !appointment) return null;

  const handleStatusUpdate = () => {
    if (selectedStatus && selectedStatus !== appointment.status) {
      onStatusUpdate(appointment.id, selectedStatus);
    } else {
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(appointment.id);
  };

  const statusOptions = [
    {
      value: "pending",
      label: "Pending",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      value: "completed",
      label: "Completed",
      color: "bg-green-100 text-green-800 border-green-200",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      color: "bg-red-100 text-red-800 border-red-200",
    },
    {
      value: "noShow",
      label: "No Show",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-gray-200">
        {!showDeleteConfirm ? (
          <>
            <h3 className="text-xl font-semibold mb-4 text-gray-900">
              Update Appointment Status
            </h3>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="font-medium text-gray-900">
                {appointment.customerName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {appointment.serviceName}
              </p>
              <p className="text-sm text-gray-600">
                {new Date(
                  appointment.date || appointment.appointmentTime
                ).toLocaleDateString()}{" "}
                •{appointment.startTime && ` ${appointment.startTime}`}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700">
                Select Status:
              </p>
              {statusOptions.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors duration-150"
                >
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={selectedStatus === option.value}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span
                    className={`px-3 py-2 text-sm font-semibold rounded-full border ${option.color} min-w-24 text-center`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-between space-x-3">
              {(userRole === "admin" || userRole === "superadmin") && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-3 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-150 flex-1 font-medium"
                >
                  Delete
                </button>
              )}

              <div
                className={`flex space-x-3 ${
                  userRole === "admin" || userRole === "superadmin"
                    ? "flex-1"
                    : "w-full"
                }`}
              >
                <button
                  onClick={onClose}
                  className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex-1 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 flex-1 font-medium shadow-sm"
                >
                  Update
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              Delete Appointment
            </h3>

            <div className="mb-6">
              <p className="text-gray-700 mb-3">
                Are you sure you want to delete this appointment?
              </p>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="font-medium text-gray-900">
                  {appointment.customerName}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {appointment.serviceName}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(
                    appointment.date || appointment.appointmentTime
                  ).toLocaleDateString()}{" "}
                  •{appointment.startTime && ` ${appointment.startTime}`}
                </p>
              </div>
              <p className="text-sm text-red-600 mt-3 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150 flex-1 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150 flex-1 font-medium shadow-sm"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StatusModal;
