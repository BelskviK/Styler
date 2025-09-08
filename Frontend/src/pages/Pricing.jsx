// src/pages/Pricing.jsx
export default function Pricing() {
  return (
    <div className="px-40   flex flex-1 justify-center py-5">
      <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">
              Choose the plan that's right for you
            </p>
            <p className="text-[#49739c] text-sm font-normal leading-normal">
              Whether you're just starting out or scaling your business, we've
              got a plan to help you succeed.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(228px,1fr))] gap-2.5 px-4 py-3 @3xl:grid-cols-4">
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141c] text-base font-bold leading-tight">
                Basic
              </h1>
              <p className="flex items-baseline gap-1 text-[#0d141c]">
                <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
                  $29
                </span>
                <span className="text-[#0d141c] text-base font-bold leading-tight">
                  /month
                </span>
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Choose Basic</span>
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                1 Stylist
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Basic Reporting
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Limited Bookings
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141c] text-base font-bold leading-tight">
                Pro
              </h1>
              <p className="flex items-baseline gap-1 text-[#0d141c]">
                <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
                  $49
                </span>
                <span className="text-[#0d141c] text-base font-bold leading-tight">
                  /month
                </span>
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Choose Pro</span>
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Up to 5 Stylists
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Advanced Reporting
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Unlimited Bookings
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Priority Support
              </div>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-lg border border-solid border-[#cedbe8] bg-slate-50 p-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#0d141c] text-base font-bold leading-tight">
                Premium
              </h1>
              <p className="flex items-baseline gap-1 text-[#0d141c]">
                <span className="text-[#0d141c] text-4xl font-black leading-tight tracking-[-0.033em]">
                  $99
                </span>
                <span className="text-[#0d141c] text-base font-bold leading-tight">
                  /month
                </span>
              </p>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#e7edf4] text-[#0d141c] text-sm font-bold leading-normal tracking-[0.015em]">
              <span className="truncate">Choose Premium</span>
            </button>
            <div className="flex flex-col gap-2">
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Unlimited Stylists
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Custom Reporting
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Unlimited Bookings
              </div>
              <div className="text-[13px] font-normal leading-normal flex gap-3 text-[#0d141c]">
                <div
                  className="text-[#0d141c]"
                  data-icon="Check"
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
                    <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                  </svg>
                </div>
                Dedicated Account Manager
              </div>
            </div>
          </div>
        </div>
        <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col p-4 gap-3">
          <details
            className="flex flex-col rounded-lg border border-[#cedbe8] bg-slate-50 px-[15px] py-[7px] group"
            open=""
          >
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-[#0d141c] text-sm font-medium leading-normal">
                What payment methods do you accept?
              </p>
              <div
                className="text-[#0d141c] group-open:rotate-180"
                data-icon="CaretDown"
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
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </summary>
            <p className="text-[#49739c] text-sm font-normal leading-normal pb-2">
              We accept all major credit cards, including Visa, MasterCard,
              American Express, and Discover. Payments are processed securely
              through our payment gateway.
            </p>
          </details>
          <details className="flex flex-col rounded-lg border border-[#cedbe8] bg-slate-50 px-[15px] py-[7px] group">
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-[#0d141c] text-sm font-medium leading-normal">
                Can I change my plan later?
              </p>
              <div
                className="text-[#0d141c] group-open:rotate-180"
                data-icon="CaretDown"
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
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </summary>
            <p className="text-[#49739c] text-sm font-normal leading-normal pb-2">
              We accept all major credit cards, including Visa, MasterCard,
              American Express, and Discover. Payments are processed securely
              through our payment gateway.
            </p>
          </details>
          <details className="flex flex-col rounded-lg border border-[#cedbe8] bg-slate-50 px-[15px] py-[7px] group">
            <summary className="flex cursor-pointer items-center justify-between gap-6 py-2">
              <p className="text-[#0d141c] text-sm font-medium leading-normal">
                Is there a free trial available?
              </p>
              <div
                className="text-[#0d141c] group-open:rotate-180"
                data-icon="CaretDown"
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
                  <path d="M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,53.66,90.34L128,164.69l74.34-74.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </summary>
            <p className="text-[#49739c] text-sm font-normal leading-normal pb-2">
              We accept all major credit cards, including Visa, MasterCard,
              American Express, and Discover. Payments are processed securely
              through our payment gateway.
            </p>
          </details>
          <footer className="flex justify-center">
            <div className="flex max-w-[960px] flex-1 flex-col">
              <footer className="flex flex-col gap-6 px-5 py-10 text-center @container">
                <div className="flex flex-wrap items-center justify-center gap-6 @[480px]:flex-row @[480px]:justify-around">
                  <a
                    className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Terms of Service
                  </a>
                  <a
                    className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Privacy Policy
                  </a>
                  <a
                    className="text-[#49739c] text-base font-normal leading-normal min-w-40"
                    href="#"
                  >
                    Contact Us
                  </a>
                </div>
                <p className="text-[#49739c] text-base font-normal leading-normal">
                  © {new Date().getFullYear()} StyleSeat. All rights reserved.
                </p>
              </footer>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
