import { createContext, useContext, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (formData, role = "user") => {
    const endpoint =
      role === "owner" ? "/owner/login" : "/auth/login";

    const res = await API.post(endpoint, formData);

    const userData =
      role === "owner" ? res.data.owner : res.data.user;

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);

    return res.data;
  };

  const register = async (formData, role = "user") => {
    const endpoint =
      role === "owner" ? "/owner/register" : "/auth/register";

    const res = await API.post(endpoint, formData);

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);