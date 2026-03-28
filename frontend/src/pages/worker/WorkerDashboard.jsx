import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext.jsx";

function WorkerDashboard() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  return (
    <div>
      <h1>Worker Dashboard</h1>

      <button onClick={() => navigate("/worker/upload")}>
        {t("uploadVideo")}
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/worker/portfolio")}>
        {t("portfolio") || "Portfolio"}
      </button>

      <br />
      <br />

      <button onClick={() => navigate("/client/browse")}>
        {t("browseWorkers")}
      </button>
    </div>
  );
}

export default WorkerDashboard;
