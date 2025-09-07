// src/components/Appointments/AppointmentForm.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/useAuth";
import AppointmentService from "@/services/AppointmentService";
import CompanyService from "@/services/CompanyService";
import UserService from "@/services/UserService";
import toast from "react-hot-toast";

// Form Components
function FormSelect({
  label,
  name,
  value,
  onChange,
  error,
  options,
  optionValue,
  optionLabel,
  optionExtra,
  loading = false,
  disabled = false,
  placeholder = `Select ${label}`,
}) {
  const getOptionKey = (option, index) => {
    const possibleKeys = [optionValue, "id", "_id", "value", "key"];
    for (const key of possibleKeys) {
      if (option[key]) {
        return option[key];
      }
    }
    return `option-${index}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        <option value="">{loading ? "Loading..." : placeholder}</option>
        {options.map((option, index) => (
          <option key={getOptionKey(option, index)} value={option[optionValue]}>
            {option[optionLabel]}
            {optionExtra && optionExtra(option)}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {loading && <p className="text-gray-500 text-xs mt-1">Loading...</p>}
    </div>
  );
}

function FormInput({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  ...props
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  rows = 3,
  ...props
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

// Main Component
export default function AppointmentForm({
  onSuccess,
  onCancel,
  isSubmitting = false,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    companyId: user?.company || "",
    stylistId: "",
    serviceId: "",
    customerName: "",
    customerPhone: "",
    date: "",
    startTime: "",
    notes: "",
  });
  const [errors, setErrors] = useState({});
  const [companies, setCompanies] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState({
    companies: false,
    stylists: false,
    services: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Function to get time 3 hours from now in HH:MM format
  const getTimeIn3Hours = () => {
    const now = new Date();
    now.setHours(now.getHours() + 3);

    // Round to nearest 15 minutes
    const minutes = Math.ceil(now.getMinutes() / 15) * 15;
    now.setMinutes(minutes);

    const hours = String(now.getHours()).padStart(2, "0");
    const mins = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${mins}`;
  };

  useEffect(() => {
    console.log("👤 Current user role:", user?.role);
    console.log("👤 Current user company:", user?.company);

    // Set default date and time
    const today = getTodayDate();
    const timeIn3Hours = getTimeIn3Hours();

    setFormData((prev) => ({
      ...prev,
      date: today,
      startTime: timeIn3Hours,
    }));

    if (user?.role === "superadmin") {
      loadCompanies();
    } else if (user?.company) {
      // For non-superadmin, immediately set company and load stylists
      setFormData((prev) => ({ ...prev, companyId: user.company }));
      loadStylists(user.company);
    }
  }, [user]);

  useEffect(() => {
    if (formData.stylistId && formData.companyId) {
      if (
        formData.stylistId.length === 24 &&
        /^[a-fA-F0-9]+$/.test(formData.stylistId)
      ) {
        loadServices(formData.stylistId);
      }
    } else {
      setServices([]);
      setFormData((prev) => ({ ...prev, serviceId: "" }));
    }
  }, [formData.stylistId, formData.companyId]);

  useEffect(() => {
    if (formData.serviceId) {
      const service = services.find((s) => s._id === formData.serviceId);
      setSelectedService(service);
    } else {
      setSelectedService(null);
    }
  }, [formData.serviceId, services]);

  const calculateEndTime = useCallback(() => {
    if (!formData.startTime || !selectedService) return;

    const [hours, minutes] = formData.startTime.split(":").map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes);

    const endDate = new Date(
      startDate.getTime() + selectedService.duration * 60000
    );
    const endTimeStr = endDate.toTimeString().slice(0, 5);
    setEndTime(endTimeStr);
  }, [formData.startTime, selectedService]);

  useEffect(() => {
    calculateEndTime();
  }, [calculateEndTime]);

  const loadCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await CompanyService.getAll();
      setCompanies(response.data);

      // After companies load, pre-select the user's company if they have one
      if (user?.company) {
        setFormData((prev) => ({ ...prev, companyId: user.company }));
        loadStylists(user.company);
      }
    } catch {
      toast.error("Failed to load companies");
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  const loadStylists = async (companyId) => {
    try {
      console.log("👥 Loading stylists for company ID:", companyId);
      setLoading((prev) => ({ ...prev, stylists: true }));
      setStylists([]);
      setFormData((prev) => ({ ...prev, stylistId: "", serviceId: "" }));

      let response;

      if (user?.role === "superadmin") {
        if (
          !companyId ||
          companyId.length !== 24 ||
          !/^[a-fA-F0-9]+$/.test(companyId)
        ) {
          console.error("Invalid company ID:", companyId);
          toast.error("Please select a valid company");
          return;
        }
        response = await UserService.getCompanyStylists(companyId);
      } else {
        response = await UserService.getCompanyUsers();
      }

      console.log("✅ Stylists loaded:", response.data);
      setStylists(response.data);
    } catch (err) {
      console.error("❌ Failed to load stylists:", err);
      toast.error("Failed to load stylists");
    } finally {
      setLoading((prev) => ({ ...prev, stylists: false }));
    }
  };

  const loadServices = async (stylistId) => {
    try {
      setLoading((prev) => ({ ...prev, services: true }));
      setServices([]);
      setFormData((prev) => ({ ...prev, serviceId: "" }));

      console.log("🔍 Loading services for stylist ID:", stylistId);

      const stylistResponse = await UserService.getStylistWithServices(
        stylistId
      );
      const stylistServices = stylistResponse.data.services || [];
      console.log("📋 Services loaded:", stylistServices);

      setServices(stylistServices);
    } catch (err) {
      console.error("❌ Failed to load services:", err);
      toast.error("Failed to load services");
    } finally {
      setLoading((prev) => ({ ...prev, services: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`📝 Field changed: ${name} = ${value}`);

    setFormData((prev) => {
      const newFormData = { ...prev, [name]: value };

      if (name === "companyId") {
        newFormData.stylistId = "";
        newFormData.serviceId = "";
        if (value) loadStylists(value);
      } else if (name === "stylistId") {
        newFormData.serviceId = "";
      }

      return newFormData;
    });

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    console.log("🔍 Validating form with data:", formData);
    const newErrors = {};

    if (!formData.companyId) newErrors.companyId = "Company is required";
    if (!formData.stylistId) newErrors.stylistId = "Stylist is required";
    if (!formData.serviceId) newErrors.serviceId = "Service is required";
    if (!formData.customerName)
      newErrors.customerName = "Customer name is required";
    if (!formData.customerPhone)
      newErrors.customerPhone = "Customer phone is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";

    console.log("❌ Validation errors:", newErrors);
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("✅ Form is valid:", isValid);
    return isValid;
  };

  const handleSubmit = async (e) => {
    console.log("🚀 Form submit triggered");
    e.preventDefault();
    e.stopPropagation();

    // Prevent double submission
    if (submitting || isSubmitting) {
      console.log("⏸️ Already submitting, preventing double submission");
      return;
    }

    console.log("📋 Current form data:", formData);
    console.log("⏰ End time:", endTime);
    console.log("🎯 Selected service:", selectedService);

    if (!validateForm()) {
      console.log("❌ Validation failed, stopping submission");
      return;
    }

    try {
      console.log("📤 Starting appointment creation...");
      setSubmitting(true);

      const appointmentData = {
        stylistId: formData.stylistId,
        serviceId: formData.serviceId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: endTime,
        notes: formData.notes,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
      };

      console.log("📦 Final appointment data being sent:", appointmentData);

      // Check if AppointmentService.create exists and is a function
      if (
        !AppointmentService ||
        typeof AppointmentService.create !== "function"
      ) {
        throw new Error("AppointmentService.create is not available");
      }

      const response = await AppointmentService.create(appointmentData);
      console.log("✅ Appointment created successfully:", response);

      toast.success("Appointment created successfully");

      // Check if onSuccess is a function before calling
      if (typeof onSuccess === "function") {
        onSuccess(response.data);
      } else {
        console.warn("⚠️ onSuccess is not a function:", onSuccess);
      }
    } catch (err) {
      console.error("❌ Appointment creation failed:", err);
      console.error("📊 Error response:", err.response);
      console.error("📊 Error message:", err.message);

      let errorMessage = "Failed to create appointment";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Selection (only for superadmin) */}
      {user?.role === "superadmin" ? (
        <FormSelect
          label="Company"
          name="companyId"
          value={formData.companyId}
          onChange={handleInputChange}
          error={errors.companyId}
          options={companies}
          optionValue="_id"
          optionLabel="name"
          loading={loading.companies}
          disabled={loading.companies}
        />
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
          <input
            type="text"
            value={user?.companyName || "Your Company"}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
          />
          <input type="hidden" name="companyId" value={formData.companyId} />
        </div>
      )}

      {/* Stylist Selection */}
      <FormSelect
        label="Stylist"
        name="stylistId"
        value={formData.stylistId}
        onChange={handleInputChange}
        error={errors.stylistId}
        options={stylists}
        optionValue="_id"
        optionLabel="name"
        loading={loading.stylists}
        disabled={!formData.companyId || loading.stylists}
        placeholder={
          !formData.companyId ? "Select a company first" : "Select stylist"
        }
      />

      {/* Service Selection */}
      <FormSelect
        label="Service"
        name="serviceId"
        value={formData.serviceId}
        onChange={handleInputChange}
        error={errors.serviceId}
        options={services}
        optionValue="_id"
        optionLabel="name"
        loading={loading.services}
        disabled={!formData.stylistId || loading.services}
        placeholder={
          !formData.stylistId ? "Select a stylist first" : "Select service"
        }
      />

      {selectedService && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Duration: {selectedService.duration} minutes
            {endTime && ` • Ends at: ${endTime}`}
          </p>
        </div>
      )}

      {/* Customer fields - only show for admin/styler/superadmin users */}
      {(user?.role === "admin" ||
        user?.role === "styler" ||
        user?.role === "superadmin") && (
        <>
          <FormInput
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            error={errors.customerName}
            required
          />

          <FormInput
            label="Customer Phone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            error={errors.customerPhone}
            type="tel"
            required
          />
        </>
      )}

      <FormInput
        label="Date"
        name="date"
        value={formData.date}
        onChange={handleInputChange}
        error={errors.date}
        type="date"
        min={getTodayDate()}
      />

      <FormInput
        label="Start Time"
        name="startTime"
        value={formData.startTime}
        onChange={handleInputChange}
        error={errors.startTime}
        type="time"
      />

      <FormTextarea
        label="Notes (Optional)"
        name="notes"
        value={formData.notes}
        onChange={handleInputChange}
        rows={3}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting || isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting || isSubmitting ? "Creating..." : "Create Appointment"}
        </button>
      </div>
    </form>
  );
}
