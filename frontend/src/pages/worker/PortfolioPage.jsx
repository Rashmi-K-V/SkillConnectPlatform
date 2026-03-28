import api from "../../services/api.services.js";
import UploadVideo from "./UploadVideo";
import { useState, useEffect, useContext } from "react";

import { LanguageContext } from "../../context/LanguageContext";

function PortfolioPage() {
  const [form, setForm] = useState({
    skills: [],
    experience: "",
    description: "",
    priceRange: { min: "", max: "" },
  });

  const { t } = useContext(LanguageContext);

  // 🔥 load existing portfolio
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await api.get("/portfolio/me");

        if (res.data) {
          setForm(res.data);
        }
      } catch (err) {
        console.log("No portfolio yet");
      }
    };

    fetchPortfolio();
  }, []);

  const handleSave = async () => {
    try {
      await api.post("/portfolio", form);
      alert("Portfolio saved");
    } catch (err) {
      alert("Error saving portfolio");
    }
  };

  return (
    <div>
      <h2>{t("portfolio") || "Portfolio"}</h2>

      {/* Description */}
      <textarea
        placeholder="Description"
        value={form.description || ""}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <br />
      <br />

      {/* Skills */}
      <input
        placeholder={t("skills")}
        value={form.skills?.join(",") || ""}
        onChange={(e) =>
          setForm({
            ...form,
            skills: e.target.value.split(","),
          })
        }
      />

      <br />
      <br />

      {/* Experience */}
      <input
        placeholder={t("experience")}
        value={form.experience || ""}
        onChange={(e) => setForm({ ...form, experience: e.target.value })}
      />

      <br />
      <br />

      {/* Price Range */}
      <input
        placeholder="Min Price"
        value={form.priceRange?.min || ""}
        onChange={(e) =>
          setForm({
            ...form,
            priceRange: {
              ...form.priceRange,
              min: e.target.value,
            },
          })
        }
      />

      <input
        placeholder="Max Price"
        value={form.priceRange?.max || ""}
        onChange={(e) =>
          setForm({
            ...form,
            priceRange: {
              ...form.priceRange,
              max: e.target.value,
            },
          })
        }
      />

      <br />
      <br />

      <button onClick={handleSave}>{t("save")}</button>
    </div>
  );
}
export default PortfolioPage;
