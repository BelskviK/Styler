// Frontend/src/components/common/AuthenticatedLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "@/components/common/Sidebar";

export default function AuthenticatedLayout() {
  return (
    <div className="flex h-full pt-[64px] overflow-hidden">
      {/* Sidebar - hidden on mobile/tablet, visible on desktop */}
      <div className="hidden lg:block fixed left-0 top-16 bottom-0 w-1/5 z-10">
        <Sidebar />
      </div>

      {/* Main content - full width on mobile, with sidebar margin on desktop */}
      <div className="w-full lg:ml-[20%] lg:w-4/5 flex-1 relative z-30 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
