import { useState } from "react";
import Modal from "@/components/common/Modal";
import StylistForm from "@/components/Stylists/StylistForm";
import StylistTable from "@/components/Stylists/StylistTable";
import ServiceAssignment from "@/components/Stylists/ServiceAssignment";
import StylistService from "@/services/StylistService";
import toast from "react-hot-toast";

export default function StylistsView({
  state,
  formData,
  errors,
  isSubmitting,
  user,
  handleInputChange,
  handleSubmit,
  handleEditSubmit,
  handleEditClick,
  handleSearchChange,
  toggleModal,
  toggleEditModal,
}) {
  const {
    search,
    stylists,
    loading,
    error,
    isModalOpen,
    isEditModalOpen,
    companyServices,
  } = state;

  // Add state for service assignment
  const [assigningServices, setAssigningServices] = useState(false);
  const [selectedStylistForServices, setSelectedStylistForServices] =
    useState(null);
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  // Handle service assignment click
  const onAssignServicesClick = async (stylist) => {
    try {
      // console.log("Assign services clicked for stylist:", stylist);

      if (!stylist || !stylist.id) {
        toast.error("Invalid stylist selected");
        return;
      }

      setAssignmentLoading(true);
      // Fetch the stylist with their services populated - use stylist.id
      const response = await StylistService.getStylistWithServices(stylist.id);
      setSelectedStylistForServices(response.data);
      setAssigningServices(true);
    } catch (err) {
      console.error("Error loading stylist services:", err);
      toast.error(
        err.response?.data?.message || "Failed to load stylist services"
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Handle service assignment
  const handleAssignServices = async (serviceIds) => {
    try {
      setAssignmentLoading(true);
      await StylistService.assignServices(
        selectedStylistForServices._id,
        serviceIds
      );
      toast.success("Services assigned successfully");
      setAssigningServices(false);
      setSelectedStylistForServices(null);

      // Refresh the stylists list
      // You might want to add a refresh function to your state management
      window.location.reload(); // Simple refresh for now
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to assign services");
      console.error(err);
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Cancel service assignment
  const onCancelAssignServices = () => {
    setAssigningServices(false);
    setSelectedStylistForServices(null);
  };

  if (loading) {
    return <LoadingView message="Loading stylists..." />;
  }

  if (error) {
    return <ErrorView message={error} />;
  }

  return (
    <div className="layout-content-container flex flex-col flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4">
        <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">
          Stylists
        </p>
        {user?.role === "superadmin" && (
          <button
            onClick={toggleModal}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal"
          >
            <span className="truncate">Add Stylist</span>
          </button>
        )}
      </div>

      {/* Search */}
      <SearchInput value={search} onChange={handleSearchChange} />

      {/* Add Stylist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={toggleModal}
        title="Register New Stylist"
      >
        <StylistForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          companyServices={companyServices}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          onCancel={toggleModal}
          isEditMode={false}
        />
      </Modal>

      {/* Edit Stylist Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={toggleEditModal}
        title="Edit Stylist"
      >
        <StylistForm
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          companyServices={companyServices}
          handleInputChange={handleInputChange}
          handleSubmit={handleEditSubmit}
          onCancel={toggleEditModal}
          isEditMode={true}
        />
      </Modal>

      {/* Assign service to stylist Modal */}
      <Modal
        isOpen={assigningServices}
        onClose={onCancelAssignServices}
        title="Assign Services"
      >
        <ServiceAssignment
          services={companyServices}
          selectedStylist={selectedStylistForServices}
          stylistName={selectedStylistForServices?.name}
          onAssign={handleAssignServices}
          onCancel={onCancelAssignServices}
          isSubmitting={assignmentLoading}
        />
      </Modal>

      {/* Table */}
      <StylistTable
        stylists={stylists}
        search={search}
        onEditClick={handleEditClick}
        onAssignServicesClick={onAssignServicesClick}
        userRole={user?.role}
      />
    </div>
  );
}
function LoadingView({ message }) {
  return (
    <div className="layout-content-container flex flex-col flex-1">
      <div className="flex items-center justify-center h-full">
        <p>{message}</p>
      </div>
    </div>
  );
}

function ErrorView({ message }) {
  return (
    <div className="layout-content-container flex flex-col flex-1">
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{message}</p>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange }) {
  return (
    <div className="px-4 py-3  ">
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
            value={value}
            onChange={onChange}
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f5] focus:border-none h-full placeholder:text-[#60758a] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
          />
        </div>
      </label>
    </div>
  );
}
