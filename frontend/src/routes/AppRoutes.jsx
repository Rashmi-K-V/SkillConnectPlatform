import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import SelectLanguage from "../pages/SelectLanguage.jsx";

import UploadVideo from "../pages/worker/UploadVideo.jsx";
import PortfolioPage from "../pages/worker/PortfolioPage.jsx";

import BrowseWorkers from "../pages/client/BrowseWorkers.jsx";
import JobTracking from "../pages/client/JobTracking.jsx";
import WorkerProfile from "../pages/client/WorkerPorfile.jsx";
import ClientDashboard from "../pages/client/ClientDashboard.jsx";
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SelectLanguage />} />
        <Route path="/api/auth/login" element={<Login />} />
        <Route path="/api/auth/register" element={<Register />} />

        <Route path="/worker/upload" element={<UploadVideo />} />
        <Route path="/worker/portfolio" element={<PortfolioPage />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/browse" element={<BrowseWorkers />} />
        <Route path="/client/job/:id" element={<JobTracking />} />
        <Route path="/client/worker/:id" element={<WorkerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}
