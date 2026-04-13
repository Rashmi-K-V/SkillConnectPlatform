// src/routes/AppRoutes.jsx
import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";

// Public
import SelectLanguage from "../pages/SelectLanguage.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";

// Shared
import SettingsPage from "../pages/SettingsPage.jsx";

// Worker
import WorkerLayout from "../pages/worker/WorkerDashboard.jsx";
import UploadVideo from "../pages/worker/UploadVideo.jsx";
import PortfolioPage from "../pages/worker/PortfolioPage.jsx";
import WorkerJobs from "../pages/worker/Jobs.jsx";
import WorkerMessages from "../pages/worker/Messages.jsx";

// Client
import ClientDashboard from "../pages/client/ClientDashboard.jsx";
import BrowseWorkers from "../pages/client/BrowseWorkers.jsx";
import BrowseAllWorkers from "../pages/client/BrowseAllWorkers.jsx";
import MyJobs from "../pages/client/MyJobs.jsx";
import WorkerProfile from "../pages/client/WorkerProfile.jsx";

// ── Get role from JWT token (handles page refresh when AuthContext.user is null) ──
function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return null;
    }
    return payload.role;
  } catch {
    return null;
  }
}

// ── Redirects to /login if not authenticated ──────────────────
// ── Redirects to correct dashboard if wrong role ─────────────
function RequireAuth({ role, children }) {
  const { user } = useContext(AuthContext);
  const currentRole = user?.role || getRoleFromToken();

  if (!currentRole) return <Navigate to="/login" replace />;
  if (role && currentRole !== role)
    return <Navigate to={`/${currentRole}/dashboard`} replace />;
  return children;
}

// ── Redirects already-logged-in users away from /login & /register ──
function RedirectIfAuth({ children }) {
  const { user } = useContext(AuthContext);
  const currentRole = user?.role || getRoleFromToken();
  if (currentRole) return <Navigate to={`/${currentRole}/dashboard`} replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<SelectLanguage />} />

        <Route
          path="/login"
          element={
            <RedirectIfAuth>
              <Login />
            </RedirectIfAuth>
          }
        />

        <Route
          path="/register"
          element={
            <RedirectIfAuth>
              <Register />
            </RedirectIfAuth>
          }
        />

        {/* ── Worker ── */}
        <Route
          path="/worker"
          element={
            <RequireAuth role="worker">
              <WorkerLayout />
            </RequireAuth>
          }
        >
          <Route index element={null} />
          <Route path="dashboard" element={null} />
          <Route path="upload" element={<UploadVideo />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="jobs" element={<WorkerJobs />} />
          <Route path="messages" element={<WorkerMessages />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ── Client ── */}
        <Route
          path="/client"
          element={
            <RequireAuth role="client">
              <ClientDashboard />
            </RequireAuth>
          }
        >
          <Route index element={null} />
          <Route path="dashboard" element={null} />
          <Route path="browse" element={<BrowseWorkers />} />
          <Route path="browse-all" element={<BrowseAllWorkers />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="worker/:workerId" element={<WorkerProfile />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
