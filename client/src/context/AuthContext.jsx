import { createContext, useContext, useEffect, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Check login status on app load
  useEffect(() => {
    API.get("/auth/me")
      .then(res => {
        setUser(res.data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (data) => {
    await API.post("/auth/login", data);
    const res = await API.get("/auth/me");
    setUser(res.data.user);
  };

  const register = async (data) => {
    await API.post("/auth/register", data);
    const res = await API.get("/auth/me");
    setUser(res.data.user);
  };

  const logout = async () => {
    await API.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
