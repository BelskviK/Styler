// Frontend/src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Login from "@/pages/Login";
import Barbershops from "@/pages/Barbershops";
import AuthenticatedLayout from "@/components/common/AuthenticatedLayout";
import Dashboard from "@/pages/Dashboard";
import Appointments from "@/pages/Appointments";
import Bookings from "@/pages/Bookings";
import Stylists from "@/pages/Stylists";
import Services from "@/pages/Services";
import Settings from "@/pages/Settings";
import CompanyPage from "./pages/CompanyPage";

import { NotificationProvider } from "@/context/NotificationContext";

export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/barbershops" element={<Barbershops />} />
        <Route path="/barbershop/:companyName" element={<CompanyPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthenticatedLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="stylists" element={<Stylists />} />
            <Route path="services" element={<Services />} />
            <Route path="settings" element={<Settings />} />
            <Route path="appointments" element={<Appointments />} />
          </Route>
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<h1 className="text-xl">Page Not Found</h1>} />
      </Routes>
    </NotificationProvider>
  );
}
