// src/components/dashboard/StylistDashboard.jsx
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import PerformanceSummary from "@/components/dashboard/PerformanceSummary";
import ClientFeedback from "@/components/dashboard/ClientFeedback";
import QuickNotes from "@/components/dashboard/QuickNotes";

export default function DashboardAdmin() {
  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1 mb-20">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
            Dashboard
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            Overview of your day and performance
          </p>
        </div>
      </div>

      <TodaySchedule />
      <UpcomingAppointments />
      <PerformanceSummary />
      <ClientFeedback />
      <QuickNotes />
    </div>
  );
}
