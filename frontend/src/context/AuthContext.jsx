// src/context/AuthContext.jsx
import { createContext, useState } from "react";

const AuthContext = createContext();

// Decode user info from existing token on page load
function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Check if token is expired
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return {
      _id:   payload._id,
      name:  payload.name,
      email: payload.email,
      role:  payload.role,
      token,
    };
  } catch {
    return null;
  }
}

const AuthProvider = ({ children }) => {
  // ✅ Initialize from token so user survives page refresh
  const [user, setUser] = useState(getUserFromToken());

  const login = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };