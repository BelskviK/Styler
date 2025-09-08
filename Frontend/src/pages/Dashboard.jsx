// src/pages/Dashboard.jsx
import { useAuth } from "@/hooks/useAuth";
import DashboardStyler from "@/components/dashboard/DashboardStyler";
import DashboardSuperadmin from "@/components/dashboard/DashboardSuperadmin";
import DashboardAdmin from "@/components/dashboard/DashboardAdmin";

export default function Dashboard() {
  const { user } = useAuth();

  // You can add more roles as needed
  if (user?.role === "styler") {
    return <DashboardStyler />;
  }
  if (user?.role === "superadmin") {
    return <DashboardSuperadmin />;
  }
  if (user?.role === "admin") {
    return <DashboardAdmin />;
  }

  // Default dashboard for other/unknown roles
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>You can schedule appointments Other PAGE</p>
    </div>
  );
}
