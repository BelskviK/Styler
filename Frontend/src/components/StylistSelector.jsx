// Frontend/src/components/StylistSelector.jsx
import React from "react";
import AnimatedImage from "@/components/common/AnimatedImage";

export default function StylistSelector({
  stylists = [],
  loading = false,
  onStylistSelect,
  selectedStylist,
}) {
  const handleStylistClick = (stylist) => {
    if (onStylistSelect) {
      onStylistSelect(stylist);
    }
  };

  // If no stylists are provided (like in BookingPage), show placeholder
  const showPlaceholder = stylists.length === 0 && !loading;

  return (
    <section className="mt-6">
      <h3 className="text-lg font-bold text-[#0d141c] px-4 pb-2">
        Select a stylist
      </h3>

      {loading ? (
        <div className="flex overflow-x-auto gap-8 p-4 scrollbar-hide">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-4 min-w-32 text-center">
              <div className="aspect-square w-full rounded-full bg-gray-300 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : showPlaceholder ? (
        <div className="p-4 text-center text-gray-500">
          <p>No stylists available at this location.</p>
          <p className="text-sm mt-1">Please select a barbershop first.</p>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-8 p-4 scrollbar-hide">
          {stylists.map((stylist) => {
            const isSelected =
              selectedStylist &&
              (selectedStylist.id === stylist.id ||
                selectedStylist._id === stylist._id);

            return (
              <div
                key={stylist.id || stylist._id}
                onClick={() => handleStylistClick(stylist)}
                className={`flex flex-col gap-4 min-w-32 text-center cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "transform scale-105 shadow-lg"
                    : "hover:opacity-80 hover:transform hover:scale-102"
                }`}
              >
                <div
                  className={`aspect-square w-full rounded-full overflow-hidden transition-all duration-200 ${
                    isSelected ? "ring-4 ring-blue-400 ring-opacity-50" : ""
                  }`}
                >
                  <AnimatedImage
                    src={
                      stylist.profileImage ||
                      "https://similarpng.com/_next/image?url=https%3A%2F%2Fimage.similarpng.com%2Ffile%2Fsimilarpng%2Fvery-thumbnail%2F2021%2F08%2FBarber-shop-logo-on-transparent-background-PNG.png&w=3840&q=75"
                    }
                    alt={stylist.name}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <div>
                  <p
                    className={`text-base font-medium transition-colors ${
                      isSelected ? "text-blue-600" : "text-[#0d141c]"
                    }`}
                  >
                    {stylist.name}
                  </p>
                  <p className="text-sm text-[#49739c]">
                    {stylist.description || "Styling specialist"}
                  </p>
                  {stylist.rating && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⭐ {stylist.rating}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
