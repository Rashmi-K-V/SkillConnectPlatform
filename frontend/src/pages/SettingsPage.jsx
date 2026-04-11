import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext.jsx";
import api from "../services/api.services.js";

// ── decode role from JWT in localStorage (no extra context needed) ──
function getRoleFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

const LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "mr", label: "Marathi", native: "मराठी" },
];

const TABS = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "security", label: "Security", icon: "lock" },
  { id: "language", label: "Language", icon: "globe" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "financial", label: "Financial", icon: "rupee" },
];

function Icon({ name, size = 16 }) {
  const s = { width: size, height: size };
  const icons = {
    user: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    lock: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    globe: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    bell: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    rupee: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    camera: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
    check: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        style={s}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    chevron: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={s}
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    ),
    logout: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    shield: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        style={s}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };
  return icons[name] || null;
}

function Toast({ message, type = "success" }) {
  return (
    <div className={`sp-toast sp-toast-${type}`}>
      {type === "success" && <Icon name="check" size={14} />}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const role = getRoleFromToken(); // "worker" | "client" | null
  const { lang, setLang, t } = useContext(LanguageContext);
  const navigate = useNavigate();
  const fileRef = useRef();

  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // Profile
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploaded, setAvatarUploaded] = useState(false);

  // Security
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  // Notifications
  const [notifs, setNotifs] = useState({
    jobAlerts: true,
    messages: true,
    payments: true,
    promotions: false,
  });

  // Financial (worker = payout, client = billing)
  const [financial, setFinancial] = useState({
    upiId: "",
    bankName: "",
    accountNo: "",
    ifsc: "",
    cardLast4: "",
    billingName: "",
  });

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setProfile({ name: res.data.name || "", email: res.data.email || "" });
        if (res.data.avatar) {
          setAvatarPreview(res.data.avatar);
          setAvatarUploaded(true);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("avatar", avatarFile);
      await api.post("/auth/avatar", fd);
      setAvatarUploaded(true);
      setAvatarFile(null);
      showToast("Profile photo updated!");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.put("/auth/profile", profile);
      showToast("Profile saved!");
    } catch {
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (passwords.next !== passwords.confirm) {
      showToast("Passwords don't match", "error");
      return;
    }
    setSaving(true);
    try {
      await api.put("/auth/password", {
        current: passwords.current,
        password: passwords.next,
      });
      setPasswords({ current: "", next: "", confirm: "" });
      showToast("Password updated!");
    } catch {
      showToast("Incorrect current password", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleFinancialSave = async () => {
    setSaving(true);
    try {
      await api.put("/auth/financial", financial);
      showToast(
        role === "worker" ? "Payout details saved!" : "Billing details saved!",
      );
    } catch {
      showToast("Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sp-root {
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          min-height: 100vh;
          background: #0d0d0d;
          display: flex; flex-direction: column;
        }

        /* TOPBAR */
        .sp-topbar {
          height: 56px; flex-shrink: 0;
          display: flex; align-items: center;
          padding: 0 28px; gap: 12px;
          background: #141414;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sp-brand { display: flex; align-items: center; gap: 9px; }
        .sp-brand-dot {
          width: 30px; height: 30px; background: #c8f135;
          border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .sp-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 15px; color: #fff; letter-spacing: -0.3px;
        }
        .sp-topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
        .sp-role-badge {
          font-size: 11px; font-weight: 600; text-transform: capitalize;
          padding: 4px 11px; border-radius: 20px;
          background: rgba(200,241,53,0.1); color: #c8f135;
          border: 1px solid rgba(200,241,53,0.2);
        }
        .sp-logout-btn {
          display: flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.45);
          font-family: 'Manrope', sans-serif;
          font-size: 12.5px; font-weight: 600;
          border-radius: 9px; padding: 7px 13px;
          cursor: pointer; transition: all 0.15s;
        }
        .sp-logout-btn:hover { background: rgba(239,68,68,0.1); color: #f87171; border-color: rgba(239,68,68,0.2); }

        /* BODY */
        .sp-body {
          flex: 1; display: flex;
          max-width: 920px; margin: 0 auto;
          width: 100%; padding: 32px 24px 60px;
          gap: 24px;
        }

        /* SIDEBAR NAV */
        .sp-sidenav {
          width: 200px; flex-shrink: 0;
          display: flex; flex-direction: column; gap: 2px;
        }
        .sp-sidenav-title {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: rgba(255,255,255,0.2);
          padding: 0 12px; margin-bottom: 8px;
        }
        .sp-nav-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: rgba(255,255,255,0.4);
          background: none; border: none; cursor: pointer;
          text-align: left; width: 100%;
          transition: all 0.14s ease;
        }
        .sp-nav-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .sp-nav-btn.active { background: #c8f135; color: #0d0d0d; font-weight: 600; }
        .sp-nav-btn.active svg { stroke: #0d0d0d; }

        /* CONTENT PANEL */
        .sp-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 16px; }

        .sp-section {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; padding: 24px;
        }

        .sp-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 15px; font-weight: 700; color: #fff;
          margin-bottom: 4px;
        }
        .sp-section-sub {
          font-size: 12.5px; color: rgba(255,255,255,0.3);
          margin-bottom: 20px; line-height: 1.5;
        }

        /* AVATAR */
        .sp-avatar-row {
          display: flex; align-items: center; gap: 18px;
          margin-bottom: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sp-avatar-wrap { position: relative; cursor: pointer; }
        .sp-avatar-img {
          width: 72px; height: 72px; border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .sp-avatar-placeholder {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg,#f97316,#ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 700; color: #fff;
          border: 2px solid rgba(255,255,255,0.1);
        }
        .sp-avatar-overlay {
          position: absolute; inset: 0; border-radius: 50%;
          background: rgba(0,0,0,0.55);
          display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s;
          color: #fff;
        }
        .sp-avatar-wrap:hover .sp-avatar-overlay { opacity: 1; }

        .sp-avatar-info { flex: 1; }
        .sp-avatar-name {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 3px;
        }
        .sp-avatar-role { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 10px; }

        .sp-upload-required {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(251,191,36,0.1); color: #fbbf24;
          border: 1px solid rgba(251,191,36,0.2);
          border-radius: 8px; padding: 5px 11px;
          font-size: 11.5px; font-weight: 600;
        }
        .sp-upload-verified {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(74,222,128,0.1); color: #4ade80;
          border: 1px solid rgba(74,222,128,0.2);
          border-radius: 8px; padding: 5px 11px;
          font-size: 11.5px; font-weight: 600;
        }

        .sp-upload-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: #1e1e1e; border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-family: 'Manrope', sans-serif; font-size: 12.5px; font-weight: 600;
          border-radius: 9px; padding: 8px 14px;
          cursor: pointer; transition: all 0.15s; margin-right: 8px;
        }
        .sp-upload-btn:hover { border-color: #c8f135; color: #c8f135; }

        /* FIELD */
        .sp-field { margin-bottom: 14px; }
        .sp-label {
          display: block; font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.09em;
          color: rgba(255,255,255,0.28); margin-bottom: 7px;
        }
        .sp-input {
          width: 100%; background: #1e1e1e;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 11px; padding: 12px 14px;
          font-size: 13.5px; color: #fff;
          font-family: 'Manrope', sans-serif;
          outline: none; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .sp-input::placeholder { color: rgba(255,255,255,0.18); }
        .sp-input:focus { border-color: #c8f135; box-shadow: 0 0 0 3px rgba(200,241,53,0.09); }

        .sp-input-wrap { position: relative; display: flex; align-items: center; }
        .sp-input-wrap .sp-input { padding-right: 44px; }
        .sp-eye {
          position: absolute; right: 13px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.28); display: flex; align-items: center;
          transition: color 0.15s; padding: 0;
        }
        .sp-eye:hover { color: rgba(255,255,255,0.7); }

        .sp-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* SAVE BTN */
        .sp-save-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: #c8f135; color: #0d0d0d;
          font-family: 'Manrope', sans-serif;
          font-size: 13.5px; font-weight: 700;
          border: none; border-radius: 11px;
          padding: 12px 24px; cursor: pointer; margin-top: 4px;
          transition: opacity 0.15s, transform 0.15s;
        }
        .sp-save-btn:hover:not(:disabled) { opacity: 0.88; transform: scale(0.99); }
        .sp-save-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .sp-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(0,0,0,0.18);
          border-top-color: #0d0d0d;
          border-radius: 50%;
          animation: sp-spin 0.7s linear infinite;
        }
        @keyframes sp-spin { to { transform: rotate(360deg); } }

        /* LANGUAGE GRID */
        .sp-lang-grid {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 8px;
        }
        .sp-lang-pill {
          display: flex; flex-direction: column;
          padding: 12px 14px; border-radius: 12px;
          background: #1e1e1e;
          border: 1.5px solid rgba(255,255,255,0.07);
          cursor: pointer; transition: all 0.16s;
          font-family: 'Manrope', sans-serif;
        }
        .sp-lang-pill:hover { border-color: rgba(255,255,255,0.2); }
        .sp-lang-pill.active { border-color: #c8f135; background: rgba(200,241,53,0.07); }
        .sp-lang-native { font-size: 14px; font-weight: 600; color: #fff; }
        .sp-lang-label { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .sp-lang-pill.active .sp-lang-native { color: #c8f135; }
        .sp-lang-pill.active .sp-lang-label { color: rgba(200,241,53,0.45); }

        /* TOGGLE */
        .sp-toggle-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sp-toggle-row:last-child { border-bottom: none; padding-bottom: 0; }
        .sp-toggle-label { font-size: 13.5px; font-weight: 500; color: #fff; margin-bottom: 2px; }
        .sp-toggle-sub { font-size: 12px; color: rgba(255,255,255,0.28); }
        .sp-toggle {
          width: 44px; height: 24px; border-radius: 12px;
          border: none; cursor: pointer; position: relative;
          flex-shrink: 0; transition: background 0.2s;
        }
        .sp-toggle.on { background: #c8f135; }
        .sp-toggle.off { background: rgba(255,255,255,0.1); }
        .sp-toggle-knob {
          position: absolute; top: 3px;
          width: 18px; height: 18px; border-radius: 50%;
          background: #fff; transition: left 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .sp-toggle.on .sp-toggle-knob { left: 23px; }
        .sp-toggle.off .sp-toggle-knob { left: 3px; }

        /* TOAST */
        .sp-toast {
          position: fixed; bottom: 28px; right: 28px;
          display: flex; align-items: center; gap: 8px;
          padding: 12px 18px; border-radius: 12px;
          font-size: 13px; font-weight: 600;
          z-index: 999; animation: sp-slidein 0.3s ease;
          font-family: 'Manrope', sans-serif;
        }
        .sp-toast-success { background: #1a2e1a; color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
        .sp-toast-error   { background: #2e1a1a; color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
        @keyframes sp-slidein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* MOBILE */
        .sp-mobile-tabs {
          display: none;
          overflow-x: auto; gap: 6px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #141414;
          scrollbar-width: none;
        }
        .sp-mobile-tabs::-webkit-scrollbar { display: none; }
        .sp-mobile-tab {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 20px;
          background: #1e1e1e; border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.45);
          font-family: 'Manrope', sans-serif;
          font-size: 12.5px; font-weight: 600;
          white-space: nowrap; cursor: pointer; flex-shrink: 0;
          transition: all 0.15s;
        }
        .sp-mobile-tab.active { background: #c8f135; color: #0d0d0d; border-color: #c8f135; }
        .sp-mobile-tab.active svg { stroke: #0d0d0d; }

        @media (max-width: 700px) {
          .sp-sidenav { display: none; }
          .sp-mobile-tabs { display: flex; }
          .sp-body { padding: 20px 16px 48px; }
          .sp-topbar { padding: 0 16px; }
          .sp-row-2 { grid-template-columns: 1fr; }
          .sp-lang-grid { grid-template-columns: repeat(2,1fr); }
        }
      `}</style>

      <div className="sp-root">
        {/* Topbar */}
        <header className="sp-topbar">
          <div className="sp-brand">
            <div className="sp-brand-dot">
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 13, height: 13 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="sp-brand-name">WorkerHub</span>
          </div>
          <div className="sp-topbar-right">
            {role && <span className="sp-role-badge">{role}</span>}
            <button className="sp-logout-btn" onClick={handleLogout}>
              <Icon name="logout" size={14} /> Logout
            </button>
          </div>
        </header>

        {/* Mobile tabs */}
        <div className="sp-mobile-tabs">
          {TABS.filter((tab) => tab.id !== "financial" || role).map((tab) => (
            <button
              key={tab.id}
              className={`sp-mobile-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sp-body">
          {/* Sidebar nav */}
          <nav className="sp-sidenav">
            <div className="sp-sidenav-title">Settings</div>
            {TABS.filter((tab) => tab.id !== "financial" || role).map((tab) => (
              <button
                key={tab.id}
                className={`sp-nav-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Panel */}
          <div className="sp-panel">
            {/* ── PROFILE TAB ── */}
            {activeTab === "profile" && (
              <>
                <div className="sp-section">
                  <div className="sp-section-title">Profile Photo</div>
                  <div className="sp-section-sub">
                    A profile photo is{" "}
                    <strong style={{ color: "#fbbf24" }}>required</strong> for
                    identity verification. Clients and workers must upload a
                    clear photo so others can identify them.
                  </div>

                  <div className="sp-avatar-row">
                    <div
                      className="sp-avatar-wrap"
                      onClick={() => fileRef.current.click()}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="avatar"
                          className="sp-avatar-img"
                        />
                      ) : (
                        <div className="sp-avatar-placeholder">{initials}</div>
                      )}
                      <div className="sp-avatar-overlay">
                        <Icon name="camera" size={20} />
                      </div>
                    </div>
                    <div className="sp-avatar-info">
                      <div className="sp-avatar-name">
                        {profile.name || "Your Name"}
                      </div>
                      <div
                        className="sp-avatar-role"
                        style={{ textTransform: "capitalize" }}
                      >
                        {role || "User"}
                      </div>
                      {avatarUploaded ? (
                        <div className="sp-upload-verified">
                          <Icon name="check" size={12} /> Photo verified
                        </div>
                      ) : (
                        <div className="sp-upload-required">
                          ⚠ Photo required for verification
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleAvatarChange}
                  />
                  <button
                    className="sp-upload-btn"
                    onClick={() => fileRef.current.click()}
                  >
                    <Icon name="camera" size={14} /> Choose photo
                  </button>
                  {avatarFile && (
                    <button
                      className="sp-save-btn"
                      style={{ marginTop: 0 }}
                      onClick={handleAvatarUpload}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <div className="sp-spinner" /> Uploading…
                        </>
                      ) : (
                        <>
                          <Icon name="check" size={14} /> Upload photo
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="sp-section">
                  <div className="sp-section-title">Personal Info</div>
                  <div className="sp-section-sub">
                    Update your name and email address.
                  </div>

                  <div className="sp-row-2">
                    <div className="sp-field">
                      <label className="sp-label">Full Name</label>
                      <input
                        className="sp-input"
                        placeholder="Your name"
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="sp-field">
                      <label className="sp-label">Email</label>
                      <input
                        className="sp-input"
                        type="email"
                        placeholder="you@email.com"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <button
                    className="sp-save-btn"
                    onClick={handleProfileSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="sp-spinner" /> Saving…
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} /> Save changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ── SECURITY TAB ── */}
            {activeTab === "security" && (
              <div className="sp-section">
                <div className="sp-section-title">Change Password</div>
                <div className="sp-section-sub">
                  Use a strong password you don't use elsewhere.
                </div>

                {["current", "next", "confirm"].map((key) => (
                  <div className="sp-field" key={key}>
                    <label className="sp-label">
                      {key === "current"
                        ? "Current Password"
                        : key === "next"
                          ? "New Password"
                          : "Confirm New Password"}
                    </label>
                    <div className="sp-input-wrap">
                      <input
                        className="sp-input"
                        type={showPw[key] ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords[key]}
                        onChange={(e) =>
                          setPasswords({ ...passwords, [key]: e.target.value })
                        }
                      />
                      <button
                        className="sp-eye"
                        onClick={() =>
                          setShowPw({ ...showPw, [key]: !showPw[key] })
                        }
                        tabIndex={-1}
                      >
                        {showPw[key] ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{ width: 16, height: 16 }}
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
                            style={{ width: 16, height: 16 }}
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  className="sp-save-btn"
                  onClick={handlePasswordSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="sp-spinner" /> Updating…
                    </>
                  ) : (
                    <>
                      <Icon name="shield" size={14} /> Update password
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── LANGUAGE TAB ── */}
            {activeTab === "language" && (
              <div className="sp-section">
                <div className="sp-section-title">Language</div>
                <div className="sp-section-sub">
                  Choose the language for the app interface.
                </div>

                <div className="sp-lang-grid">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`sp-lang-pill ${lang === l.code ? "active" : ""}`}
                      onClick={() => {
                        setLang(l.code);
                        showToast(`Language set to ${l.label}`);
                      }}
                    >
                      <span className="sp-lang-native">{l.native}</span>
                      <span className="sp-lang-label">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── NOTIFICATIONS TAB ── */}
            {activeTab === "notifications" && (
              <div className="sp-section">
                <div className="sp-section-title">Notifications</div>
                <div className="sp-section-sub">
                  Manage what alerts you receive.
                </div>

                {[
                  {
                    key: "jobAlerts",
                    label: "Job Alerts",
                    sub:
                      role === "worker"
                        ? "New job requests matching your skills"
                        : "Updates on your service bookings",
                  },
                  {
                    key: "messages",
                    label: "Messages",
                    sub: "New messages from clients or workers",
                  },
                  {
                    key: "payments",
                    label: "Payments",
                    sub: "Payment confirmations and receipts",
                  },
                  {
                    key: "promotions",
                    label: "Promotions",
                    sub: "Tips, offers and platform updates",
                  },
                ].map(({ key, label, sub }) => (
                  <div className="sp-toggle-row" key={key}>
                    <div>
                      <div className="sp-toggle-label">{label}</div>
                      <div className="sp-toggle-sub">{sub}</div>
                    </div>
                    <button
                      className={`sp-toggle ${notifs[key] ? "on" : "off"}`}
                      onClick={() =>
                        setNotifs({ ...notifs, [key]: !notifs[key] })
                      }
                    >
                      <div className="sp-toggle-knob" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* ── FINANCIAL TAB ── */}
            {activeTab === "financial" && role === "worker" && (
              <div className="sp-section">
                <div className="sp-section-title">Payout Details</div>
                <div className="sp-section-sub">
                  Enter your bank or UPI details to receive payments.
                </div>

                <div className="sp-field">
                  <label className="sp-label">UPI ID</label>
                  <input
                    className="sp-input"
                    placeholder="yourname@upi"
                    value={financial.upiId}
                    onChange={(e) =>
                      setFinancial({ ...financial, upiId: e.target.value })
                    }
                  />
                </div>

                <div
                  style={{
                    margin: "8px 0 14px",
                    fontSize: 11.5,
                    color: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                  or bank account
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "rgba(255,255,255,0.06)",
                    }}
                  />
                </div>

                <div className="sp-row-2">
                  <div className="sp-field">
                    <label className="sp-label">Bank Name</label>
                    <input
                      className="sp-input"
                      placeholder="e.g. SBI"
                      value={financial.bankName}
                      onChange={(e) =>
                        setFinancial({ ...financial, bankName: e.target.value })
                      }
                    />
                  </div>
                  <div className="sp-field">
                    <label className="sp-label">IFSC Code</label>
                    <input
                      className="sp-input"
                      placeholder="e.g. SBIN0001234"
                      value={financial.ifsc}
                      onChange={(e) =>
                        setFinancial({ ...financial, ifsc: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="sp-field">
                  <label className="sp-label">Account Number</label>
                  <input
                    className="sp-input"
                    placeholder="Your account number"
                    value={financial.accountNo}
                    onChange={(e) =>
                      setFinancial({ ...financial, accountNo: e.target.value })
                    }
                  />
                </div>

                <button
                  className="sp-save-btn"
                  onClick={handleFinancialSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="sp-spinner" /> Saving…
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} /> Save payout details
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === "financial" && role === "client" && (
              <div className="sp-section">
                <div className="sp-section-title">Billing Details</div>
                <div className="sp-section-sub">
                  Manage your payment method for hiring workers.
                </div>

                <div className="sp-field">
                  <label className="sp-label">Cardholder Name</label>
                  <input
                    className="sp-input"
                    placeholder="Name on card"
                    value={financial.billingName}
                    onChange={(e) =>
                      setFinancial({
                        ...financial,
                        billingName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="sp-field">
                  <label className="sp-label">Card Number (last 4)</label>
                  <input
                    className="sp-input"
                    placeholder="•••• •••• •••• 1234"
                    maxLength={4}
                    value={financial.cardLast4}
                    onChange={(e) =>
                      setFinancial({ ...financial, cardLast4: e.target.value })
                    }
                  />
                </div>

                <button
                  className="sp-save-btn"
                  onClick={handleFinancialSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="sp-spinner" /> Saving…
                    </>
                  ) : (
                    <>
                      <Icon name="check" size={14} /> Save billing details
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </>
  );
}
