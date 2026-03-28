import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { LanguageContext } from "../../context/LanguageContext";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const categories = [
    { name: "electrician", label: "Electrician" },
    { name: "plumber", label: "Plumber" },
    { name: "cleaner", label: "Cleaner" },
    { name: "cook", label: "Cook" },
  ];

  const handleClick = (category) => {
    navigate(`/client/browse?category=${category}`);
  };

  return (
    <div>
      <h2>{t("selectCategory") || "Select Service Category"}</h2>

      <div>
        {categories.map((cat) => (
          <div key={cat.name} style={{ margin: "10px" }}>
            <button onClick={() => handleClick(cat.name)}>{cat.label}</button>
          </div>
        ))}
      </div>
    </div>
  );
}
