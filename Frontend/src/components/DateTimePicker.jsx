// Frontend/src/components/DateTimePicker.jsx
import React, { useState } from "react";

export default function DateTimePicker() {
  const [selectedDate, setSelectedDate] = useState(5); // Default selected date (5th)

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
  ];

  return (
    <>
      <div className="flex flex-wrap items-center justify-center gap-6 p-4">
        <div className="flex min-w-72 max-w-[336px] flex-1 flex-col gap-0.5">
          <div className="flex items-center p-1 justify-between">
            <button>
              <div
                className="text-[#0d141c] flex size-10 items-center justify-center"
                data-icon="CaretLeft"
                data-size="18px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                </svg>
              </div>
            </button>
            <p className="text-[#0d141c] text-base font-bold leading-tight flex-1 text-center">
              July 2024
            </p>
            <button>
              <div
                className="text-[#0d141c] flex size-10 items-center justify-center"
                data-icon="CaretRight"
                data-size="18px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </div>
            </button>
          </div>
          <div className="grid grid-cols-7">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <p
                key={i}
                className="text-[#0d141c] text-[13px] font-bold leading-normal tracking-[0.015em] flex h-12 w-full items-center justify-center pb-0.5"
              >
                {d}
              </p>
            ))}

            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 3; // Start from -3 to align the first day correctly
              if (day < 1 || day > 31) {
                return <div key={i} className="h-12 w-full"></div>;
              }

              return (
                <button
                  key={i}
                  className={`h-12 w-full text-sm font-medium leading-normal ${
                    day === selectedDate ? "text-slate-50" : "text-[#0d141c]"
                  }`}
                  onClick={() => setSelectedDate(day)}
                >
                  <div
                    className={`flex size-full items-center justify-center rounded-full ${
                      day === selectedDate ? "bg-[#0d80f2]" : ""
                    }`}
                  >
                    {day}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Available Times
      </h2>
      <div className="flex gap-3 p-3 flex-wrap pr-4">
        {timeSlots.map((time, i) => (
          <div
            key={i}
            className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#e7edf4] pl-4 pr-4"
          >
            <p className="text-[#0d141c] text-sm font-medium leading-normal">
              {time}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
