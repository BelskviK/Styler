import React from "react";

export default function ServiceSelector({
  services = [],
  selectedStylist,
  onServiceSelect,
  loading = false,
  selectedService,
}) {
  const getServiceId = (service) => service?.id || service?._id;

  const handleServiceClick = (service) => {
    if (!onServiceSelect) return;

    if (
      selectedService &&
      getServiceId(selectedService) === getServiceId(service)
    ) {
      onServiceSelect(null); // Deselect
    } else {
      onServiceSelect(service); // Select new one
    }
  };

  const defaultServiceImage =
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop";

  if (loading) {
    return (
      <section className="mt-6">
        <h2 className="text-[#0d141c] text-[22px] font-bold px-4 pb-3 pt-5">
          Services
        </h2>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-stretch justify-between gap-4 rounded-lg">
              <div className="flex flex-[2_2_0px] flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <div className="animate-pulse bg-gray-300 h-5 w-32 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-48 rounded"></div>
                </div>
                <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-lg"></div>
              </div>
              <div className="animate-pulse bg-gray-300 aspect-video rounded-lg flex-1"></div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  const showPlaceholder = services.length === 0 && !loading;

  return (
    <section className="mt-6">
      <h2 className="text-[#0d141c] text-[22px] font-bold px-4 pb-3 pt-5">
        Services
      </h2>

      {showPlaceholder ? (
        <div className="p-4 text-center text-gray-500">
          {selectedStylist ? (
            <p>No services available for {selectedStylist.name}.</p>
          ) : (
            <p>Please select a stylist first to see available services.</p>
          )}
        </div>
      ) : (
        <>
          {services.map((service, index) => {
            const serviceId = getServiceId(service) || `service-${index}`;
            const isSelected =
              selectedService && getServiceId(selectedService) === serviceId;

            return (
              <div
                key={serviceId}
                className="p-4"
                onClick={() => handleServiceClick(service)}
              >
                <div
                  className={`flex items-stretch justify-between gap-4 rounded-lg cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "p-2 ring-2 ring-blue-400 ring-opacity-50 bg-blue-25 transform scale-[1.02]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-[2_2_0px] flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-[#0d141c] text-base font-bold leading-tight">
                        {service.name || `Service ${index + 1}`}
                      </p>
                      <p className="text-[#49739c] text-sm font-normal leading-normal">
                        {service.description || "Professional styling service"}
                      </p>
                    </div>
                    <div
                      className={`flex min-w-[84px] max-w-[480px] items-center justify-center overflow-hidden rounded-lg h-8 px-4 flex-row-reverse ${
                        isSelected
                          ? "bg-blue-100 text-blue-800"
                          : "bg-[#e7edf4] text-[#0d141c]"
                      } text-sm font-medium leading-normal w-fit`}
                    >
                      <span className="truncate">
                        ${service.price || "0"} - {service.duration || "0"} min
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1"
                    style={{
                      backgroundImage: `url(${
                        service.imageUrl || defaultServiceImage
                      })`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}
