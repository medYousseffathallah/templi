import React, { createContext, useState, useEffect, useContext } from "react";
import { userApi } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateStoredAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = localStorage.getItem("user");

        if (token && user) {
          // Validate token by making a request to verify it's still valid
          try {
            const response = await userApi.getCurrentUser();
            if (response.data) {
              setCurrentUser(response.data);
              // Update stored user data in case it changed
              localStorage.setItem("user", JSON.stringify(response.data));
            } else {
              // Token is invalid, clear storage
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              setCurrentUser(null);
            }
          } catch (error) {
            // Token validation failed, clear storage
            console.log("Token validation failed, clearing auth data");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setCurrentUser(null);
          }
        }
      } catch (error) {
        console.error("Error validating stored auth:", error);
      } finally {
        setLoading(false);
      }
    };

    validateStoredAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await userApi.login({ email, password });

      // Store token and user info in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setCurrentUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await userApi.register(userData);

      // Store token and user info from registration response
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setCurrentUser(response.data.user);
      return response.data.user;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
