// src/components/dashboard/UpcomingAppointments.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppointmentService from "@/services/AppointmentService";
import Table from "@/components/common/Table";

export default function UpcomingAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUpcomingAppointments = useCallback(async () => {
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
  }, [user?.id, user?.role]);
  useEffect(() => {
    fetchUpcomingAppointments();
  }, [fetchUpcomingAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await AppointmentService.updateAppointmentStatus(
        appointmentId,
        newStatus
      );
      fetchUpcomingAppointments(); // Refresh the list
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Upcoming Appointments
      </h2>
      <div className="py-4">
        <Table
          appointments={appointments}
          onStatusUpdate={handleStatusUpdate}
          viewType="upcoming"
          loading={loading}
          error={error}
          emptyMessage="No upcoming appointments"
          showHeader={true} // CHANGED FROM false TO true
          maxHeight="max-h-80"
        />
      </div>
    </>
  );
}
