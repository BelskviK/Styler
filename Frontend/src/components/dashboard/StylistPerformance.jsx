// src/components/dashboard/StylistPerformance.jsx
export default function StylistPerformance() {
  const stylists = [
    { name: "Emily Carter", bookings: 85, revenue: "$4,500", rating: 90 },
    { name: "David Lee", bookings: 70, revenue: "$3,800", rating: 85 },
    { name: "Sophia Clark", bookings: 60, revenue: "$3,200", rating: 80 },
  ];

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Stylist Performance
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
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
              {stylists.map((stylist, index) => (
                <tr key={index} className="border-t border-t-[#dbe0e6]">
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
                          style={{ width: `${stylist.rating}%` }}
                        ></div>
                      </div>
                      <p className="text-[#111418] text-sm font-medium leading-normal">
                        {stylist.rating}
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
