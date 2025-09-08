// src/pages/Appointments.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/common/Modal";
import AppointmentForm from "@/components/Appointments/AppointmentForm";
import AppointmentTable from "@/components/Appointments/AppointmentTable";
import AppointmentService from "@/services/AppointmentService";
import toast from "react-hot-toast";

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Memoized load function

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      // Check user role to determine which endpoint to call
      if (user.role === "superadmin" || user.role === "admin") {
        // Admins and superadmins get all appointments for their company
        response = await AppointmentService.getByCompany(user.company);
      } else if (user.role === "styler") {
        // Stylers only get their own appointments
        response = await AppointmentService.getByStyler(user.id);
      } else {
        // Customers only get their own appointments
        response = await AppointmentService.getByCustomer(user.id);
      }
      setAppointments(response.data);
    } catch (error) {
      console.error("Error loading appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [user.role, user.company, user.id]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Memoized sort handler
  const handleSort = useCallback((key, direction) => {
    setAppointments((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const aValue = getNestedValue(a, key);
        const bValue = getNestedValue(b, key);

        if (aValue < bValue) return direction === "asc" ? -1 : 1;
        if (aValue > bValue) return direction === "asc" ? 1 : -1;
        return 0;
      });
      return sorted;
    });
  }, []);

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  // Memoized status update - only update the specific appointment
  const handleStatusUpdate = useCallback(
    async (appointmentId, status) => {
      try {
        await AppointmentService.updateStatus(appointmentId, status);

        // Optimistic update - only change the specific appointment
        setAppointments((prev) =>
          prev.map((app) =>
            app._id === appointmentId ? { ...app, status } : app
          )
        );

        toast.success("Status updated successfully");
      } catch {
        toast.error("Failed to update status");
        // Revert on error
        loadAppointments();
      }
    },
    [loadAppointments]
  );

  // Memoized delete handler
  const handleDelete = useCallback(
    async (appointmentId) => {
      if (!confirm("Are you sure you want to delete this appointment?")) return;

      try {
        // Optimistic update
        setAppointments((prev) =>
          prev.filter((app) => app._id !== appointmentId)
        );

        await AppointmentService.delete(appointmentId);
        toast.success("Appointment deleted successfully");
      } catch {
        toast.error("Failed to delete appointment");
        // Revert on error
        loadAppointments();
      }
    },
    [loadAppointments]
  );

  // Memoized create success handler
  const handleCreateSuccess = useCallback(() => {
    setIsModalOpen(false);
    loadAppointments();
  }, [loadAppointments]);

  if (loading) {
    return (
      <div className="layout-content-container flex flex-col flex-1">
        <div className="flex items-center justify-center h-full">
          <p>Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-content-container flex flex-col flex-1">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <h1 className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Appointments
        </h1>
        {(user?.role === "superadmin" || user?.role === "admin") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal hover:bg-[#e4e7eb]"
          >
            <span className="truncate">Add Appointment</span>
          </button>
        )}
      </div>

      {/* Search */}
      <SearchInput value={search} onChange={setSearch} />

      {/* Table */}
      <div className="px-4 py-3">
        <AppointmentTable
          appointments={appointments} // Pass the main appointments array
          search={search}
          onSort={handleSort}
          onStatusUpdate={handleStatusUpdate}
          onDelete={handleDelete}
          userRole={user?.role}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Appointment"
      >
        <AppointmentForm
          onSuccess={handleCreateSuccess}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

// Memoized SearchInput to prevent re-renders when typing
const SearchInput = ({ value, onChange }) => {
  return (
    <div className="px-4 py-3">
      <label className="flex flex-col min-w-40 h-12 w-full">
        <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
          <div className="text-[#60758a] flex border-none bg-[#f0f2f5] items-center justify-center pl-4 rounded-l-lg border-r-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24px"
              height="24px"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search appointments..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-full placeholder:text-[#60758a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
          />
        </div>
      </label>
    </div>
  );
};
