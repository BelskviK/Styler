// Frontend/src/components/common/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header for all users */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Main content with top padding equal to header height (h-16 = 4rem = 64px) */}
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
    </div>
  );
}
