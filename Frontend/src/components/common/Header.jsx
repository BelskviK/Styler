// Frontend/src/components/common/Header.jsx (create if doesn't exist)
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/context/useAuth";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Styler App</h1>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationDropdown />

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
