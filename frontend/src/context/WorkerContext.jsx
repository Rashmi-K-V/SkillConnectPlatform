// src/context/WorkerContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const WorkerContext = createContext(null);
export const useWorker = () => useContext(WorkerContext);

export function WorkerProvider({ children }) {
  const [user, setUser] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const [userRes, portRes] = await Promise.all([
          axios.get("/api/auth/me"),
          axios.get("/api/portfolio/my"),
        ]);
        setUser(userRes.data);
        setPortfolio(portRes.data);
      } catch (err) {
        console.error("Context fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshPortfolio = async () => {
    const res = await axios.get("/api/portfolio/my");
    setPortfolio(res.data);
  };

  return (
    <WorkerContext.Provider
      value={{
        user,
        portfolio,
        loading,
        setUser,
        setPortfolio,
        refreshPortfolio,
      }}
    >
      {children}
    </WorkerContext.Provider>
  );
}
