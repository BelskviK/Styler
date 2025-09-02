import { useState, useEffect } from "react";

export default function ServiceAssignment({
  services,
  selectedStylist, // stylist object (with .services pre-populated from API)
  stylistName,
  onAssign,
  onCancel,
  isSubmitting,
}) {
  const [localSelected, setLocalSelected] = useState([]);
  const [error, setError] = useState(null);

  // Prefill assigned services when modal opens or stylist changes
  useEffect(() => {
    if (selectedStylist?.services) {
      setLocalSelected(selectedStylist.services.map((s) => s._id));
    } else {
      setLocalSelected([]);
    }
    setError(null);
  }, [selectedStylist]);

  const handleToggle = (serviceId) => {
    setLocalSelected((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleAssign = () => {
    try {
      if (!selectedStylist) {
        throw new Error("No stylist selected - please try again");
      }
      if (localSelected.length === 0) {
        throw new Error("Please select at least one service");
      }
      onAssign(localSelected);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {selectedStylist
          ? `Assign Services to ${stylistName}`
          : "Preparing assignment..."}
      </h3>

      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-50 rounded">
          {error}
        </div>
      )}

      {services.length === 0 ? (
        <p className="text-sm text-gray-500">No services available</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2">
          {services.map((service) => (
            <div key={service._id} className="flex items-center">
              <input
                type="checkbox"
                checked={localSelected.includes(service._id)}
                onChange={() => handleToggle(service._id)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={!selectedStylist || isSubmitting}
              />
              <label className="ml-2 text-sm text-gray-700">
                {service.name}{" "}
                <span className="text-xs text-gray-400">
                  ({service.duration}min • ${service.price})
                </span>
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleAssign}
          disabled={
            !selectedStylist || localSelected.length === 0 || isSubmitting
          }
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? "Assigning..." : "Assign Services"}
        </button>
      </div>
    </div>
  );
}
