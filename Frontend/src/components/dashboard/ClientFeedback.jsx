// src/components/dashboard/ClientFeedback.jsx
export default function ClientFeedback() {
  return (
    <>
      <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Client Feedback
      </h2>
      <div className="flex flex-col gap-8 overflow-x-hidden bg-white p-4">
        <div className="flex flex-col gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD9wDnU-D4AO1hzCwKFML-J4_2VnBuKFQqNBoge1oxVWD2fn9OVfa2lso-g5Ya-L0JS8fZ3tZMN7t4BxH-KezBw6sl93Q0kUTGa5N65v99qOGqm-aONtS7a2otPHCkgdU_6LVSkVAAfxIK99_BgYERoZdh5cH091xqDmQyYFh0mK6tTB4x58xwe3uIqRcSm6bCCaEj1RaC2LyNZJiQT9Y5ZLuvgKyWRs_fORmyHQM3h4la_wwDbI5NqPSfttKrSpiLiqiuGRrkAN7A")',
              }}
            ></div>
            <div className="flex-1">
              <p className="text-[#111418] text-base font-medium leading-normal">
                Chloe Green
              </p>
              <p className="text-[#60758a] text-sm font-normal leading-normal">
                July 15, 2024
              </p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="text-[#111418]"
                data-icon="Star"
                data-size="20px"
                data-weight="fill"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                </svg>
              </div>
            ))}
          </div>
          <p className="text-[#111418] text-base font-normal leading-normal">
            Sarah is an amazing stylist! She really listened to what I wanted
            and delivered a fantastic result. My hair looks and feels great.
          </p>
          <div className="flex gap-9 text-[#60758a]">
            <button className="flex items-center gap-2">
              <div
                className="text-inherit"
                data-icon="ThumbsUp"
                data-size="20px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path>
                </svg>
              </div>
              <p className="text-inherit">2</p>
            </button>
            <button className="flex items-center gap-2">
              <div
                className="text-inherit"
                data-icon="ThumbsDown"
                data-size="20px"
                data-weight="regular"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20px"
                  height="20px"
                  fill="currentColor"
                  viewBox="0 0 256 256"
                >
                  <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"></path>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
