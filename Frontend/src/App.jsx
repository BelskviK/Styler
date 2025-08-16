// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";

import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import Stylists from "@/pages/Stylists";
import Services from "@/pages/Services";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <div className="flex min-h-screen">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Right Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Bookings" element={<Bookings />} />
          <Route path="/Stylists" element={<Stylists />} />
          <Route path="/services" element={<Services />} />
          <Route path="/settings" element={<Settings />} />
          {/* fallback route */}
          <Route
            path="*"
            element={<h1 className="text-xl">Page Not Found</h1>}
          />
        </Routes>
      </main>
    </div>
  );
}
