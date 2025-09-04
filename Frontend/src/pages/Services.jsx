// Frontend/src/pages/Services.jsx
import { useState, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import Modal from "@/components/common/Modal";
import api from "@/services/api";
import toast from "react-hot-toast";

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
        const response = await api.get("/services");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (form._id) {
        // Update existing service
        const response = await api.put(`/services/${form._id}`, {
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
        const response = await api.post("/services", {
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
      await api.delete(`/services/${serviceToDelete._id}`);
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
        <label className="flex flex-col min-w-40 h-12 w-full">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
            <div className="text-[#60758a] flex border-none bg-[#f0f2f5] items-center justify-center pl-4 rounded-l-lg border-r-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-full placeholder:text-[#60758a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
        </label>
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
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-[#111418]">
                        {service.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#60758a]">
                        {service.description}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#60758a]">
                        {service.duration}
                      </td>
                      <td className="px-4 py-4 text-sm text-[#60758a]">
                        ${service.price.toFixed(2)}
                      </td>
                      {user?.role === "superadmin" && (
                        <td className="px-4 py-4 text-sm text-[#60758a] space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={user?.role === "superadmin" ? 5 : 4}
                      className="px-4 py-4 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No matching services found"
                        : "No services available"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={form._id ? "Edit Service" : "Add New Service"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Name*
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter service name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Duration (minutes)*
              </label>
              <input
                type="number"
                name="duration"
                min="5"
                step="5"
                value={form.duration}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Price ($)*
              </label>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : form._id ? "Update" : "Save"}
            </button>
          </div>
        </form>
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
