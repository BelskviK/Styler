// src/components/dashboard/StylistPerformance.jsx
import { useState, useEffect } from "react";
import AnalyticsService from "@/services/AnalyticsService";

export default function StylistPerformance() {
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStylistPerformance();
  }, []);

  const fetchStylistPerformance = async () => {
    try {
      setLoading(true);
      const response = await AnalyticsService.getEmployeePerformance();

      if (response.data && response.data.employees) {
        // Transform the API response to match component structure
        const transformedData = response.data.employees.map((employee) => ({
          id: employee._id || employee.id,
          name: employee.name,
          bookings: employee.completedAppointments || 0,
          revenue: `$${(employee.totalRevenue || 0).toLocaleString()}`,
          rating: Math.round(employee.avgStylistRating || 0),
          utilizationRate: employee.utilizationRate || 0,
          totalReviews: employee.totalReviews || 0,
        }));

        setStylists(transformedData);
      }
    } catch (err) {
      console.error("Error fetching stylist performance:", err);
      setError("Failed to load stylist performance data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
          Stylist Performance
        </h2>
        <div className="animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
          Stylist Performance
        </h2>
        <div className="text-red-500 text-center p-4">{error}</div>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Stylist Performance
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          {stylists.length === 0 ? (
            <div className="w-full text-center py-8 text-gray-500">
              No stylist data available
            </div>
          ) : (
            <table className="flex-1">
              <thead>
                <tr className="bg-white">
                  <th className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Stylist
                  </th>
                  <th className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Bookings
                  </th>
                  <th className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Revenue
                  </th>
                  <th className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-480 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Customer Rating
                  </th>
                </tr>
              </thead>
              <tbody>
                {stylists.map((stylist) => (
                  <tr key={stylist.id} className="border-t border-t-[#dbe0e6]">
                    <td className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-120 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                      {stylist.name}
                    </td>
                    <td className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {stylist.bookings}
                    </td>
                    <td className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {stylist.revenue}
                    </td>
                    <td className="table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-480 h-[72px] px-4 py-2 w-[400px] text-sm font-normal leading-normal">
                      <div className="flex items-center gap-3">
                        <div className="w-[88px] overflow-hidden rounded-sm bg-[#dbe0e6]">
                          <div
                            className="h-1 rounded-full bg-[#111418]"
                            style={{ width: `${stylist.rating * 20}%` }}
                          ></div>
                        </div>
                        <p className="text-[#111418] text-sm font-medium leading-normal">
                          {stylist.rating}/5
                        </p>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <style>
          {`@container(max-width:120px){.table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-120{display: none;}}
          @container(max-width:240px){.table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-240{display: none;}}
          @container(max-width:360px){.table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-360{display: none;}}
          @container(max-width:480px){.table-8eae624c-5ba7-47db-95f6-5655d6d92276-column-480{display: none;}}`}
        </style>
      </div>
    </>
  );
}
