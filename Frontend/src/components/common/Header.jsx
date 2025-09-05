import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/context/useAuth";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1
            onClick={() => navigate("/")}
            className="text-xl font-semibold text-gray-900 cursor-pointer"
          >
            Styler App
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <NotificationDropdown />

          {user ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Welcome, {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register/customer")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
