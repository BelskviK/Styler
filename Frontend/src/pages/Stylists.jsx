import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import StylistsView from "@/components/Stylists/StylistsView";
import StylistService from "@/services/StylistService";

export default function Stylists() {
  const [state, setState] = useState({
    search: "",
    stylists: [],
    loading: true,
    error: null,
    isModalOpen: false,
    isEditModalOpen: false,
    editingStylist: null,
    companyServices: [],
    submitSuccess: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "styler",
    services: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assigningServices, setAssigningServices] = useState(false);
  const [selectedStylistForServices, setSelectedStylistForServices] =
    useState(null);

  const { user } = useAuth();

  // Fetch stylists and company services
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.company) {
          const [stylistsResponse, servicesResponse] = await Promise.all([
            StylistService.getAll(),
            StylistService.getCompanyServices(user.company),
          ]);

          setState((prev) => ({
            ...prev,
            stylists: stylistsResponse.data,
            companyServices: servicesResponse.data,
            loading: false,
          }));
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setState((prev) => ({
          ...prev,
          error: "Failed to load data",
          loading: false,
        }));
      }
    };

    fetchData();
  }, [user, state.submitSuccess]);

  // Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Email is invalid";
    if (!state.editingStylist && !formData.password)
      newErrors.password = "Password is required";
    else if (formData.password && formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await StylistService.register({
        ...formData,
        company: user.company,
      });

      setState((prev) => ({
        ...prev,
        isModalOpen: false,
        submitSuccess: !prev.submitSuccess,
      }));
      resetForm();
    } catch (err) {
      console.error("Registration error:", err);
      setErrors((prev) => ({
        ...prev,
        server: err.response?.data?.message || "Registration failed",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit stylist
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await Promise.all([
        StylistService.update(state.editingStylist._id, {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
        }),
        StylistService.assignServices(
          state.editingStylist._id,
          formData.services
        ),
      ]);

      setState((prev) => ({
        ...prev,
        isEditModalOpen: false,
        editingStylist: null,
        submitSuccess: !prev.submitSuccess,
      }));
      resetForm();
    } catch (err) {
      console.error("Update error:", err);
      setErrors((prev) => ({
        ...prev,
        server: err.response?.data?.message || "Update failed",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (stylist) => {
    setState((prev) => ({
      ...prev,
      editingStylist: stylist,
      isEditModalOpen: true,
    }));
    setFormData({
      name: stylist.name,
      email: stylist.email,
      password: "",
      role: stylist.role,
      services:
        stylist.services?.map((service) => service._id || service) || [],
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "styler",
      services: [],
    });
    setErrors({});
  };

  const handleSearchChange = (e) => {
    setState((prev) => ({ ...prev, search: e.target.value }));
  };

  const toggleModal = () => {
    setState((prev) => ({ ...prev, isModalOpen: !prev.isModalOpen }));
  };

  const toggleEditModal = () => {
    setState((prev) => ({
      ...prev,
      isEditModalOpen: !prev.isEditModalOpen,
      editingStylist: prev.isEditModalOpen ? null : prev.editingStylist,
    }));
  };

  // Assign services
  const handleAssignServices = async (serviceIds) => {
    setIsSubmitting(true);
    try {
      if (!selectedStylistForServices?._id)
        throw new Error("Please select a stylist first");
      if (!serviceIds || serviceIds.length === 0)
        throw new Error("Please select at least one service");

      await StylistService.assignServices(
        selectedStylistForServices._id,
        serviceIds
      );

      setState((prev) => ({
        ...prev,
        submitSuccess: !prev.submitSuccess,
        error: null,
        stylists: prev.stylists.map((stylist) =>
          stylist._id === selectedStylistForServices._id
            ? { ...stylist, services: serviceIds }
            : stylist
        ),
      }));

      setAssigningServices(false);
    } catch (err) {
      console.error("Service assignment error:", err);
      setErrors((prev) => ({
        ...prev,
        server: err.response?.data?.message || err.message,
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StylistsView
      state={state}
      formData={formData}
      errors={errors}
      isSubmitting={isSubmitting}
      user={user}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleEditSubmit={handleEditSubmit}
      handleEditClick={handleEditClick}
      handleSearchChange={handleSearchChange}
      toggleModal={toggleModal}
      toggleEditModal={toggleEditModal}
      assigningServices={assigningServices}
      selectedStylistForServices={selectedStylistForServices}
      handleAssignServices={handleAssignServices}
      onAssignServicesClick={async (stylist) => {
        const stylistId = stylist._id || stylist.id;
        if (!stylistId) {
          console.error("Stylist ID is missing", stylist);
          return;
        }

        try {
          const res = await StylistService.getWithServices(stylistId);
          // Make sure this function calls: GET `/api/users/${id}` directly
          setSelectedStylistForServices(res.data);
          setAssigningServices(true);
        } catch (err) {
          console.error("Error fetching stylist services:", err);
        }
      }}
      onCancelAssignServices={() => setAssigningServices(false)}
    />
  );
}
