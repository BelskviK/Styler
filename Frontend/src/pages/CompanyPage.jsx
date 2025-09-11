// Frontend/src/pages/CompanyPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CompanyService from "@/services/CompanyService";
import UserService from "@/services/UserService";
import PublicService from "@/services/PublicService"; // Add this import
import AppointmentService from "@/services/AppointmentService";
import StylistSelector from "@/components/StylistSelector";
import DateTimePicker from "@/components/DateTimePicker";
import ServiceSelector from "@/components/ServiceSelector";
import CustomerInfoForm from "@/components/CustomerInfoForm";
import toast from "react-hot-toast";

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
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDateTime, setSelectedDateTime] = useState({
    date: null,
    time: null,
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
          // Try to get user info to verify token is valid
          const userResponse = await UserService.getCurrentUser();
          const user = userResponse.data.user;
          setUserRole(user.role);
          setIsAuthenticated(true);
        } else {
          // Not authenticated, treat as customer
          setUserRole("customer");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        // If authentication fails, treat as non-authenticated customer
        setUserRole("customer");
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const normalizedName = companyName
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        const response = await CompanyService.getPublicBarbershops();
        const foundCompany = response.data.find(
          (comp) => comp.name.toLowerCase() === normalizedName.toLowerCase()
        );

        if (foundCompany) {
          setCompany(foundCompany);
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

        // Always use public route for non-authenticated users
        const response = await PublicService.getCompanyStylists(companyId);
        console.log("Stylists response:", response.data);
        const stylistsWithServices = response.data || [];
        setStylists(stylistsWithServices);
      } catch (err) {
        console.error("Error fetching stylists:", err);
        setStylists([]);
      } finally {
        setStylistsLoading(false);
      }
    };

    if (companyName && userRole !== null) {
      fetchCompanyData();
    }
  }, [companyName, userRole]);

  const loadServices = async (stylistId) => {
    try {
      setServicesLoading(true);
      setServices([]);

      // Use public route for all users to get services
      const response = await PublicService.getStylistServices(stylistId);
      const stylistServices = response.data || [];
      setServices(stylistServices);
    } catch (err) {
      console.error("❌ Failed to load services:", err);
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  };

  const handleStylistSelect = async (stylist) => {
    setSelectedStylist(stylist);
    setSelectedService(null);
    setSelectedDateTime({ date: null, time: null });
    setShowCustomerForm(false);

    if (
      stylist?.services &&
      Array.isArray(stylist.services) &&
      stylist.services.length > 0
    ) {
      setServices(stylist.services);
    } else {
      await loadServices(stylist.id || stylist._id);
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowCustomerForm(false);
  };

  const handleDateTimeSelect = ({ date, time }) => {
    setSelectedDateTime({ date, time });
    setShowCustomerForm(false);
  };

  const handleBookAppointment = () => {
    if (!selectedStylist) {
      toast.error("Please select a stylist");
      return;
    }
    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }
    if (!selectedDateTime.date) {
      toast.error("Please select a date");
      return;
    }
    if (!selectedDateTime.time) {
      toast.error("Please select a time");
      return;
    }

    setShowCustomerForm(true);
  };

  const handleCustomerFormCancel = () => {
    setShowCustomerForm(false);
  };

  const handleCustomerFormSubmit = async (customerData) => {
    try {
      setIsBooking(true);

      // Calculate end time based on service duration
      const [hours, minutes] = selectedDateTime.time.split(":").map(Number);
      const startDate = new Date(selectedDateTime.date);
      startDate.setHours(hours, minutes);

      const endDate = new Date(
        startDate.getTime() + selectedService.duration * 60000
      );
      const endTime = endDate.toTimeString().slice(0, 5);

      const appointmentData = {
        stylistId: selectedStylist.id || selectedStylist._id,
        serviceId: selectedService.id || selectedService._id,
        date: selectedDateTime.date.toISOString().split("T")[0],
        startTime: selectedDateTime.time,
        endTime: endTime,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail || "",
        notes: "",
      };

      console.log("Booking appointment:", appointmentData);

      // Use public service for non-authenticated users
      let response;
      if (isAuthenticated) {
        response = await AppointmentService.createAppointment(appointmentData);
      } else {
        response = await PublicService.createAppointment(appointmentData);
      }

      console.log("Appointment created:", response);

      toast.success("Appointment booked successfully!");

      // Reset form
      setSelectedService(null);
      setSelectedDateTime({ date: null, time: null });
      setShowCustomerForm(false);
    } catch (err) {
      console.error("Booking failed:", err);
      toast.error(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setIsBooking(false);
    }
  };
  const isBookingReady =
    selectedStylist &&
    selectedService &&
    selectedDateTime.date &&
    selectedDateTime.time;

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
              selectedService={selectedService}
            />

            <DateTimePicker onDateTimeSelect={handleDateTimeSelect} />

            {/* Customer Info Form */}
            {showCustomerForm && (
              <CustomerInfoForm
                onSubmit={handleCustomerFormSubmit}
                onCancel={handleCustomerFormCancel}
                isSubmitting={isBooking}
              />
            )}

            {/* Book Appointment Button */}
            {!showCustomerForm && (
              <div className="flex px-4 py-3 justify-center">
                <button
                  onClick={handleBookAppointment}
                  disabled={!isBookingReady}
                  className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 text-base font-bold leading-normal tracking-[0.015em] ${
                    isBookingReady
                      ? "bg-[#0d80f2] text-slate-50 hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <span className="truncate">Book Appointment</span>
                </button>
              </div>
            )}

            {/* Selection Summary */}
            {(selectedStylist || selectedService || selectedDateTime.date) && (
              <div className="px-4 py-2 bg-blue-50 rounded-lg mx-4 mt-4">
                <p className="text-sm text-blue-800">
                  Selected:{" "}
                  {selectedStylist && `Stylist: ${selectedStylist.name}`}
                  {selectedService && ` • Service: ${selectedService.name}`}
                  {selectedDateTime.date &&
                    ` • Date: ${selectedDateTime.date.toLocaleDateString()}`}
                  {selectedDateTime.time && ` • Time: ${selectedDateTime.time}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
