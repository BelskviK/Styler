// src/pages/Services.jsx
import { useState } from "react";

const initialServices = [
  {
    name: "Haircut",
    description: "A basic haircut for any hair length.",
    duration: "30 min",
    price: "$30",
  },
  {
    name: "Coloring",
    description: "Full hair coloring service.",
    duration: "2 hours",
    price: "$80",
  },
  {
    name: "Highlights",
    description: "Adding highlights to the hair.",
    duration: "1.5 hours",
    price: "$70",
  },
  {
    name: "Styling",
    description: "Hair styling for special occasions.",
    duration: "1 hour",
    price: "$50",
  },
  {
    name: "Perm",
    description: "Permanent hair curling or straightening.",
    duration: "3 hours",
    price: "$100",
  },
];

export default function Services() {
  const [services] = useState(initialServices);

  return (
    <div className="layout-content-container flex flex-col  flex-1">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Services
        </p>
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal">
          <span className="truncate">Add Service</span>
        </button>
      </div>

      {/* Table */}
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Service
                </th>
                <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-[#60758a] w-60 text-sm font-medium leading-normal">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service, idx) => (
                <tr key={idx} className="border-t border-t-[#dbe0e6]">
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                    {service.name}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                    {service.description}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                    {service.duration}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                    {service.price}
                  </td>
                  <td className="h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em] cursor-pointer hover:text-[#111418]">
                    Edit
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responsive container queries */}
        <style>
          {`
            @container(max-width:120px){th:nth-child(1), td:nth-child(1){display:none;}}
            @container(max-width:240px){th:nth-child(2), td:nth-child(2){display:none;}}
            @container(max-width:360px){th:nth-child(3), td:nth-child(3){display:none;}}
            @container(max-width:480px){th:nth-child(4), td:nth-child(4){display:none;}}
            @container(max-width:600px){th:nth-child(5), td:nth-child(5){display:none;}}
          `}
        </style>
      </div>
    </div>
  );
}
