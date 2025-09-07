// Frontend/src/components/DateTimePicker.jsx
import React, { useState, useEffect } from "react";

export default function DateTimePicker({ onDateTimeSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // Static working hours (10:00 to 18:00)
  const [workingHours] = useState({
    start: 10, // 10:00 AM
    end: 18, // 6:00 PM
    slotDuration: 30, // 30 minutes per slot
  });

  // Generate time slots based on working hours
  const generateTimeSlots = () => {
    const slots = [];
    const { start, end, slotDuration } = workingHours;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Handle date selection
  const handleDateSelect = (day) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(newDate);
    setSelectedTime(null);

    if (onDateTimeSelect) {
      onDateTimeSelect({ date: newDate, time: null });
    }
  };

  // Handle time selection
  const handleTimeSelect = (time) => {
    setSelectedTime(time);

    if (onDateTimeSelect) {
      onDateTimeSelect({ date: selectedDate, time });
    }
  };

  // Check if a date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Check if a date is selected
  const isSelected = (day) => {
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Check if a date is in the past
  const isPastDate = (day) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for comparison
    return date < today;
  };

  // Format month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Auto-select current date on component mount
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }, []);

  return (
    <section className="mt-6">
      <h3 className="text-lg font-bold text-[#0d141c] px-4 pb-2">
        Select Date & Time
      </h3>

      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Calendar Section */}
        <div className="flex-1 min-w-72 max-w-md">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Previous month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="text-[#0d141c]"
                >
                  <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"></path>
                </svg>
              </button>

              <h4 className="text-[#0d141c] text-base font-bold">
                {formatMonthYear(currentDate)}
              </h4>

              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Next month"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                  className="text-[#0d141c]"
                >
                  <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z"></path>
                </svg>
              </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                <div
                  key={index}
                  className="text-center text-sm font-medium text-gray-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (day === null) {
                  return <div key={index} className="h-10" />;
                }

                const isDisabled = isPastDate(day);
                const isCurrentDay = isToday(day);
                const isDaySelected = isSelected(day);

                return (
                  <button
                    key={index}
                    onClick={() => !isDisabled && handleDateSelect(day)}
                    disabled={isDisabled}
                    className={`
                      h-10 rounded-full text-sm font-medium transition-all
                      ${
                        isDisabled
                          ? "text-gray-300 cursor-not-allowed"
                          : isDaySelected
                          ? "bg-[#0d80f2] text-white"
                          : isCurrentDay
                          ? "border-2 border-[#0d80f2] text-[#0d80f2]"
                          : "text-[#0d141c] hover:bg-gray-100"
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Time Slots Section */}
        <div className="flex-1">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-[#0d141c] text-base font-bold mb-4">
              Available Times for {selectedDate.toLocaleDateString()}
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {timeSlots.map((time, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(time)}
                  className={`
                    py-2 px-3 rounded-lg text-sm font-medium transition-all
                    ${
                      selectedTime === time
                        ? "bg-[#0d80f2] text-white"
                        : "bg-[#e7edf4] text-[#0d141c] hover:bg-[#d0d9e8]"
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Selected DateTime Summary */}
      {(selectedDate || selectedTime) && (
        <div className="px-4 py-2 bg-blue-50 rounded-lg mx-4 mt-4">
          <p className="text-sm text-blue-800">
            Selected: {selectedDate.toLocaleDateString()}
            {selectedTime && ` at ${selectedTime}`}
          </p>
        </div>
      )}
    </section>
  );
}
