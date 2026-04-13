// src/pages/SettingsPage.jsx
import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../context/LanguageContext.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import api from "../services/api.services.js";

function getRoleFromToken() {
  try {
    const p = JSON.parse(atob(localStorage.getItem("token").split(".")[1]));
    return p.role || null;
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
        <rect x="3" y="11" width="18" height="11" rx="2" />
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
  };
  return icons[name] || null;
}

function Toast({ message, type = "success" }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 28,
        right: 28,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 18px",
        borderRadius: 12,
        fontSize: 13,
        fontWeight: 600,
        zIndex: 999,
        fontFamily: "'Manrope',sans-serif",
        background: type === "success" ? "#1a2e1a" : "#2e1a1a",
        color: type === "success" ? "#4ade80" : "#f87171",
        border: `1px solid ${type === "success" ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
      }}
    >
      {type === "success" && <Icon name="check" size={14} />}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const role = getRoleFromToken();
  const { lang, setLang, t } = useContext(LanguageContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileRef = useRef();

  const [activeTab, setActiveTab] = useState("profile");
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUploaded, setAvatarUploaded] = useState(false);
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
  const [notifs, setNotifs] = useState({
    jobAlerts: true,
    messages: true,
    payments: true,
    promotions: false,
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
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
      showToast("Failed to save", "error");
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

  const initials = profile.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const s = {
    root: {
      fontFamily: "'Manrope','Segoe UI',sans-serif",
      minHeight: "100vh",
      background: "#0d0d0d",
      display: "flex",
      flexDirection: "column",
    },
    topbar: {
      height: 56,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      padding: "0 28px",
      gap: 12,
      background: "#141414",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    brand: { display: "flex", alignItems: "center", gap: 9 },
    brandDot: {
      width: 30,
      height: 30,
      background: "#c8f135",
      borderRadius: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    brandName: {
      fontFamily: "'Syne',sans-serif",
      fontWeight: 700,
      fontSize: 15,
      color: "#fff",
      letterSpacing: "-0.3px",
    },
    body: {
      flex: 1,
      display: "flex",
      maxWidth: 920,
      margin: "0 auto",
      width: "100%",
      padding: "32px 24px 60px",
      gap: 24,
    },
    sidenav: {
      width: 200,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      gap: 2,
    },
    navTitle: {
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      color: "rgba(255,255,255,0.2)",
      padding: "0 12px",
      marginBottom: 8,
    },
    navBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 12px",
      borderRadius: 10,
      fontFamily: "'Manrope',sans-serif",
      fontSize: 13.5,
      fontWeight: 500,
      color: active ? "#0d0d0d" : "rgba(255,255,255,0.4)",
      background: active ? "#c8f135" : "none",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      width: "100%",
      transition: "all 0.14s",
    }),
    panel: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: 16,
    },
    section: {
      background: "#141414",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18,
      padding: 24,
    },
    sTitle: {
      fontFamily: "'Syne',sans-serif",
      fontSize: 15,
      fontWeight: 700,
      color: "#fff",
      marginBottom: 4,
    },
    sSub: {
      fontSize: 12.5,
      color: "rgba(255,255,255,0.3)",
      marginBottom: 20,
      lineHeight: 1.5,
    },
    lb: {
      display: "block",
      fontSize: 11.5,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.09em",
      color: "rgba(255,255,255,0.32)",
      marginBottom: 7,
    },
    inp: {
      width: "100%",
      background: "#1e1e1e",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 12,
      padding: "12px 14px",
      fontSize: 14,
      color: "#fff",
      fontFamily: "'Manrope',sans-serif",
      outline: "none",
      transition: "border-color 0.18s,box-shadow 0.18s",
      boxSizing: "border-box",
    },
    saveBtn: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      background: "#c8f135",
      color: "#0d0d0d",
      fontFamily: "'Manrope',sans-serif",
      fontSize: 13.5,
      fontWeight: 700,
      border: "none",
      borderRadius: 11,
      padding: "12px 24px",
      cursor: "pointer",
      marginTop: 4,
      transition: "opacity 0.15s",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .sp-navbtn:hover{background:rgba(255,255,255,0.05)!important;color:rgba(255,255,255,0.8)!important;}
        .sp-navbtn.active:hover{background:#c8f135!important;}
        .sp-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.1)!important;}
        .sp-lang-pill:hover{border-color:rgba(255,255,255,0.2)!important;}
        .sp-mob-tab{display:none;overflow-x:auto;gap:6px;padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.06);background:#141414;scrollbar-width:none;}
        .sp-mob-tab-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:20px;background:#1e1e1e;border:1px solid rgba(255,255,255,0.07);color:rgba(255,255,255,0.45);font-family:'Manrope',sans-serif;font-size:12.5px;font-weight:600;white-space:nowrap;cursor:pointer;flex-shrink:0;transition:all 0.15s;}
        .sp-mob-tab-btn.active{background:#c8f135;color:#0d0d0d;border-color:#c8f135;}
        .sp-logout-btn:hover{background:rgba(239,68,68,0.1)!important;color:#f87171!important;border-color:rgba(239,68,68,0.2)!important;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:700px){
          .sp-sidenav{display:none!important;}
          .sp-mob-tab{display:flex!important;}
          .sp-body{padding:20px 16px 48px!important;}
          .sp-topbar{padding:0 16px!important;}
          .sp-row2{grid-template-columns:1fr!important;}
          .sp-lang-grid{grid-template-columns:repeat(2,1fr)!important;}
        }
      `}</style>

      <div style={s.root}>
        {/* Topbar */}
        <header className="sp-topbar" style={s.topbar}>
          <div style={s.brand}>
            <div style={s.brandDot}>
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 13, height: 13 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span style={s.brandName}>SkillConnect</span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {role && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  padding: "4px 11px",
                  borderRadius: 20,
                  background: "rgba(200,241,53,0.1)",
                  color: "#c8f135",
                  border: "1px solid rgba(200,241,53,0.2)",
                }}
              >
                {role}
              </span>
            )}
            {/* ✅ LOGOUT BUTTON */}
            <button
              className="sp-logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.45)",
                fontFamily: "'Manrope',sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                borderRadius: 9,
                padding: "7px 13px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <Icon name="logout" size={14} /> Logout
            </button>
          </div>
        </header>

        {/* Logout confirmation */}
        {showLogoutConfirm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.75)",
              zIndex: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#1a1a1a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 20,
                padding: 28,
                width: "100%",
                maxWidth: 360,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 6,
                }}
              >
                Log out?
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 24,
                }}
              >
                You'll be redirected to the login page.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    background: "rgba(255,255,255,0.07)",
                    border: "none",
                    borderRadius: 10,
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    flex: 2,
                    padding: "11px",
                    background: "#f87171",
                    border: "none",
                    borderRadius: 10,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  Yes, Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile tabs */}
        <div className="sp-mob-tab">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`sp-mob-tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon name={tab.icon} size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sp-body" style={s.body}>
          {/* Sidebar nav */}
          <nav className="sp-sidenav" style={s.sidenav}>
            <div style={s.navTitle}>Settings</div>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`sp-navbtn ${activeTab === tab.id ? "active" : ""}`}
                style={s.navBtn(activeTab === tab.id)}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </nav>

          <div style={s.panel}>
            {/* PROFILE */}
            {activeTab === "profile" && (
              <>
                <div style={s.section}>
                  <div style={s.sTitle}>Profile Photo</div>
                  <div style={{ ...s.sSub, color: "rgba(255,255,255,0.3)" }}>
                    A photo is{" "}
                    <strong style={{ color: "#fbbf24" }}>required</strong> for
                    identity verification.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 18,
                      marginBottom: 20,
                      paddingBottom: 20,
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: "50%",
                        background: avatarPreview
                          ? "transparent"
                          : "linear-gradient(135deg,#f97316,#ec4899)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                        border: "2px solid rgba(255,255,255,0.1)",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                      onClick={() => fileRef.current.click()}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: "#fff",
                          marginBottom: 3,
                          fontFamily: "'Syne',sans-serif",
                        }}
                      >
                        {profile.name || "Your Name"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.32)",
                          textTransform: "capitalize",
                          marginBottom: 8,
                        }}
                      >
                        {role || "User"}
                      </div>
                      {avatarUploaded ? (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "rgba(74,222,128,0.1)",
                            color: "#4ade80",
                            border: "1px solid rgba(74,222,128,0.2)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11.5,
                            fontWeight: 600,
                          }}
                        >
                          <Icon name="check" size={12} />
                          Verified
                        </div>
                      ) : (
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            background: "rgba(251,191,36,0.1)",
                            color: "#fbbf24",
                            border: "1px solid rgba(251,191,36,0.2)",
                            borderRadius: 8,
                            padding: "4px 10px",
                            fontSize: 11.5,
                            fontWeight: 600,
                          }}
                        >
                          ⚠ Photo required
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
                    onClick={() => fileRef.current.click()}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      background: "#1e1e1e",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "'Manrope',sans-serif",
                      fontSize: 12.5,
                      fontWeight: 600,
                      borderRadius: 9,
                      padding: "8px 14px",
                      cursor: "pointer",
                      marginRight: 8,
                    }}
                  >
                    <Icon name="camera" size={14} /> Choose photo
                  </button>
                  {avatarFile && (
                    <button
                      onClick={handleAvatarUpload}
                      disabled={saving}
                      style={{
                        ...s.saveBtn,
                        marginTop: 0,
                        padding: "8px 16px",
                        fontSize: 12.5,
                      }}
                    >
                      {saving ? (
                        <>
                          <div
                            style={{
                              width: 13,
                              height: 13,
                              borderRadius: "50%",
                              border: "2px solid rgba(0,0,0,0.2)",
                              borderTopColor: "#0d0d0d",
                              animation: "spin 0.7s linear infinite",
                            }}
                          />
                          Uploading…
                        </>
                      ) : (
                        <>
                          <Icon name="check" size={13} />
                          Upload
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div style={s.section}>
                  <div style={s.sTitle}>Personal Info</div>
                  <div style={s.sSub}>Update your name and email.</div>
                  <div
                    className="sp-row2"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                    }}
                  >
                    <div>
                      <label style={s.lb}>Full Name</label>
                      <input
                        className="sp-inp"
                        style={s.inp}
                        value={profile.name}
                        onChange={(e) =>
                          setProfile({ ...profile, name: e.target.value })
                        }
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label style={s.lb}>Email</label>
                      <input
                        className="sp-inp"
                        style={s.inp}
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({ ...profile, email: e.target.value })
                        }
                        placeholder="you@email.com"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleProfileSave}
                    disabled={saving}
                    style={s.saveBtn}
                  >
                    {saving ? (
                      <>
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: "2px solid rgba(0,0,0,0.2)",
                            borderTopColor: "#0d0d0d",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Icon name="check" size={14} />
                        Save changes
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* SECURITY */}
            {activeTab === "security" && (
              <div style={s.section}>
                <div style={s.sTitle}>Change Password</div>
                <div style={s.sSub}>
                  Use a strong password you don't use elsewhere.
                </div>
                {["current", "next", "confirm"].map((key) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={s.lb}>
                      {key === "current"
                        ? "Current Password"
                        : key === "next"
                          ? "New Password"
                          : "Confirm New Password"}
                    </label>
                    <div
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <input
                        className="sp-inp"
                        style={{ ...s.inp, paddingRight: 44 }}
                        type={showPw[key] ? "text" : "password"}
                        placeholder="••••••••"
                        value={passwords[key]}
                        onChange={(e) =>
                          setPasswords({ ...passwords, [key]: e.target.value })
                        }
                      />
                      <button
                        onClick={() =>
                          setShowPw({ ...showPw, [key]: !showPw[key] })
                        }
                        tabIndex={-1}
                        style={{
                          position: "absolute",
                          right: 13,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.3)",
                          display: "flex",
                          alignItems: "center",
                          padding: 0,
                        }}
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
                  onClick={handlePasswordSave}
                  disabled={saving}
                  style={s.saveBtn}
                >
                  {saving ? (
                    <>
                      <div
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          border: "2px solid rgba(0,0,0,0.2)",
                          borderTopColor: "#0d0d0d",
                          animation: "spin 0.7s linear infinite",
                        }}
                      />
                      Updating…
                    </>
                  ) : (
                    <>
                      <Icon name="lock" size={14} />
                      Update password
                    </>
                  )}
                </button>
              </div>
            )}

            {/* LANGUAGE */}
            {activeTab === "language" && (
              <div style={s.section}>
                <div style={s.sTitle}>Language</div>
                <div style={s.sSub}>
                  Choose the interface language. Worker messages will be
                  translated to this language.
                </div>
                <div
                  className="sp-lang-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 8,
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className="sp-lang-pill"
                      onClick={() => {
                        setLang(l.code);
                        showToast(`Language set to ${l.label}`);
                      }}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "#1e1e1e",
                        border: `1.5px solid ${lang === l.code ? "#c8f135" : "rgba(255,255,255,0.07)"}`,
                        cursor: "pointer",
                        transition: "all 0.16s",
                        fontFamily: "'Manrope',sans-serif",
                        textAlign: "left",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: lang === l.code ? "#c8f135" : "#fff",
                        }}
                      >
                        {l.native}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.3)",
                          marginTop: 2,
                        }}
                      >
                        {l.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === "notifications" && (
              <div style={s.section}>
                <div style={s.sTitle}>Notifications</div>
                <div style={s.sSub}>Manage what alerts you receive.</div>
                {[
                  {
                    key: "jobAlerts",
                    label: "Job Alerts",
                    sub:
                      role === "worker"
                        ? "New job requests"
                        : "Updates on your bookings",
                  },
                  {
                    key: "messages",
                    label: "Messages",
                    sub: "New chat messages",
                  },
                  {
                    key: "payments",
                    label: "Payments",
                    sub: "Payment confirmations and receipts",
                  },
                  {
                    key: "promotions",
                    label: "Promotions",
                    sub: "Tips and platform updates",
                  },
                ].map(({ key, label, sub }) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          color: "#fff",
                          marginBottom: 2,
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.28)",
                        }}
                      >
                        {sub}
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setNotifs({ ...notifs, [key]: !notifs[key] })
                      }
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        border: "none",
                        cursor: "pointer",
                        position: "relative",
                        flexShrink: 0,
                        background: notifs[key]
                          ? "#c8f135"
                          : "rgba(255,255,255,0.1)",
                        transition: "background 0.2s",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 3,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 0.2s",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                          left: notifs[key] ? 23 : 3,
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </>
  );
}
