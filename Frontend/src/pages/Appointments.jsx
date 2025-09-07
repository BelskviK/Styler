// src/pages/Appointments.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/useAuth";
import Modal from "@/components/common/Modal";
import AppointmentForm from "@/components/Appointments/AppointmentForm";
import AppointmentTable from "@/components/Appointments/AppointmentTable";
import AppointmentService from "@/services/AppointmentService";
import toast from "react-hot-toast";

export default function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppointments();
  }, []);

  const filterAppointments = useCallback(() => {
    const filtered = appointments.filter(
      (appointment) =>
        appointment.customer?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        appointment.stylist?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        appointment.service?.name?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [search, appointments]);

  useEffect(() => {
    filterAppointments();
  }, [filterAppointments]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await AppointmentService.getAll();
      setAppointments(response.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key, direction) => {
    const sorted = [...filteredAppointments].sort((a, b) => {
      const aValue = getNestedValue(a, key);
      const bValue = getNestedValue(b, key);

      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredAppointments(sorted);
  };

  const getNestedValue = (obj, path) => {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj);
  };

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await AppointmentService.updateStatus(appointmentId, status);
      toast.success("Status updated successfully");
      loadAppointments();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (appointmentId) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      await AppointmentService.delete(appointmentId);
      toast.success("Appointment deleted successfully");
      loadAppointments();
    } catch {
      toast.error("Failed to delete appointment");
    }
  };

  const handleCreateSuccess = () => {
    setIsModalOpen(false);
    loadAppointments();
  };

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
          appointments={filteredAppointments}
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

function SearchInput({ value, onChange }) {
  return (
    <div className="px-4 py-3 z-10">
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
}
