// src/components/dashboard/RecentActivity.jsx
import React from "react";

export default function RecentActivity() {
  const activities = [
    {
      icon: "Calendar",
      title: "New booking for haircut with Emily Carter",
      time: "1 hour ago",
    },
    {
      icon: "Star",
      title: "Customer review received for David Lee",
      time: "2 hours ago",
    },
    {
      icon: "Megaphone",
      title: "Promotion created for 20% off coloring services",
      time: "3 hours ago",
    },
  ];

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Calendar":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Zm-96-88v64a8,8,0,0,1-16,0V132.94l-4.42,2.22a8,8,0,0,1-7.16-14.32l16-8A8,8,0,0,1,112,120Zm59.16,30.45L152,176h16a8,8,0,0,1,0,16H136a8,8,0,0,1-6.4-12.8l28.78-38.37A8,8,0,1,0,145.07,132a8,8,0,1,1-13.85-8A24,24,0,0,1,176,136,23.76,23.76,0,0,1,171.16,150.45Z" />
          </svg>
        );
      case "Star":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z" />
          </svg>
        );
      case "Megaphone":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M240,120a48.05,48.05,0,0,0-48-48H152.2c-2.91-.17-53.62-3.74-101.91-44.24A16,16,0,0,0,24,40V200a16,16,0,0,0,26.29,12.25c37.77-31.68,77-40.76,93.71-43.3v31.72A16,16,0,0,0,151.12,214l11,7.33A16,16,0,0,0,186.5,212l11.77-44.36A48.07,48.07,0,0,0,240,120ZM40,199.93V40h0c42.81,35.91,86.63,45,104,47.24v65.48C126.65,155,82.84,164.07,40,199.93Zm131,8,0,.11-11-7.33V168h21.6ZM192,152H160V88h32a32,32,0,1,1,0,64Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Recent Activity
      </h2>
      <div className="grid grid-cols-[40px_1fr] gap-x-2 px-4">
        {activities.map((activity, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center gap-1 pt-3">
              <div
                className="text-[#111418]"
                data-icon={activity.icon}
                data-size="24px"
                data-weight="regular"
              >
                {getIcon(activity.icon)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-[1.5px] bg-[#dbe0e6] h-2 grow"></div>
              )}
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#111418] text-base font-medium leading-normal">
                {activity.title}
              </p>
              <p className="text-[#60758a] text-base font-normal leading-normal">
                {activity.time}
              </p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
