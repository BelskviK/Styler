// src/components/dashboard/SuperadminDashboard.jsx
import React from "react";
import SuperadminMetrics from "@/components/dashboard/SuperadminMetrics";
import PopularServices from "@/components/dashboard/PopularServices";
import StylistPerformance from "@/components/dashboard/StylistPerformance";
import RecentActivity from "@/components/dashboard/RecentActivity";
import CustomerFeedbackSummary from "@/components/dashboard/CustomerFeedbackSummary";
import TodaySchedule from "@/components/dashboard/TodaySchedule";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";

export default function SuperadminDashboard() {
  return (
    <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
            Dashboard
          </p>
          <p className="text-[#60758a] text-sm font-normal leading-normal">
            Overview of your business performance
          </p>
        </div>
      </div>

      <SuperadminMetrics />
      <PopularServices />
      <StylistPerformance />
      <TodaySchedule />
      <UpcomingAppointments />
      <RecentActivity />
      <CustomerFeedbackSummary />
    </div>
  );
}
