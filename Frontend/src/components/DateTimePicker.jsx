import React from "react";

export default function DateTimePicker() {
  return (
    <section>
      <h3 className="text-lg font-bold text-[#0d141c] px-4 pb-2">
        Pick a date and time
      </h3>
      <div className="flex flex-wrap justify-center gap-6 p-4">
        {/* Calendar */}
        <div className="flex min-w-72 max-w-[336px] flex-col">
          <div className="flex items-center justify-between p-1">
            <button className="p-2">←</button>
            <p className="font-bold">July 2024</p>
            <button className="p-2">→</button>
          </div>
          <div className="grid grid-cols-7">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <p
                key={`${d}-${i}`} // combine letter + index
                className="text-xs font-bold h-12 flex items-center justify-center"
              >
                {d}
              </p>
            ))}

            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
              <button
                key={day}
                className="h-12 w-full text-sm hover:bg-blue-100"
              >
                <div className="flex items-center justify-center rounded-full w-full h-full">
                  {day}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="flex flex-col gap-2">
          {["10:00 AM", "11:00 AM", "1:00 PM", "2:30 PM", "4:00 PM"].map(
            (time, i) => (
              <button
                key={i}
                className="px-4 py-2 border rounded-lg hover:bg-blue-100 text-sm font-medium"
              >
                {time}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  );
}
