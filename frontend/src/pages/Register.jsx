// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api.services.js";
// import { LanguageContext } from "../context/LanguageContext.jsx";

// function Register() {
//   const [form, setForm] = useState({});
//   const navigate = useNavigate();
//   const { t } = useContext(LanguageContext);

//   const handleRegister = async () => {
//     try {
//       await api.post("/auth/register", form);
//       navigate("/login");
//     } catch (err) {
//       alert("Registration failed");
//     }
//   };

//   return (
//     <div>
//       <h2>{t("register")}</h2>
//       <div className="mt-4 flex flex-col gap-4">
//         {t("name")} :{" "}
//         <input
//           placeholder={t("name")}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />
//         <div className="flex flex-col gap-2 mt-10">
//           {t("Email")} :{" "}
//           <input
//             placeholder={t("email")}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />
//         </div>
//         <div className="flex flex-col gap-2 mt-10">
//           {t("Password")} :{" "}
//           <input
//             type="password"
//             placeholder={t("password")}
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//           />
//         </div>
//         <div className="flex flex-col gap-2 mt-10">
//           {t("Role")}:{" "}
//           <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
//             <option value="">{t("selectRole")}</option>
//             <option value="worker">{t("worker")}</option>
//             <option value="client">{t("client")}</option>
//           </select>
//         </div>
//         <br />
//         <div className="m-2 p-3 ">
//           <button onClick={handleRegister}>{t("register")}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Register;
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.services.js";
import { LanguageContext } from "../context/LanguageContext.jsx";

