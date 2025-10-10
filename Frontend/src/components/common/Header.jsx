// Frontend\src\components\common\Header.jsx
import { useState, useRef, useEffect } from "react";
import NotificationDropdown from "@/components/common/NotificationDropdown";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

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
// Theme Toggle Component - UPDATED VERSION
// In Header.jsx, update the ThemeToggle component temporarily:
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleClick = () => {
    console.log("Theme toggle clicked. Current isDark:", isDark);
    toggleTheme();
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        // Sun icon - we're in dark mode, so show sun to switch to light
        <svg
          className="w-5 h-5 text-yellow-500"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0-12a.75.75 0 0 0 .75-.75V2a.75.75 0 0 0-1.5 0v2.25c0 .414.336.75.75.75zm0 15a.75.75 0 0 0-.75.75V22a.75.75 0 0 0 1.5 0v-2.25A.75.75 0 0 0 12 20zM4.222 5.222a.75.75 0 0 0 1.06 0l1.5-1.5a.75.75 0 0 0-1.06-1.06l-1.5 1.5a.75.75 0 0 0 0 1.06zm14.496 14.496a.75.75 0 0 0 1.06 0l1.5-1.5a.75.75 0 1 0-1.06-1.06l-1.5 1.5a.75.75 0 0 0 0 1.06zM2 12a.75.75 0 0 0 .75.75H5a.75.75 0 0 0 0-1.5H2.75A.75.75 0 0 0 2 12zm17 0a.75.75 0 0 0 .75-.75V9a.75.75 0 0 0-1.5 0v2.25c0 .414.336.75.75.75zm-15.722 6.778a.75.75 0 0 0 0-1.06l-1.5-1.5a.75.75 0 0 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.06 0zm14.496-14.496a.75.75 0 0 0 0-1.06l-1.5-1.5a.75.75 0 1 0-1.06 1.06l1.5 1.5a.75.75 0 0 0 1.06 0z" />
        </svg>
      ) : (
        // Moon icon - we're in light mode, so show moon to switch to dark
        <svg
          className="w-5 h-5 text-gray-700"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
        </svg>
      )}
      {/* Temporary debug text */}
      <span className="text-xs">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
};
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
      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
    >
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {user?.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {user?.email}
        </p>
      </div>

      <button
        onClick={() => {
          navigate("/settings");
          onClose();
        }}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
      className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
    >
      {/* Mobile-only login and registration items (hidden on sm and above) */}
      <div className="sm:hidden border-b border-gray-100 dark:border-gray-700">
        <button
          onClick={() => {
            navigate("/login");
            onClose();
          }}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-50">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1
            onClick={handleLogoClick}
            className="text-xl font-semibold text-gray-900 dark:text-white cursor-pointer"
          >
            {user?.companyName || "SalonApp"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* My Appointments button - hidden on tablet and mobile */}
          {user?.role === "customer" && (
            <div className="hidden lg:flex items-center space-x-2">
              <button
                onClick={() => navigate("/history")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
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
                      className="w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
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
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:block"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register/customer")}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:block"
              >
                Register
              </button>

              {/* Hamburger menu icon for non-authenticated users - Always opens dropdown */}
              <div className="relative">
                <button
                  onClick={toggleBurgerMenu}
                  className="flex items-center justify-center focus:outline-none"
                >
                  <HamburgerMenuIcon className="w-6 h-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
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
