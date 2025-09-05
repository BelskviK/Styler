// Frontend/src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Check token expiration periodically
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split(".")[1]));
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          }
        } catch (error) {
          console.error("Token validation error:", error);
          logout();
        }
      }
    };

    checkTokenExpiration();
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "http://localhost:10000/api/auth/login",
        {
          email,
          password,
        }
      );

      const { token: newToken, user: userData } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      return response.data;
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      throw error.response?.data || { message: "Login failed" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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
