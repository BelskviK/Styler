import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function Stylists() {
  const [search, setSearch] = useState("");
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        // Only fetch if user is authenticated and has a company
        if (user?.company) {
          const response = await axios.get("http://localhost:5000/api/users", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setStylists(response.data);
        }
      } catch (err) {
        console.error("Error fetching stylists:", err);
        setError("Failed to load stylists");
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, [token, user]);

  // Filter by search
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
        <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f2f5] text-[#111418] text-sm font-medium leading-normal">
          <span className="truncate">Add Stylist</span>
        </button>
      </div>

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
                  <tr key={stylist.id} className="border-t border-t-[#dbe0e6]">
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
                      Edit
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
