// src/components/dashboard/TodaySchedule.jsx
export default function TodaySchedule() {
  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Today's Schedule
      </h2>
      <div className="px-4 py-3 @container">
        <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
          <table className="flex-1">
            <thead>
              <tr className="bg-white">
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Time
                </th>
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Client
                </th>
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360 px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                  Service
                </th>
                <th className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480 px-4 py-3 text-left text-[#111418] w-60 text-sm font-medium leading-normal">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-t-[#dbe0e6]">
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  9:00 AM
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                  Emily Carter
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  Haircut & Style
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full">
                    <span className="truncate">Confirmed</span>
                  </button>
                </td>
              </tr>
              <tr className="border-t border-t-[#dbe0e6]">
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  11:00 AM
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                  Olivia Bennett
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  Color Treatment
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full">
                    <span className="truncate">Confirmed</span>
                  </button>
                </td>
              </tr>
              <tr className="border-t border-t-[#dbe0e6]">
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  2:00 PM
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240 h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                  Sophia Clark
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360 h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                  Highlights
                </td>
                <td className="table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480 h-[72px] px-4 py-2 w-60 text-sm font-normal leading-normal">
                  <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal w-full">
                    <span className="truncate">Confirmed</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <style>
          {`@container(max-width:120px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-120{display: none;}}
          @container(max-width:240px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-240{display: none;}}
          @container(max-width:360px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-360{display: none;}}
          @container(max-width:480px){.table-0253e801-f02c-4984-aa90-8cd6d9edae12-column-480{display: none;}}`}
        </style>
      </div>
    </>
  );
}