function Register() {
  const [form, setForm] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const handleRegister = async () => {
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rg-root {
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          min-height: 100vh;
          width: 100%;
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }

        .rg-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,241,53,0.065) 0%, transparent 70%);
          top: -130px; left: -100px;
          pointer-events: none;
        }
        .rg-glow2 {
          position: absolute;
          width: 380px; height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          pointer-events: none;
        }

        .rg-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: #141414;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px 36px;
          z-index: 1;
        }

        .rg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 30px;
        }
        .rg-brand-dot {
          width: 34px; height: 34px;
          background: #c8f135;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .rg-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 16px;
          color: #fff; letter-spacing: -0.3px;
        }

        .rg-heading {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 700;
          color: #fff; letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .rg-sub {
          font-size: 13.5px;
          color: rgba(255,255,255,0.32);
          margin-bottom: 28px;
        }

        .rg-field { margin-bottom: 14px; }

        .rg-label {
          display: block;
          font-size: 11.5px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: rgba(255,255,255,0.32);
          margin-bottom: 7px;
        }

        .rg-input-wrap { position: relative; display: flex; align-items: center; }

        .rg-input {
          width: 100%;
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14px; color: #fff;
          font-family: 'Manrope', sans-serif;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          appearance: none;
        }
        .rg-input::placeholder { color: rgba(255,255,255,0.2); }
        .rg-input:focus {
          border-color: #c8f135;
          box-shadow: 0 0 0 3px rgba(200,241,53,0.1);
        }
        .rg-input.has-icon { padding-right: 46px; }

        /* custom select arrow */
        .rg-select-wrap { position: relative; }
        .rg-select-wrap::after {
          content: '';
          position: absolute;
          right: 16px; top: 50%;
          transform: translateY(-50%);
          width: 0; height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid rgba(255,255,255,0.35);
          pointer-events: none;
        }
        .rg-input option {
          background: #1e1e1e;
          color: #fff;
        }

        .rg-eye {
          position: absolute; right: 14px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex; align-items: center; padding: 0;
          transition: color 0.15s;
        }
        .rg-eye:hover { color: rgba(255,255,255,0.7); }

        /* role pills */
        .rg-role-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .rg-role-pill {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 8px;
          padding: 16px 12px;
          background: #1e1e1e;
          border: 1.5px solid rgba(255,255,255,0.09);
          border-radius: 13px;
          cursor: pointer;
          transition: all 0.16s ease;
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px; font-weight: 600;
          color: rgba(255,255,255,0.45);
        }
        .rg-role-pill:hover { border-color: rgba(255,255,255,0.2); color: rgba(255,255,255,0.75); }
        .rg-role-pill.selected {
          border-color: #c8f135;
          background: rgba(200,241,53,0.07);
          color: #c8f135;
        }
        .rg-role-pill svg { transition: stroke 0.16s; }
        .rg-role-pill.selected svg { stroke: #c8f135; }

        .rg-btn {
          width: 100%;
          background: #c8f135; color: #0d0d0d;
          font-family: 'Manrope', sans-serif;
          font-size: 14.5px; font-weight: 700;
          border: none; border-radius: 12px;
          padding: 14px;
          cursor: pointer; margin-top: 20px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: opacity 0.15s, transform 0.15s;
        }
        .rg-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(0.99); }
        .rg-btn:active:not(:disabled) { transform: scale(0.97); }
        .rg-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .rg-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0d0d0d;
          border-radius: 50%;
          animation: rg-spin 0.7s linear infinite;
        }
        @keyframes rg-spin { to { transform: rotate(360deg); } }

        .rg-divider {
          display: flex; align-items: center; gap: 12px;
          margin: 24px 0;
        }
        .rg-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .rg-divider-text { font-size: 12px; color: rgba(255,255,255,0.2); font-weight: 500; }

        .rg-login {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }
        .rg-login-text { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.4; }
        .rg-login-text strong { display: block; color: rgba(255,255,255,0.65); font-size: 13.5px; margin-bottom: 2px; }
        .rg-login-btn {
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 13px; font-weight: 600;
          border-radius: 10px; padding: 9px 16px;
          cursor: pointer; white-space: nowrap; flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .rg-login-btn:hover { background: #2a2a2a; border-color: rgba(255,255,255,0.18); }

        @media (max-width: 480px) {
          .rg-card { padding: 30px 20px 28px; border-radius: 20px; }
          .rg-heading { font-size: 22px; }
          .rg-login { flex-direction: column; align-items: flex-start; }
          .rg-login-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="rg-root">
        <div className="rg-glow" />
        <div className="rg-glow2" />

        <div className="rg-card">
          {/* Brand */}
          <div className="rg-brand">
            <div className="rg-brand-dot">
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 14, height: 14 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="rg-brand-name">SkillConnect</span>
          </div>

          <h2 className="rg-heading">{t("register")}</h2>
          <p className="rg-sub">Create your account and get started.</p>

          {/* Name */}
          <div className="rg-field">
            <label className="rg-label">{t("name")}</label>
            <div className="rg-input-wrap">
              <input
                className="rg-input"
                placeholder={t("name")}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="rg-field">
            <label className="rg-label">{t("Email")}</label>
            <div className="rg-input-wrap">
              <input
                className="rg-input"
                type="email"
                placeholder={t("email")}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="rg-field">
            <label className="rg-label">{t("Password")}</label>
            <div className="rg-input-wrap">
              <input
                className={`rg-input has-icon`}
                type={showPass ? "text" : "password"}
                placeholder={t("password")}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
              />
              <button
                className="rg-eye"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: 17, height: 17 }}
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: 17, height: 17 }}
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Role — pill picker */}
          <div className="rg-field">
            <label className="rg-label">{t("Role")}</label>
            <div className="rg-role-group">
              <button
                className={`rg-role-pill ${form.role === "worker" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, role: "worker" })}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  style={{ width: 22, height: 22 }}
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                {t("worker")}
              </button>
              <button
                className={`rg-role-pill ${form.role === "client" ? "selected" : ""}`}
                onClick={() => setForm({ ...form, role: "client" })}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  style={{ width: 22, height: 22 }}
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {t("client")}
              </button>
            </div>
            {/* hidden select keeps original onChange behavior for form submission */}
            <select
              style={{ display: "none" }}
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="">{t("selectRole")}</option>
              <option value="worker">{t("worker")}</option>
              <option value="client">{t("client")}</option>
            </select>
          </div>

          {/* Submit */}
          <button
            className="rg-btn"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="rg-spinner" /> Creating account…
              </>
            ) : (
              <>
                {t("register")}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ width: 15, height: 15 }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="rg-divider">
            <div className="rg-divider-line" />
            <span className="rg-divider-text">OR</span>
            <div className="rg-divider-line" />
          </div>

          {/* Login prompt */}
          <div className="rg-login">
            <div className="rg-login-text">
              <strong>Already have an account?</strong>
              Sign in to continue.
            </div>
            <button className="rg-login-btn" onClick={() => navigate("/login")}>
              {t("login")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
