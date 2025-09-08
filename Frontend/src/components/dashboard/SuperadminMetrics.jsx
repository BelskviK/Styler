// src/components/dashboard/SuperadminMetrics.jsx
export default function SuperadminMetrics() {
  const metrics = [
    { label: "Total Bookings", value: "234", change: "+12%" },
    { label: "Revenue", value: "$12,500", change: "+8%" },
    { label: "Average Rating", value: "4.8", change: "+5%" },
    { label: "New Customers", value: "56", change: "+15%" },
  ];

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#dbe0e6]"
        >
          <p className="text-[#111418] text-base font-medium leading-normal">
            {metric.label}
          </p>
          <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">
            {metric.value}
          </p>
          <p className="text-[#078838] text-base font-medium leading-normal">
            {metric.change}
          </p>
        </div>
      ))}
    </div>
  );
}
