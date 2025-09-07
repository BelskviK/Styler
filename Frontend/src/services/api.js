import axios from "axios";
import { API_BASE } from "@/config";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      getCookie("token") ||
      getCookie("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token available for authorization");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.message);

    if (error.response?.status === 401) {
      // Check current path
      const currentPath = window.location.pathname;

      // List of protected routes
      const protectedPaths = [
        "/dashboard",
        "/appointments",
        "/services",
        "/settings",
        "/stylists",
        "/bookings",
      ];

      // Redirect only if the user is in a protected route
      const isProtected = protectedPaths.some((path) =>
        currentPath.startsWith(path)
      );

      if (isProtected) {
        localStorage.removeItem("token");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to get cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export default api;
