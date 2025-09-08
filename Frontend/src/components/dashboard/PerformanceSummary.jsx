// src/components/dashboard/PerformanceSummary.jsx
export default function PerformanceSummary() {
  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Performance Summary
      </h2>
      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#dbe0e6]">
          <p className="text-[#111418] text-base font-medium leading-normal">
            Appointments this month
          </p>
          <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">
            25
          </p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-lg p-6 border border-[#dbe0e6]">
          <p className="text-[#111418] text-base font-medium leading-normal">
            Average Rating
          </p>
          <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">
            4.8
          </p>
        </div>
      </div>
    </>
  );
}
