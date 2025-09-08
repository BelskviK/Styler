// src/components/dashboard/PopularServices.jsx
import React from "react";
export default function PopularServices() {
  const services = [
    { name: "Haircut", percentage: 70 },
    { name: "Coloring", percentage: 30 },
    { name: "Styling", percentage: 40 },
    { name: "Manicure", percentage: 30 },
    { name: "Pedicure", percentage: 80 },
  ];

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Popular Services
      </h2>
      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2">
          <p className="text-[#111418] text-base font-medium leading-normal">
            Service Popularity
          </p>
          <div className="grid min-h-[180px] gap-x-4 gap-y-6 grid-cols-[auto_1fr] items-center py-3">
            {services.map((service, index) => (
              <React.Fragment key={index}>
                <p className="text-[#60758a] text-[13px] font-bold leading-normal tracking-[0.015em]">
                  {service.name}
                </p>
                <div className="h-full flex-1">
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
