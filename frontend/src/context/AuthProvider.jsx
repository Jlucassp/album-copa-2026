import { useState } from "react";
import { AuthContext } from "./AuthContext";

function getInitialUser() {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  if (token && storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [loading] = useState(false);

  function login(token, userData) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
