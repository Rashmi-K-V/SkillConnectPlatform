import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.service";

function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleRegister = async () => {
    await api.post("/auth/register", form);
    navigate("/login");
  };
  return (
    <div>
      <h2>Register To SkillConnect</h2>
      <input
        type="text"
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />
      <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
        <option value="">Select Role</option>
        <option value="worker">Worker</option>
        <option value="client">Client</option>
      </select>
      {form.role === "worker" && (
        <select
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select Category</option>
          <option value="electrician">Electrician</option>
          <option value="plumber">Plumber</option>
          <option value="cleaner">Cleaner</option>
          <option value="cook">Cook</option>
        </select>
      )}
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
