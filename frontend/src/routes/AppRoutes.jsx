// src/App.jsx — add these routes inside your <Routes>
// This shows ONLY the client section — merge with your existing routes

import ClientDashboard from "../pages/client/ClientDashboard.jsx";
import BrowseWorkers from "../pages/client/BrowseWorkers.jsx";
import BrowseAllWorkers from "../pages/client/BrowseAllWorkers.jsx";
import MyJobs from "../pages/client/MyJobs.jsx";
import SettingsPage from "../pages/SettingsPage.jsx";

// Worker detail page (you likely already have this)
// import WorkerProfile from "./pages/client/WorkerProfile.jsx";

/*
  <Route path="/client" element={<ClientDashboard />}>
    <Route path="dashboard"  element={<ClientHome />} />   ← handled inside ClientDashboard
    <Route path="browse"     element={<BrowseWorkers />} />
    <Route path="browse-all" element={<BrowseAllWorkers />} />
    <Route path="jobs"       element={<MyJobs />} />
    <Route path="settings"   element={<SettingsPage />} />
    <Route path="worker/:id" element={<WorkerProfile />} />
  </Route>

  Note: ClientDashboard uses <Outlet /> so nested routes render inside the sidebar layout.
  The dashboard home content is rendered directly when path === "/client/dashboard".
*/

// Example full App.jsx:
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SelectLanguage from "../pages/SelectLanguage.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import WorkerLayout from "../pages/worker/WorkerDashboard.jsx";
import PortfolioPage from "../pages/worker/PortfolioPage.jsx";
import UploadVideo from "../pages/worker/UploadVideo.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<SelectLanguage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Worker — layout with sidebar */}
        <Route path="/worker" element={<WorkerLayout />}>
          <Route path="dashboard" element={null} />{" "}
          {/* home rendered by WorkerLayout */}
          <Route path="upload" element={<UploadVideo />} />
          <Route path="portfolio" element={<PortfolioPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* <Route path="jobs"    element={<WorkerJobs />} /> */}
          {/* <Route path="messages" element={<WorkerMessages />} /> */}
        </Route>

        {/* Client — layout with sidebar */}
        <Route path="/client" element={<ClientDashboard />}>
          <Route path="dashboard" element={null} />{" "}
          {/* home rendered by ClientDashboard */}
          <Route path="browse" element={<BrowseWorkers />} />
          <Route path="browse-all" element={<BrowseAllWorkers />} />
          <Route path="jobs" element={<MyJobs />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* <Route path="worker/:id" element={<WorkerProfile />} /> */}
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
