import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkerProvider } from "../context/WorkerContext.jsx";

// Public
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import SelectLanguage from "../pages/SelectLanguage.jsx";

// Worker layout + pages
import WorkerLayout from "../pages/worker/WorkerDashboard.jsx";
import UploadVideo from "../pages/worker/UploadVideo.jsx";
import PortfolioPage from "../pages/worker/PortfolioPage.jsx";
import Jobs from "../pages/worker/Jobs.jsx";
import Messages from "../pages/worker/Messages.jsx";

// Client pages
import ClientDashboard from "../pages/client/ClientDashboard.jsx";
import BrowseWorkers from "../pages/client/BrowseWorkers.jsx";
import JobTracking from "../pages/client/JobTracking.jsx";
import WorkerProfile from "../pages/client/WorkerPorfile.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<SelectLanguage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Worker (nested under layout) ── */}
        <Route
          path="/worker"
          element={
            <WorkerProvider>
              <WorkerLayout />
            </WorkerProvider>
          }
        >
          {/* /worker → dashboard home (handled inside WorkerLayout as index) */}
          <Route path="dashboard" element={null} />{" "}
          {/* legacy redirect compat */}
          <Route path="upload" element={<UploadVideo />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="messages" element={<Messages />} />
        </Route>

        {/* Legacy flat route — redirects into nested layout */}
        <Route
          path="/worker/dashboard"
          element={
            <WorkerProvider>
              <WorkerLayout />
            </WorkerProvider>
          }
        />

        <Route path="/worker/settings" element={<SettingsPage />} />
        <Route path="/client/settings" element={<SettingsPage />} />
        {/* ── Client ── */}
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/browse" element={<BrowseWorkers />} />
        <Route path="/client/job/:id" element={<JobTracking />} />
        <Route path="/client/worker/:id" element={<WorkerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
