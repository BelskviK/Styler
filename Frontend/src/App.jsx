// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Login from "@/pages/Login";

import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import Stylists from "@/pages/Stylists";
import Services from "@/pages/Services";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes with layout */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-6">
                <Routes>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/stylists" element={<Stylists />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          }
        >
          {/* These will render inside the layout above */}
          <Route
            path="*"
            element={<h1 className="text-xl">Page Not Found</h1>}
          />
        </Route>
      </Route>
    </Routes>
  );
}
