// src/components/common/Sidebar.jsx
import { NavLink } from "react-router-dom";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: "pi pi-home" },
  { path: "/profile", label: "Profile", icon: "pi pi-user" },
  { path: "/settings", label: "Settings", icon: "pi pi-cog" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-700">
        <h1 className="text-lg font-bold">My App</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                isActive ? "bg-gray-700" : "hover:bg-gray-800"
              }`
            }
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
