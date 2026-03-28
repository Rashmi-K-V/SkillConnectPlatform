import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { LanguageContext } from "../../context/LanguageContext";

function BrowseWorkers() {
  const [workers, setWorkers] = useState([]);
  const [category, setCategory] = useState("");
  const navigate = useNavigate();
  const { lang, t } = useContext(LanguageContext);

  useEffect(() => {
    fetchWorkers();
  }, [category, lang]);

  const fetchWorkers = async () => {
    try {
      const res = await api.get(`/portfolio?category=${category}&lang=${lang}`);
      setWorkers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>{t("browseWorkers")}</h2>

      {/* Filter */}
      <select onChange={(e) => setCategory(e.target.value)}>
        <option value="">All</option>
        <option value="electrician">Electrician</option>
        <option value="plumber">Plumber</option>
        <option value="cleaner">Cleaner</option>
        <option value="cook">Cook</option>
      </select>

      {/* Workers */}
      {workers.map((w) => (
        <div key={w._id} style={{ border: "1px solid black", margin: "10px" }}>
          <h3>{w.workerId.name}</h3>

          <p>{w.translatedDescription || w.description}</p>

          <button onClick={() => navigate(`/client/worker/${w.workerId._id}`)}>
            View Profile
          </button>
        </div>
      ))}
    </div>
  );
}
export default BrowseWorkers;
