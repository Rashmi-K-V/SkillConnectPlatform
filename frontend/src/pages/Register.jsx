import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.services.js";
import { LanguageContext } from "../context/LanguageContext.jsx";

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
      <div className="mt-4 flex flex-col gap-4">
        {t("name")} :{" "}
        <input
          placeholder={t("name")}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="flex flex-col gap-2 mt-10">
          {t("Email")} :{" "}
          <input
            placeholder={t("email")}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2 mt-10">
          {t("Password")} :{" "}
          <input
            type="password"
            placeholder={t("password")}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2 mt-10">
          {t("Role")}:{" "}
          <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="">{t("selectRole")}</option>
            <option value="worker">{t("worker")}</option>
            <option value="client">{t("client")}</option>
          </select>
        </div>
        <br />
        <div className="m-2 p-3 ">
          <button onClick={handleRegister}>{t("register")}</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
