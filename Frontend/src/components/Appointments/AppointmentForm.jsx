// src/components/Appointments/AppointmentForm.jsx
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import AppointmentService from "@/services/AppointmentService";
import CompanyService from "@/services/CompanyService";
import toast from "react-hot-toast";

export default function AppointmentForm({
  onSuccess,
  onCancel,
  isSubmitting = false,
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    companyId: "",
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

  useEffect(() => {
    console.log("👤 Current user role:", user?.role);
    if (user?.role === "superadmin") {
      loadCompanies();
    } else if (user?.company) {
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
        response = await AppointmentService.getCompanyStylists(companyId);
      } else {
        response = await AppointmentService.getStylists();
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
      const stylistResponse = await AppointmentService.getStylistWithServices(
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
    const newErrors = {};

    if (!formData.companyId) newErrors.companyId = "Company is required";
    if (!formData.stylistId) newErrors.stylistId = "Stylist is required";
    if (!formData.serviceId) newErrors.serviceId = "Service is required";

    // Only require customer name/phone for admin/styler users creating appointments for others
    if (user?.role === "admin" || user?.role === "styler") {
      if (!formData.customerName)
        newErrors.customerName = "Customer name is required";
      if (!formData.customerPhone)
        newErrors.customerPhone = "Customer phone is required";
    }

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      console.log("📤 Submitting appointment data:", formData);

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

      console.log("📦 Final appointment data:", appointmentData);

      const response = await AppointmentService.create(appointmentData);
      console.log("✅ Appointment created successfully:", response.data);

      toast.success("Appointment created successfully");
      onSuccess();
    } catch (err) {
      console.error("❌ Appointment creation failed:", err);
      console.error("📊 Error details:", err.response?.data);
      toast.error(
        err.response?.data?.message || "Failed to create appointment"
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Company Selection (only for superadmin) */}
      {user?.role === "superadmin" && (
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
        optionExtra={(service) =>
          ` (${service.duration}min - $${service.price})`
        }
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

      {/* Only show customer fields for admin/styler users */}
      {(user?.role === "admin" || user?.role === "styler") && (
        <>
          <FormInput
            label="Customer Name"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            error={errors.customerName}
          />

          <FormInput
            label="Customer Phone"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleInputChange}
            error={errors.customerPhone}
            type="tel"
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
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Creating..." : "Create Appointment"}
        </button>
      </div>
    </form>
  );
}

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
