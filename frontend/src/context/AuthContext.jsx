import React, { createContext, useState, useEffect, useContext } from "react";
import authService from "../services/authService";

// Create context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Only try to get user profile if we're on a protected route
        const publicRoutes = [
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ];
        if (
          !publicRoutes.some((route) =>
            window.location.pathname.startsWith(route)
          )
        ) {
          try {
            const userProfile = await authService.getUserProfile();
            setUser(userProfile);
          } catch (error) {
            // If 401 error, silently fail as user is not logged in
            if (error.response?.status === 401) {
              setUser(null);
            } else {
              setError("Failed to fetch user profile");
            }
          }
        } else {
          // On public routes, don't try to get user profile
          setUser(null);
        }
      } catch (error) {
        setError("Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    setError(null);
    try {
      const loginResponse = await authService.login(credentials);
      // Fetch user profile after successful login
      const userProfile = await authService.getUserProfile();
      setUser(userProfile);
      return { success: true, role: userProfile.role };
    } catch (error) {
      setError(
        error.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
      return { success: false };
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      await authService.register(userData);
      return true;
    } catch (error) {
      setError(
        error.response?.data || "Registration failed. Please try again."
      );
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  // Check if user has admin role
  const isAdmin = () => {
    return user?.role === "admin";
  };

  // Check if user has manager role
  const isManager = () => {
    return user?.role === "manager" || isAdmin();
  };

  // Check if user has agent role
  const isAgent = () => {
    return user?.role === "agent" || isManager();
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isManager,
    isAgent,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
