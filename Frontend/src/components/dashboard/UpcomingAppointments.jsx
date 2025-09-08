// src/components/dashboard/UpcomingAppointments.jsx
export default function UpcomingAppointments() {
  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Upcoming Appointments
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Date
                </th>
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Time
                </th>
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Client
                </th>
                <th className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Service
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-t-[#dbe0e6]">
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  July 20, 2024
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  10:00 AM
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                  Ava Davis
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  Balayage
                </td>
              </tr>
              <tr className="border-t border-t-[#dbe0e6]">
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  July 21, 2024
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  1:00 PM
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                  Isabella Evans
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  Perm
                </td>
              </tr>
              <tr className="border-t border-t-[#dbe0e6]">
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  July 22, 2024
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  3:00 PM
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                  Mia Foster
                </td>
                <td className="table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  Extensions
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <style>
          {`@container(max-width:120px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-120{display: none;}}
          @container(max-width:240px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-240{display: none;}}
          @container(max-width:360px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-360{display: none;}}
          @container(max-width:480px){.table-bc0b9d91-e581-4355-abc2-2b41e8056cad-column-480{display: none;}}`}
        </style>
      </div>
    </>
  );
}
