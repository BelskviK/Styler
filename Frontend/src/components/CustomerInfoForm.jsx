import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerInfoForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) {
  const auth = useAuth();
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (auth?.user) {
      const updatedFormData = {
        customerName: auth.user.name || "",
        customerPhone: auth.user.phone || "", // Prefill phone from user data
        customerEmail: auth.user.email || "",
        agreeToTerms: formData.agreeToTerms, // Keep existing terms agreement
      };

      setFormData(updatedFormData);
    }
  }, [auth]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Customer phone is required";
    } else if (
      !/^[+]?[1-9][\d]{0,15}$/.test(formData.customerPhone.replace(/\D/g, ""))
    ) {
      newErrors.customerPhone = "Please enter a valid phone number";
    }

    if (
      formData.customerEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)
    ) {
      newErrors.customerEmail = "Please enter a valid email address";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must accept the terms and conditions";
    }

    console.log("Validation errors:", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    } else {
      console.log("Form validation failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 mt-6 p-4 bg-white rounded-lg border border-gray-200"
    >
      <h3 className="text-lg font-bold text-[#0d141c] mb-4">
        Customer Information
      </h3>

      {/* Customer Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.customerName ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your full name"
        />
        {errors.customerName && (
          <p className="text-red-500 text-xs mt-1">{errors.customerName}</p>
        )}
      </div>

      {/* Customer Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.customerPhone ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your phone number"
        />
        {errors.customerPhone && (
          <p className="text-red-500 text-xs mt-1">{errors.customerPhone}</p>
        )}
      </div>

      {/* Customer Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address (Optional)
        </label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.customerEmail ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter your email address"
        />
        {errors.customerEmail && (
          <p className="text-red-500 text-xs mt-1">{errors.customerEmail}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="flex items-start space-x-2">
        <input
          type="checkbox"
          name="agreeToTerms"
          checked={formData.agreeToTerms}
          onChange={handleInputChange}
          className="mt-1"
        />
        <label className="text-sm text-gray-700">
          I give consent to the processing of my personal data and confirm that
          I have read and accepted the{" "}
          <a href="/privacy-policy" className="text-blue-600 hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/user-agreement" className="text-blue-600 hover:underline">
            User Agreement
          </a>
          . Please accept the above agreements to proceed.
        </label>
      </div>
      {errors.agreeToTerms && (
        <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </form>
  );
}
