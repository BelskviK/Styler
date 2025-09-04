// Frontend/src/pages/CompanyPage.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import CompanyService from "@/services/CompanyService";

export default function CompanyPage() {
  const { companyName } = useParams();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        // Convert URL-friendly name back to normal name
        const normalizedName = companyName
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());

        // In a real app, you'd fetch by ID or slug, but for demo we'll filter by name
        const response = await CompanyService.getPublicBarbershops();
        const foundCompany = response.data.find(
          (comp) => comp.name.toLowerCase() === normalizedName.toLowerCase()
        );

        if (foundCompany) {
          setCompany(foundCompany);
        } else {
          setError("Company not found");
        }
      } catch (err) {
        console.error("Error fetching company:", err);
        setError("Failed to load company information");
      } finally {
        setLoading(false);
      }
    };

    if (companyName) {
      fetchCompanyData();
    }
  }, [companyName]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse bg-gray-300 rounded-lg h-8 w-3/4 mb-4"></div>
        <div className="animate-pulse bg-gray-300 rounded-lg h-4 w-1/2 mb-6"></div>
        <div className="animate-pulse bg-gray-300 rounded-lg h-64 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Company Not Found</h1>
        <p className="text-gray-600">
          The company you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {company.name}'s Page
      </h1>
      <p className="text-gray-600 mb-6">{company.description}</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Company Information</h2>
          <p>
            <strong>Location:</strong> {company.location || "Not specified"}
          </p>
          <p>
            <strong>Rating:</strong> {company.reviews?.rating || "No"} reviews
          </p>
          <p>
            <strong>Type:</strong> {company.type}
          </p>
        </div>

        {company.image && (
          <div className="mt-6">
            <img
              src={company.image}
              alt={company.name}
              className="w-full max-w-md h-64 object-cover rounded-lg mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
