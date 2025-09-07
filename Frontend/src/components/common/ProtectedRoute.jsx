import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedRoute({ allowedRoles }) {
  const { token, user } = useAuth(); // assuming user contains { role }

  // not logged in
  if (!token) {
    return <Navigate to="/barbershops" replace />;
  }

  // role not allowed
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/barbershops" replace />;
  }

  return <Outlet />;
}
