import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.services.js";
import { LanguageContext } from "../context/LanguageContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);

      res.data.role === "worker"
        ? navigate("/worker/dashboard")
        : navigate("/client/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div>
      <h2>{t("login")}</h2>

      <input
        type="email"
        placeholder={t("email")}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder={t("password")}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>{t("login")}</button>
    </div>
  );
}

export default Login;
