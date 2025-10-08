// src/components/dashboard/TodaySchedule.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentService from "@/services/AppointmentService";
import Table from "@/components/common/Table";

export default function TodaySchedule() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTodayAppointments = useCallback(async () => {
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
  }, [user?.id, user?.role]);
  useEffect(() => {
    fetchTodayAppointments();
  }, [fetchTodayAppointments]);
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await AppointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus
      );
      fetchTodayAppointments(); // Refresh the list
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Today's Schedule
      </h2>
      <div className="px-4 py-3">
        <Table
          appointments={appointments}
          onStatusUpdate={handleStatusUpdate}
          viewType="today"
          loading={loading}
          error={error}
          emptyMessage="No appointments for today"
          showHeader={true} // Changed to true
          maxHeight="max-h-80"
        />
      </div>
    </>
  );
}
