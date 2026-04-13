// src/context/WorkerContext.jsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api.services.js";

const WorkerContext = createContext(null);

// Decode token to get basic user info
function getUserFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const p = JSON.parse(atob(token.split(".")[1]));
    return { _id: p._id, name: p.name, email: p.email, role: p.role };
  } catch {
    return null;
  }
}

export function WorkerProvider({ children }) {
  const [user, setUser] = useState(getUserFromToken());
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = useCallback(async () => {
    try {
      const res = await api.get("/portfolios/me");
      // Backend returns null if no portfolio yet — handle both cases
      setPortfolio(res.data || null);
    } catch (err) {
      // 404 means no portfolio yet — that's fine
      if (err.response?.status === 404) setPortfolio(null);
      else console.error("fetchPortfolio:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Also fetch fresh user info from /auth/me to get latest name/email/avatar
  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch {
      /* keep token data */
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Fetch both in parallel
    Promise.all([fetchPortfolio(), fetchUser()]);
  }, [fetchPortfolio, fetchUser]);

  // Call this after any save to immediately reflect changes everywhere
  const refreshPortfolio = useCallback(async () => {
    setLoading(true);
    await fetchPortfolio();
  }, [fetchPortfolio]);

  return (
    <WorkerContext.Provider
      value={{ user, portfolio, loading, refreshPortfolio }}
    >
      {children}
    </WorkerContext.Provider>
  );
}

export function useWorker() {
  const ctx = useContext(WorkerContext);
  if (!ctx) throw new Error("useWorker must be used inside WorkerProvider");
  return ctx;
}
