// src/pages/SelectLanguage.jsx
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ta", label: "Tamil", native: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "Telugu", native: "తెలుగు", flag: "🇮🇳" },
  { code: "ml", label: "Malayalam", native: "മലയാളം", flag: "🇮🇳" },
  { code: "mr", label: "Marathi", native: "मराठी", flag: "🇮🇳" },
];

function SelectLanguage() {
  const { setLang, t } = useContext(LanguageContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const selectLanguage = (lang) => {
    setLang(lang);
    // ✅ Clear any stale session — SelectLanguage is always a fresh start
    logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sl-root {
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          min-height: 100vh; width: 100%;
          background: #0d0d0d;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 16px;
          position: relative; overflow: hidden;
        }
        .sl-glow  { position:absolute; width:480px; height:480px; border-radius:50%; background:radial-gradient(circle,rgba(200,241,53,0.07) 0%,transparent 70%); top:-100px; right:-100px; pointer-events:none; }
        .sl-glow2 { position:absolute; width:360px; height:360px; border-radius:50%; background:radial-gradient(circle,rgba(167,139,250,0.06) 0%,transparent 70%); bottom:-80px; left:-80px; pointer-events:none; }

        .sl-card {
          position:relative; width:100%; max-width:460px;
          background:#141414; border:1px solid rgba(255,255,255,0.08);
          border-radius:24px; padding:40px 36px 36px; z-index:1;
        }
        .sl-brand { display:flex; align-items:center; gap:10px; margin-bottom:32px; }
        .sl-brand-dot { width:34px; height:34px; background:#c8f135; border-radius:9px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .sl-brand-name { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; color:#fff; letter-spacing:-0.3px; }

        .sl-heading { font-family:'Syne',sans-serif; font-size:26px; font-weight:700; color:#fff; letter-spacing:-0.5px; margin-bottom:6px; }
        .sl-sub { font-size:13.5px; color:rgba(255,255,255,0.32); margin-bottom:28px; line-height:1.5; }

        .sl-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        .sl-lang-btn {
          display:flex; align-items:center; gap:11px;
          padding:14px 16px;
          background:#1e1e1e; border:1.5px solid rgba(255,255,255,0.08);
          border-radius:13px; cursor:pointer;
          transition:all 0.18s ease;
          text-align:left; width:100%;
          font-family:'Manrope',sans-serif;
        }
        .sl-lang-btn:hover {
          border-color:#c8f135;
          background:rgba(200,241,53,0.07);
          transform:translateY(-2px);
          box-shadow:0 8px 20px rgba(0,0,0,0.3);
        }
        .sl-lang-btn:active { transform:translateY(0); }

        .sl-flag { font-size:22px; line-height:1; flex-shrink:0; }
        .sl-lang-info { min-width:0; }
        .sl-lang-native { font-size:14px; font-weight:600; color:#fff; display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .sl-lang-label  { font-size:11.5px; color:rgba(255,255,255,0.3); display:block; margin-top:1px; }

        .sl-lang-btn:hover .sl-lang-native { color:#c8f135; }
        .sl-lang-btn:hover .sl-lang-label  { color:rgba(200,241,53,0.5); }

        .sl-lang-btn.sl-featured {
          grid-column:1/-1;
          border-color:rgba(200,241,53,0.25);
          background:rgba(200,241,53,0.05);
        }
        .sl-lang-btn.sl-featured .sl-lang-native { color:#c8f135; }
        .sl-lang-btn.sl-featured .sl-lang-label  { color:rgba(200,241,53,0.45); }
        .sl-lang-btn.sl-featured:hover { border-color:#c8f135; background:rgba(200,241,53,0.1); }

        .sl-divider { display:flex; align-items:center; gap:12px; margin:24px 0 0; }
        .sl-divider-line { flex:1; height:1px; background:rgba(255,255,255,0.07); }
        .sl-divider-text { font-size:11.5px; color:rgba(255,255,255,0.18); font-weight:500; }

        @media(max-width:480px) {
          .sl-card { padding:30px 20px 28px; border-radius:20px; }
          .sl-heading { font-size:22px; }
          .sl-grid { grid-template-columns:1fr; }
          .sl-lang-btn.sl-featured { grid-column:1; }
        }
      `}</style>

      <div className="sl-root">
        <div className="sl-glow" />
        <div className="sl-glow2" />

        <div className="sl-card">
          <div className="sl-brand">
            <div className="sl-brand-dot">
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 14, height: 14 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="sl-brand-name">SkillConnect</span>
          </div>

          <h2 className="sl-heading">{t("selectLanguage")}</h2>
          <p className="sl-sub">Choose your preferred language to continue.</p>

          <div className="sl-grid">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                className={`sl-lang-btn ${lang.code === "en" ? "sl-featured" : ""}`}
                onClick={() => selectLanguage(lang.code)}
              >
                <span className="sl-flag">{lang.flag}</span>
                <span className="sl-lang-info">
                  <span className="sl-lang-native">{lang.native}</span>
                  <span className="sl-lang-label">{lang.label}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="sl-divider">
            <div className="sl-divider-line" />
            <span className="sl-divider-text">
              You can change this later in Settings
            </span>
            <div className="sl-divider-line" />
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectLanguage;
