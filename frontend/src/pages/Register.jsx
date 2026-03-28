import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.services.js";
import { LanguageContext } from "../context/LanguageContext";

function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const handleRegister = async () => {
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div>
      <h2>{t("register")}</h2>

      <input
        placeholder={t("name")}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <input
        placeholder={t("email")}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        type="password"
        placeholder={t("password")}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="">{t("selectRole")}</option>
        <option value="worker">{t("worker")}</option>
        <option value="client">{t("client")}</option>
      </select>

      <button onClick={handleRegister}>{t("register")}</button>
    </div>
  );
}

export default Register;
