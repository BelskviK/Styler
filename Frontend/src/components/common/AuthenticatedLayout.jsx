// Frontend/src/components/common/AuthenticatedLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AuthenticatedLayout() {
  return (
    <div className="flex min-h-screen pt-16">
      {/* Sidebar - fixed position */}
      <div className="fixed left-0 top-16 bottom-0 w-1/5 z-40">
        <Sidebar />
      </div>

      {/* Main content - with left margin to push it past the sidebar */}
      <div className="ml-[20%] w-4/5 flex-1 p-6 relative z-30">
        <Outlet />
      </div>
    </div>
  );
}
