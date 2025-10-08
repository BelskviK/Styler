// Frontend\src\components\common\Header.jsx
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

// Default profile SVG component
const DefaultProfileSVG = ({ className = "w-8 h-8" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

// Hamburger menu icon component
const HamburgerMenuIcon = ({ className = "w-6 h-6" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

// User avatar component with dropdown
const UserAvatar = ({ user, className = "w-8 h-8" }) => {
  if (user?.profileImage) {
    return (
      <img
        src={user.profileImage}
        alt={`${user.name}'s profile`}
        className={`rounded-full object-cover cursor-pointer ${className}`}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    );
  }
  return <DefaultProfileSVG className={`cursor-pointer ${className}`} />;
};

// Profile Dropdown Component
const ProfileDropdown = ({ user, onLogout, isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
    >
      <div className="px-4 py-2 border-b border-gray-100">
        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>

      <button
        onClick={() => {
          navigate("/settings");
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Settings
      </button>

      {/* For Business subscription plan item */}
      <button
        onClick={() => {
          navigate("/Pricing");
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        For Business
      </button>

      <button
        onClick={() => {
          onLogout();
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        Logout
      </button>
    </div>
  );
};

// Burger Menu Dropdown for Non-Authenticated Users
const BurgerMenuDropdown = ({ isOpen, onClose }) => {
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
    >
      {/* Mobile-only login and registration items (hidden on sm and above) */}
      <div className="sm:hidden border-b border-gray-100">
        <button
          onClick={() => {
            navigate("/login");
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Login
        </button>

        <button
          onClick={() => {
            navigate("/register/customer");
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Register
        </button>
      </div>

      <button
        onClick={() => {
          navigate("/dashboard");
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        Dashboard
      </button>

      <button
        onClick={() => {
          navigate("/Pricing");
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        For Business
      </button>
    </div>
  );
};

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBurgerMenuOpen, setIsBurgerMenuOpen] = useState(false);

  const handleLogoClick = () => {
    if (
      user?.role === "superadmin" ||
      user?.role === "admin" ||
      user?.role === "styler"
    ) {
      navigate("/dashboard");
    } else {
      navigate("/barbershops");
    }
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsBurgerMenuOpen(false); // Close burger menu if open
  };

  const toggleBurgerMenu = () => {
    setIsBurgerMenuOpen(!isBurgerMenuOpen);
    setIsProfileOpen(false); // Close profile dropdown if open
  };

  const closeAllDropdowns = () => {
    setIsProfileOpen(false);
    setIsBurgerMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1
            onClick={handleLogoClick}
            className="text-xl font-semibold text-gray-900 cursor-pointer"
          >
            {user?.companyName || "SalonApp"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* My Appointments button - hidden on tablet and mobile */}
          {user?.role === "customer" && (
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => navigate("/history")}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                My Appointments
              </button>
            </div>
          )}
          {user && <NotificationDropdown />}

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 relative">
                {/* Welcome message first - hidden on tablet and mobile */}
                <span className="hidden sm:inline text-sm text-gray-700">
                  Welcome, {user?.name}
                </span>

                {/* User avatar with dropdown */}
                <div className="relative">
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center justify-center focus:outline-none"
                  >
                    <UserAvatar
                      user={user}
                      className="w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors"
                    />
                  </button>

                  <ProfileDropdown
                    user={user}
                    onLogout={logout}
                    isOpen={isProfileOpen}
                    onClose={closeAllDropdowns}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Text buttons hidden on mobile, visible on larger screens */}
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register/customer")}
                className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block"
              >
                Register
              </button>

              {/* Hamburger menu icon for non-authenticated users - Always opens dropdown */}
              <div className="relative">
                <button
                  onClick={toggleBurgerMenu}
                  className="flex items-center justify-center focus:outline-none"
                >
                  <HamburgerMenuIcon className="w-6 h-6 text-gray-600 hover:text-gray-900" />
                </button>

                <BurgerMenuDropdown
                  isOpen={isBurgerMenuOpen}
                  onClose={closeAllDropdowns}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
