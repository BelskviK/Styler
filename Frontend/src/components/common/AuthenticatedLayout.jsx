// Frontend/src/components/common/AuthenticatedLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AuthenticatedLayout() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar - fixed */}
      <div className="fixed left-0 top-16 bottom-0 w-1/5 z-40">
        <Sidebar />
      </div>

      {/* Main content - scrollable */}
      <div className="ml-[20%] w-4/5 flex-1 relative z-30 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
