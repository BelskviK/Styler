// Frontend/src/components/BarbershopSelector.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AnimatedImage from "@/components/common/AnimatedImage";
import CompanyService from "@/services/CompanyService";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function BarbershopSelector() {
  const [barbershops, setBarbershops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchBarbershops();
  }, []);

  const fetchBarbershops = async () => {
    try {
      setLoading(true);
      const response = await CompanyService.getPublicBarbershops();
      setBarbershops(response.data);
    } catch (err) {
      console.error("Error fetching barbershops:", err);
      setError("Failed to load barbershops. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  if (loading) {
    return (
      <>
        <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
          Choose a barbershop
        </h3>
        <div className="relative px-4">
          <div className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-40">
                <div className="animate-pulse bg-gray-300 rounded-lg h-32 w-full" />
                <div className="space-y-2 mt-2">
                  <div className="animate-pulse bg-gray-300 rounded-lg h-4 w-3/4" />
                  <div className="animate-pulse bg-gray-300 rounded-lg h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
        <button
          onClick={fetchBarbershops}
          className="ml-2 text-blue-500 hover:text-blue-700 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (barbershops.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No barbershops available at the moment.
      </div>
    );
  }

  const displayedBarbershops = expanded ? barbershops : barbershops.slice(0, 5);

  return (
    <>
      <h3 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
        Choose a barbershop
      </h3>

      <div className="relative px-4">
        <div
          className={`flex gap-4 pb-4 overflow-x-auto scrollbar-hide ${
            expanded ? "flex-wrap justify-start" : ""
          }`}
        >
          {displayedBarbershops.map((shop) => (
            <Link
              key={shop._id}
              to={`/barbershop/${shop.name.toLowerCase().replace(/\s+/g, "-")}`}
              className={`flex flex-col gap-2 cursor-pointer hover:opacity-90 transition-opacity ${
                expanded ? "w-40 flex-shrink-0" : "w-40 flex-shrink-0"
              }`}
            >
              <div className="w-full aspect-square">
                <AnimatedImage
                  src={
                    shop.image ||
                    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop"
                  }
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <p className="text-[#0d141c] text-base font-medium leading-normal line-clamp-2">
                  {shop.name}
                </p>
                <p className="text-[#49739c] text-sm font-normal leading-normal">
                  {shop.reviews?.rating
                    ? `${shop.reviews.rating} (${shop.reviews.count} reviews)`
                    : "No reviews yet"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {barbershops.length > 5 && (
          <button
            onClick={toggleExpand}
            className="absolute right-4 bottom-2 bg-white rounded-full p-1 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label={expanded ? "Collapse" : "Expand to see all"}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
      </div>
    </>
  );
}
