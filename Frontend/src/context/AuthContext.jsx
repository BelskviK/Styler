// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { decodeToken } from "@/utils/jwt";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => (token ? decodeToken(token) : null));

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        const decoded = decodeToken(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        }
      }
    };

    // Check immediately
    checkTokenExpiration();

    // Then check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isGuest = !user;

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
