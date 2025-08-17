import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Modal from "@/components/common/Modal";

export default function Stylists() {
  const [search, setSearch] = useState("");
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "styler",
    services: [],
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [editingStylist, setEditingStylist] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [companyServices, setCompanyServices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.company) {
          // Fetch stylists
          const stylistsResponse = await axios.get(
            "http://localhost:5000/api/users",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setStylists(stylistsResponse.data);

          // Fetch company services
          const servicesResponse = await axios.get(
            `http://localhost:5000/api/services?companyId=${user.company}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCompanyServices(servicesResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, user, submitSuccess]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleServiceToggle = (serviceId) => {
    setFormData((prev) => {
      if (prev.services.includes(serviceId)) {
        return {
          ...prev,
          services: prev.services.filter((id) => id !== serviceId),
        };
      } else {
        return {
          ...prev,
          services: [...prev.services, serviceId],
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!editingStylist && !formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          ...formData,
          company: user.company,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmitSuccess(true);
      setIsModalOpen(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "styler",
        services: [],
      });
    } catch (err) {
      console.error("Registration error:", err);
      setErrors({
        ...errors,
        server: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (stylist) => {
    setEditingStylist(stylist);
    setFormData({
      name: stylist.name,
      email: stylist.email,
      password: "",
      role: stylist.role,
      services:
        stylist.services?.map((service) => service._id || service) || [],
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await axios.put(
        `http://localhost:5000/api/users/${editingStylist._id}`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password || undefined,
          role: formData.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await axios.put(
        `http://localhost:5000/api/services/assign/${editingStylist._id}`,
        { serviceIds: formData.services },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitSuccess((prev) => !prev);
      setIsEditModalOpen(false);
      setEditingStylist(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "styler",
        services: [],
      });
    } catch (err) {
      console.error("Update error:", err);
      setErrors({
        ...errors,
        server: err.response?.data?.message || "Update failed",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStylists = stylists.filter((stylist) =>
    stylist.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="layout-content-container flex flex-col flex-1">
        <div className="flex items-center justify-center h-full">
          <p>Loading stylists...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="layout-content-container flex flex-col flex-1">
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="layout-content-container flex flex-col flex-1">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Stylists
        </p>
        {user?.role === "superadmin" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal"
          >
            <span className="truncate">Add Stylist</span>
          </button>
        )}
      </div>

      {/* Add Stylist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Stylist"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.server && (
            <div className="text-red-500 text-sm">{errors.server}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="styler">Stylist</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services
            </label>
            {companyServices.length === 0 ? (
              <p className="text-sm text-gray-500">
                No services found for your company
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {companyServices.map((service) => (
                  <div key={service._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`service-${service._id}`}
                      checked={formData.services.includes(service._id)}
                      onChange={() => handleServiceToggle(service._id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`service-${service._id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Stylist Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingStylist(null);
        }}
        title="Edit Stylist"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {errors.server && (
            <div className="text-red-500 text-sm">{errors.server}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
            {errors.email && (
              <span className="text-red-500 text-xs">{errors.email}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password (leave blank to keep current)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="Leave blank to keep current password"
            />
            {errors.password && (
              <span className="text-red-500 text-xs">{errors.password}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="styler">Stylist</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services
            </label>
            {companyServices.length === 0 ? (
              <p className="text-sm text-gray-500">
                No services found for your company
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {companyServices.map((service) => (
                  <div key={service._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`edit-service-${service._id}`}
                      checked={formData.services.includes(service._id)}
                      onChange={() => handleServiceToggle(service._id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label
                      htmlFor={`edit-service-${service._id}`}
                      className="ml-2 text-sm text-gray-700"
                    >
                      {service.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingStylist(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Search */}
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
              placeholder="Search stylists"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-full placeholder:text-[#60758a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
            />
          </div>
        </label>
      </div>

      {/* Table */}
      <div className="px-4 py-3 @container">
        {filteredStylists.length === 0 ? (
          <div className="text-center py-8">
            <p>No stylists found</p>
          </div>
        ) : (
          <div className="flex overflow-hidden rounded-lg border border-[#dbe0e6] bg-white">
            <table className="flex-1">
              <thead>
                <tr className="bg-white">
                  <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Expertise
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Schedule
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-[400px] text-sm font-medium leading-normal">
                    Reviews
                  </th>
                  <th className="px-4 py-3 text-left text-[#111418] w-60 text-[#60758a] text-sm font-medium leading-normal">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStylists.map((stylist) => (
                  <tr key={stylist._id} className="border-t border-t-[#dbe0e6]">
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#111418] text-sm font-normal leading-normal">
                      {stylist.name}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {stylist.expertise || "N/A"}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {stylist.schedule || "N/A"}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-[400px] text-[#60758a] text-sm font-normal leading-normal">
                      {stylist.reviews || "N/A"}
                    </td>
                    <td className="h-[72px] px-4 py-2 w-60 text-[#60758a] text-sm font-bold leading-normal tracking-[0.015em] cursor-pointer">
                      <span onClick={() => handleEditClick(stylist)}>Edit</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
