// src/services/api.js
import axios from "axios";

// Check dev flag
const isDev = import.meta.env.VITE_DEV === "true";

// Choose base URL
const API_BASE = isDev
  ? import.meta.env.VITE_LOCAL_API
  : import.meta.env.VITE_PROD_API;

const api = axios.create({
  baseURL: `${API_BASE}/api`, // Add /api here instead
  withCredentials: true,
});
// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
export default api;
