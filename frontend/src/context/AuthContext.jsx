import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get("/api/admin/check-auth", { withCredentials: true });
        setIsAuthenticated(res.data.authenticated);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (key) => {
    const res = await axios.post(
      "/api/admin/login",
      { key },
      { withCredentials: true }
    );
    setIsAuthenticated(res.data.success);
    return res.data;
  };

  const logout = async () => {
    await axios.post("/api/admin/logout", {}, { withCredentials: true });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
