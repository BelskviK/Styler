// src/components/dashboard/PopularServices.jsx
import React, { useState, useEffect } from "react";
import AnalyticsService from "@/services/AnalyticsService";

export default function PopularServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPopularServices();
  }, []);

  const fetchPopularServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AnalyticsService.getPopularServices();

      let servicesData = [];

      // Handle empty response or invalid format
      if (response.data && Array.isArray(response.data)) {
        servicesData = response.data;
      } else if (response.data && response.data.success && response.data.data) {
        servicesData = response.data.data;
      } else {
        throw new Error("Invalid response format");
      }

      if (servicesData.length === 0) {
        setError("No popular services data found");
        setServices(getSampleData());
      } else {
        // Calculate percentages based on appointment counts
        const servicesWithPercentages = calculatePercentages(servicesData);
        setServices(servicesWithPercentages);
      }
    } catch (err) {
      console.error("Error fetching popular services:", err);
      setError("Failed to load popular services data");
      setServices(getSampleData());
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentages = (servicesData) => {
    const totalAppointments = servicesData.reduce(
      (sum, service) => sum + (service.appointments || 0),
      0
    );

    return servicesData.map((service) => ({
      ...service,
      percentage:
        totalAppointments > 0
          ? Math.round((service.appointments / totalAppointments) * 100)
          : 0,
    }));
  };

  const getSampleData = () => [
    { name: "Haircut", percentage: 70, appointments: 150, revenue: 4500 },
    { name: "Coloring", percentage: 30, appointments: 65, revenue: 3250 },
    { name: "Styling", percentage: 40, appointments: 85, revenue: 2125 },
    { name: "Manicure", percentage: 30, appointments: 60, revenue: 1800 },
    { name: "Pedicure", percentage: 80, appointments: 170, revenue: 5100 },
  ];

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] pb-3">
          Popular Services
        </h2>
        <div className="animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Popular Services
      </h2>

      {error && (
        <div className="mx-4 mb-3 p-3 bg-red-100 border border-red-200 text-red-700 rounded text-sm">
          {error} - Showing sample data
        </div>
      )}

      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2">
          <p className="text-[#111418] text-base font-medium leading-normal">
            Service Popularity
          </p>
          <div className="grid min-h-[180px] gap-x-4 gap-y-6 grid-cols-[auto_1fr] items-center py-3">
            {services.map((service, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col">
                  <p className="text-[#60758a] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    {service.name}
                  </p>
                  <p className="text-[#888] text-xs">
                    {service.appointments} appointments
                  </p>
                </div>
                <div className="h-full flex-1">
                  {/* Progress bar with calculated percentage */}
                  <div
                    className="border-[#60758a] bg-[#f0f2f5] border-r-2 h-full"
                    style={{ width: `${service.percentage}%` }}
                  ></div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
