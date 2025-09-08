// src/components/dashboard/CustomerFeedbackSummary.jsx
import React from "react";
export default function CustomerFeedbackSummary() {
  const ratings = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 20 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Customer Feedback Summary
      </h2>
      <div className="flex flex-wrap gap-x-8 gap-y-6 p-4">
        <div className="flex flex-col gap-2">
          <p className="text-[#111418] text-4xl font-black leading-tight tracking-[-0.033em]">
            4.8
          </p>
          <div className="flex gap-0.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="text-[#111418]"
                data-icon="Star"
                data-size="18px"
                data-weight="fill"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18px"
                  height="18px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z" />
                </svg>
              </div>
            ))}
            <div
              className="text-[#111418]"
              data-icon="Star"
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
                <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z" />
              </svg>
            </div>
          </div>
          <p className="text-[#111418] text-base font-normal leading-normal">
            150 reviews
          </p>
        </div>
        <div className="grid min-w-[200px] max-w-[400px] flex-1 grid-cols-[20px_1fr_40px] items-center gap-y-3">
          {ratings.map((rating, index) => (
            <React.Fragment key={index}>
              <p className="text-[#111418] text-sm font-normal leading-normal">
                {rating.stars}
              </p>
              <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-[#dbe0e6]">
                <div
                  className="rounded-full bg-[#111418]"
                  style={{ width: `${rating.percentage}%` }}
                ></div>
              </div>
              <p className="text-[#60758a] text-sm font-normal leading-normal text-right">
                {rating.percentage}%
              </p>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
