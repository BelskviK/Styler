import React from "react";

const services = [
  { name: "Haircut", price: "$25" },
  { name: "Beard Trim", price: "$15" },
  { name: "Haircut + Beard", price: "$35" },
  { name: "Shave", price: "$20" },
];

export default function ServiceSelector() {
  return (
    <section className="p-4">
      <h3 className="text-lg font-bold text-[#0d141c] px-4 pb-2">
        Choose your service
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {services.map((s, i) => (
          <button
            key={i}
            className="flex justify-between items-center px-4 py-3 border rounded-lg hover:bg-blue-100"
          >
            <span>{s.name}</span>
            <span className="text-sm text-gray-500">{s.price}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
