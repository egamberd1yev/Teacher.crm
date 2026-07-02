import React, { createContext, useContext, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [teacher, setTeacher] = useState(() => {
    const stored = localStorage.getItem("teacher");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("teacher", JSON.stringify(data.teacher));
    setTeacher(data.teacher);
  }

  async function register(fullName, email, password, phone) {
    const { data } = await api.post("/auth/register", { fullName, email, password, phone });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("teacher", JSON.stringify(data.teacher));
    setTeacher(data.teacher);
  }

  function logout() {
    localStorage.clear();
    setTeacher(null);
  }

  return (
    <AuthContext.Provider value={{ teacher, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
