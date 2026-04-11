// import { useState, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../services/api.services.js";
// import { LanguageContext } from "../context/LanguageContext.jsx";

// function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const navigate = useNavigate();
//   const { t } = useContext(LanguageContext);

//   const handleLogin = async () => {
//     try {
//       const res = await api.post("/auth/login", {
//         email,
//         password,
//       });

//       localStorage.setItem("token", res.data.token);

//       res.data.role === "worker"
//         ? navigate("/worker/dashboard")
//         : navigate("/client/dashboard");
//     } catch (err) {
//       alert("Login failed");
//       console.log(err);
//     }
//   };

//   return (
//     <div>
//       <h2>{t("login")}</h2>

//       <input
//         type="email"
//         placeholder={t("email")}
//         onChange={(e) => setEmail(e.target.value)}
//       />

//       <input
//         type="password"
//         placeholder={t("password")}
//         onChange={(e) => setPassword(e.target.value)}
//       />

//       <button onClick={handleLogin}>{t("login")}</button>
//       <div>
//         <div>
//           <h3>{t("dont have account?")}</h3>
//           <button onClick={() => navigate("/register")}>{t("register")}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.services.js";
import { LanguageContext } from "../context/LanguageContext.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      res.data.role === "worker"
        ? navigate("/worker/dashboard")
        : navigate("/client/dashboard");
    } catch (err) {
      alert("Login failed");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
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

        /* subtle background glow */
        .lg-glow {
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,241,53,0.07) 0%, transparent 70%);
          top: -120px;
          right: -140px;
          pointer-events: none;
        }
        .lg-glow2 {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%);
          bottom: -80px;
          left: -80px;
          pointer-events: none;
        }

        .lg-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: #141414;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 36px 36px;
          z-index: 1;
        }

        /* brand */
        .lg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 32px;
        }
        .lg-brand-dot {
          width: 34px;
          height: 34px;
          background: #c8f135;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lg-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #fff;
          letter-spacing: -0.3px;
        }

        .lg-heading {
          font-family: 'Syne', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.5px;
          margin-bottom: 6px;
        }
        .lg-sub {
          font-size: 13.5px;
          color: rgba(255,255,255,0.32);
          margin-bottom: 32px;
        }

        /* form */
        .lg-field {
          margin-bottom: 16px;
        }
        .lg-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
        }
        .lg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .lg-input {
          width: 100%;
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 14px;
          color: #fff;
          font-family: 'Manrope', sans-serif;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .lg-input::placeholder { color: rgba(255,255,255,0.2); }
        .lg-input:focus {
          border-color: #c8f135;
          box-shadow: 0 0 0 3px rgba(200,241,53,0.1);
        }
        .lg-input.has-icon { padding-right: 46px; }

        .lg-eye {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          display: flex;
          align-items: center;
          padding: 0;
          transition: color 0.15s;
        }
        .lg-eye:hover { color: rgba(255,255,255,0.7); }

        /* submit */
        .lg-btn {
          width: 100%;
          background: #c8f135;
          color: #0d0d0d;
          font-family: 'Manrope', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          border: none;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.15s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .lg-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(0.99); }
        .lg-btn:active:not(:disabled) { transform: scale(0.97); }
        .lg-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* spinner */
        .lg-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(0,0,0,0.2);
          border-top-color: #0d0d0d;
          border-radius: 50%;
          animation: lg-spin 0.7s linear infinite;
        }
        @keyframes lg-spin { to { transform: rotate(360deg); } }

        /* divider */
        .lg-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }
        .lg-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .lg-divider-text {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          font-weight: 500;
        }

        /* register prompt */
        .lg-register {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .lg-register-text {
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          line-height: 1.4;
        }
        .lg-register-text strong {
          display: block;
          color: rgba(255,255,255,0.65);
          font-size: 13.5px;
          margin-bottom: 2px;
        }
        .lg-register-btn {
          background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          padding: 9px 16px;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s, border-color 0.15s;
        }
        .lg-register-btn:hover {
          background: #2a2a2a;
          border-color: rgba(255,255,255,0.18);
        }

        @media (max-width: 480px) {
          .lg-card { padding: 30px 22px 28px; border-radius: 20px; }
          .lg-heading { font-size: 22px; }
          .lg-register { flex-direction: column; align-items: flex-start; }
          .lg-register-btn { width: 100%; text-align: center; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-glow" />
        <div className="lg-glow2" />

        <div className="lg-card">
          {/* Brand */}
          <div className="lg-brand">
            <div className="lg-brand-dot">
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 14, height: 14 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="lg-brand-name">SkillConnect</span>
          </div>

          {/* Heading */}
          <h2 className="lg-heading">{t("login")}</h2>
          <p className="lg-sub">Welcome back — sign in to continue.</p>

          {/* Email */}
          <div className="lg-field">
            <label className="lg-label">{t("email")}</label>
            <div className="lg-input-wrap">
              <input
                className="lg-input"
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="lg-field">
            <label className="lg-label">{t("password")}</label>
            <div className="lg-input-wrap">
              <input
                className="lg-input has-icon"
                type={showPass ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
              <button
                className="lg-eye"
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

          {/* Submit */}
          <button className="lg-btn" onClick={handleLogin} disabled={loading}>
            {loading ? (
              <>
                <div className="lg-spinner" /> Signing in…
              </>
            ) : (
              <>
                {t("login")}
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
          <div className="lg-divider">
            <div className="lg-divider-line" />
            <span className="lg-divider-text">OR</span>
            <div className="lg-divider-line" />
          </div>

          {/* Register */}
          <div className="lg-register">
            <div className="lg-register-text">
              <strong>{t("dont have account?")}</strong>
              Create one in seconds.
            </div>
            <button
              className="lg-register-btn"
              onClick={() => navigate("/register")}
            >
              {t("register")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
