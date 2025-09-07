// Frontend/src/pages/CompanyPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CompanyService from "@/services/CompanyService";
import UserService from "@/services/UserService";
import StylistSelector from "@/components/StylistSelector";
import DateTimePicker from "@/components/DateTimePicker";
import ServiceSelector from "@/components/ServiceSelector";

export default function CompanyPage() {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stylistsLoading, setStylistsLoading] = useState(true);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null); // Add selected service state
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // Convert URL-friendly name back to normal name
        const normalizedName = companyName
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // Fetch company by name or ID
        const response = await CompanyService.getPublicBarbershops();
        const foundCompany = response.data.find(
          (comp) => comp.name.toLowerCase() === normalizedName.toLowerCase()
        );

        if (foundCompany) {
          setCompany(foundCompany);
          // Fetch stylists for this specific company
          await fetchCompanyStylists(foundCompany.id || foundCompany._id);
        } else {
          setError("Company not found");
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company information");
      } finally {
        setLoading(false);
      }
    };

    const fetchCompanyStylists = async (companyId) => {
      try {
        setStylistsLoading(true);
        const response = await UserService.getCompanyStylists(companyId);
        const stylistsWithServices = response.data || [];
        console.log("Fetched stylists:", stylistsWithServices);
        setStylists(stylistsWithServices);
      } catch (err) {
        console.error("Error fetching stylists:", err);
        setStylists([]);
      } finally {
        setStylistsLoading(false);
      }
    };

    if (companyName) {
      fetchCompanyData();
    }
  }, [companyName]);

  const loadServices = async (stylistId) => {
    try {
      setServicesLoading(true);
      setServices([]);

      console.log("🔍 Loading services for stylist ID:", stylistId);

      const stylistResponse = await UserService.getStylistWithServices(
        stylistId
      );
      const stylistServices = stylistResponse.data.services || [];
      console.log("📋 Services loaded:", stylistServices);

      setServices(stylistServices);
    } catch (err) {
      console.error("❌ Failed to load services:", err);
      // Set empty services instead of showing error
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleStylistSelect = async (stylist) => {
    console.log("Selected stylist:", stylist);
    setSelectedStylist(stylist);
    setSelectedService(null); // Reset selected service when changing stylist

    // Check if services exist in the stylist object
    if (
      stylist?.services &&
      Array.isArray(stylist.services) &&
      stylist.services.length > 0
    ) {
      console.log("Services found in stylist data:", stylist.services);
      setServices(stylist.services);
    } else {
      // If not, fetch services separately using the same pattern as AppointmentForm
      console.log(
        "Fetching services separately for stylist:",
        stylist.id || stylist._id
      );
      await loadServices(stylist.id || stylist._id);
    }
  };

  const handleServiceSelect = (service) => {
    console.log("Selected service:", service);
    setSelectedService(service);
  };

  if (loading) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden"
        style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">
                StyleHub
              </h2>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="animate-pulse bg-gray-300 rounded-lg h-64 w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden"
        style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">
                StyleHub
              </h2>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div
        className="relative flex size-full min-h-screen flex-col bg-slate-50 overflow-x-hidden"
        style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
      >
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">
                StyleHub
              </h2>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
              <p className="text-gray-600">
                The company you're looking for doesn't exist.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="@container">
              <div className="@[480px]:px-4 @[480px]:py-3">
                <div
                  className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-slate-50 @[480px]:rounded-lg min-h-[218px]"
                  style={{
                    backgroundImage: `url(${
                      company.banner ||
                      "https://lh3.googleusercontent.com/aida-public/AB6AXuDl4kgoSaG5CThHM7mjDGYZStlmt0vQSEZS6aok_SdOfSg7rySrDNBizl3xKo8FXUskdyfrCCVumcLTsZEA71P1XWZDgnFJN_SOuo2YM9Gc4TyE0pxW4TFN_5JMMig4ScXovwQh-j1dXZQUp4xAS3AsDQza1wcRxI-igMNs-V2n-B8s8mWQS4HIFcktlneDnbskcc8cQmAsRBPHgZzP3ERGeIf-pFmqz-Pc6bfEYpA6ygtNW27UYgRfZSN2R3C9IzjJyrBWNuzTZzM"
                    })`,
                  }}
                ></div>
              </div>
            </div>

            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Select Stylist & Time
            </h2>

            <StylistSelector
              stylists={stylists}
              loading={stylistsLoading}
              onStylistSelect={handleStylistSelect}
              selectedStylist={selectedStylist}
            />
            <ServiceSelector
              services={services}
              selectedStylist={selectedStylist}
              loading={servicesLoading}
              onServiceSelect={handleServiceSelect}
              selectedService={selectedService} // Pass selected service down
            />
            <DateTimePicker />

            <div className="flex px-4 py-3 justify-center">
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#0d80f2] text-slate-50 text-base font-bold leading-normal tracking-[0.015em]">
                <span className="truncate">Book Appointment</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
