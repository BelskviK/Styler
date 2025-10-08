// Frontend/src/components/common/Layout.jsx
import { Outlet } from "react-router-dom";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed header for all users */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      {/* Main content with top padding equal to header height and bottom padding for footer */}
      <main className="flex-1 pt-16 pb-20 lg:pb-0">
        <Outlet />
      </main>

      {/* Fixed footer for mobile/tablet - only for logged in users */}
      <Footer />
    </div>
  );
}
