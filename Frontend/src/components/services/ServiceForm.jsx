// Frontend/src/pages/Services.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Modal from "@/components/common/Modal";
import toast from "react-hot-toast";
import ServiceService from "@/services/ServiceService";
import ServicesTable from "@/components/services/ServicesTable";
import ServiceForm from "@/components/services/ServiceForm";
import SearchBar from "@/components/services/SearchBar";

export default function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    duration: 30,
    price: 0,
    _id: null,
  });

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const response = await ServiceService.getAll();
        setServices(response.data);
        setFilteredServices(response.data);
      } catch (error) {
        toast.error("Failed to fetch services");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Filter services based on search term
  useEffect(() => {
    const results = services.filter(
      (service) =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredServices(results);
  }, [searchTerm, services]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "duration" || name === "price" ? Number(value) : value,
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchClear = () => {
    setSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (form._id) {
        // Update existing service
        const response = await ServiceService.update(form._id, {
          name: form.name,
          description: form.description,
          duration: form.duration,
          price: form.price,
        });
        const updatedServices = services.map((s) =>
          s._id === form._id ? response.data : s
        );
        setServices(updatedServices);
        toast.success("Service updated successfully");
      } else {
        // Create new service
        const response = await ServiceService.create({
          name: form.name,
          description: form.description,
          duration: form.duration,
          price: form.price,
        });

        const updatedServices = [...services, response.data];
        setServices(updatedServices);
        toast.success("Service created successfully");
      }

      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save service");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (service) => {
    setForm({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      _id: service._id,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      await ServiceService.delete(serviceToDelete._id);
      const updatedServices = services.filter(
        (s) => s._id !== serviceToDelete._id
      );
      setServices(updatedServices);
      toast.success("Service deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete service");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      duration: 30,
      price: 0,
      _id: null,
    });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="layout-content-container flex flex-col flex-1">
      {/* Header with Search and Add Service */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Services
        </p>
        {user?.role === "superadmin" && (
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal"
          >
            <span className="truncate">Add Services</span>
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <SearchBar
          searchTerm={searchTerm}
          onChange={handleSearchChange}
          onClear={handleSearchClear}
        />
      </div>

      {/* Table */}
      <div className="px-4 py-3">
        {isLoading && !services.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
            <table className="min-w-full divide-y divide-[#dbe0e6]">
              <thead className="bg-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#111418]">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#111418]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#111418]">
                    Duration (min)
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-[#111418]">
                    Price ($)
                  </th>
                  {user?.role === "superadmin" && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#60758a]">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dbe0e6]">
                <ServicesTable
                  services={filteredServices}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  searchTerm={searchTerm}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={form._id ? "Edit Service" : "Add New Service"}
      >
        <ServiceForm
          form={form}
          isLoading={isLoading}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleModalClose}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Delete"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete the service "{serviceToDelete?.name}
            "? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
