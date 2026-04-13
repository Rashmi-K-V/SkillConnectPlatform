// src/pages/client/ClientDashboard.jsx
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";

function getInitialsFromToken() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "CL";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (payload.name || "CL")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  } catch {
    return "CL";
  }
}

const NAV = [
  {
    label: "Dashboard",
    path: "/client/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ width: 18, height: 18 }}
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Browse Workers",
    path: "/client/browse-all",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ width: 18, height: 18 }}
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    label: "My Jobs",
    path: "/client/jobs",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ width: 18, height: 18 }}
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/client/settings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ width: 18, height: 18 }}
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const CATEGORIES = [
  { name: "electrician", icon: "⚡", desc: "Wiring, repairs & installations" },
  { name: "plumber", icon: "🔧", desc: "Pipes, leaks & fixtures" },
  { name: "cleaner", icon: "🧹", desc: "Home & office cleaning" },
  { name: "cook", icon: "🍳", desc: "Home-cooked meals & catering" },
  { name: "tailor", icon: "🧵", desc: "Stitching & alterations" },
];

export default function ClientDashboard() {
  const nav = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = getInitialsFromToken();
  const currentPath = location.pathname;

  const isHome =
    currentPath === "/client/dashboard" || currentPath === "/client";

  const s = {
    root: {
      fontFamily: "'Manrope','Segoe UI',sans-serif",
      display: "flex",
      height: "100vh",
      width: "100vw",
      background: "#0d0d0d",
      overflow: "hidden",
      position: "fixed",
      top: 0,
      left: 0,
    },
    sidebar: {
      width: 232,
      flexShrink: 0,
      background: "#141414",
      borderRight: "1px solid rgba(255,255,255,0.06)",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
      zIndex: 50,
    },
    brand: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "20px 18px 16px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0,
    },
    brandDot: {
      width: 32,
      height: 32,
      background: "#c8f135",
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    brandName: {
      fontFamily: "'Syne',sans-serif",
      fontWeight: 700,
      fontSize: 15,
      color: "#fff",
      letterSpacing: "-0.3px",
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.22)",
      padding: "18px 18px 6px",
      flexShrink: 0,
    },
    navList: {
      listStyle: "none",
      padding: "0 8px",
      flex: 1,
      overflowY: "auto",
      margin: 0,
    },
    navBtn: (active) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 10,
      marginBottom: 2,
      color: active ? "#0d0d0d" : "rgba(255,255,255,0.42)",
      fontSize: 13.5,
      fontWeight: active ? 600 : 500,
      background: active ? "#c8f135" : "transparent",
      border: "none",
      cursor: "pointer",
      width: "100%",
      textAlign: "left",
      transition: "all 0.14s ease",
      fontFamily: "'Manrope',sans-serif",
    }),
    userArea: {
      padding: "12px 8px",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      flexShrink: 0,
    },
    userCard: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 10,
      cursor: "pointer",
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#f97316,#ec4899)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 11,
      fontWeight: 700,
      color: "#fff",
      flexShrink: 0,
    },
    main: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      minWidth: 0,
      overflow: "hidden",
    },
    topbar: {
      height: 56,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      gap: 12,
      background: "#141414",
    },
    searchWrap: {
      flex: 1,
      maxWidth: 320,
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 10,
      padding: "0 14px",
      height: 36,
    },
    searchInput: {
      background: "none",
      border: "none",
      outline: "none",
      fontSize: 13,
      color: "rgba(255,255,255,0.65)",
      width: "100%",
      fontFamily: "'Manrope',sans-serif",
    },
    iconBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "rgba(255,255,255,0.45)",
      position: "relative",
      flexShrink: 0,
    },
    content: {
      flex: 1,
      overflowY: "auto",
      padding: "28px 28px 32px",
      scrollbarWidth: "thin",
      scrollbarColor: "rgba(255,255,255,0.08) transparent",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .cl-navbtn:hover { background:rgba(255,255,255,0.06)!important; color:rgba(255,255,255,0.85)!important; }
        .cl-navbtn.active:hover { background:#c8f135!important; }
        .cl-usercard:hover { background:rgba(255,255,255,0.05)!important; }
        .cl-iconbtn:hover { background:rgba(255,255,255,0.1)!important; color:#fff!important; }
        .cl-content::-webkit-scrollbar { width:4px; }
        .cl-content::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        .cl-hamburger { display:none; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:9px; cursor:pointer; color:rgba(255,255,255,0.5); padding:7px; align-items:center; justify-content:center; flex-shrink:0; }
        .cl-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:40; }
        .cl-cat-card { background:#141414; border:1.5px solid rgba(255,255,255,0.07); border-radius:20px; padding:24px 20px 20px; cursor:pointer; transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s; display:flex; flex-direction:column; align-items:flex-start; position:relative; overflow:hidden; }
        .cl-cat-card:hover { transform:translateY(-4px); box-shadow:0 20px 40px rgba(0,0,0,0.5); border-color:#c8f135; }
        .cl-cat-card:hover .cl-cat-cta { color:#c8f135!important; }
        .cl-cat-card:hover .cl-cat-arrow { transform:translateX(4px)!important; }
        .cl-cat-card:hover .cl-cat-icon { background:rgba(200,241,53,0.1)!important; border-color:rgba(200,241,53,0.25)!important; }
        .cl-arrow { transition:transform 0.2s; }
        @media(max-width:768px){
          .cl-sidebar{position:fixed!important;top:0;left:0;bottom:0;transform:translateX(-100%)!important;width:240px!important;}
          .cl-sidebar.open{transform:translateX(0)!important;}
          .cl-overlay.open{display:block!important;}
          .cl-hamburger{display:flex!important;}
          .cl-content{padding:20px 16px 28px!important;}
          .cl-topbar{padding:0 16px!important;}
          .cl-grid{grid-template-columns:1fr 1fr!important;}
          .cl-stats{grid-template-columns:repeat(3,1fr)!important;}
        }
        @media(max-width:480px){ .cl-grid{grid-template-columns:1fr!important;} }
      `}</style>

      <div
        className={`cl-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div style={s.root}>
        {/* SIDEBAR */}
        <aside
          className={`cl-sidebar ${mobileOpen ? "open" : ""}`}
          style={s.sidebar}
        >
          <div style={s.brand}>
            <div style={s.brandDot}>
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 14, height: 14 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span style={s.brandName}>SkillConnect</span>
          </div>
          <div style={s.sectionLabel}>Menu</div>
          <ul style={s.navList}>
            {NAV.map((item) => {
              const active =
                item.path === "/client/dashboard"
                  ? isHome
                  : currentPath.startsWith(item.path);
              return (
                <li key={item.path}>
                  <button
                    className={`cl-navbtn ${active ? "active" : ""}`}
                    style={s.navBtn(active)}
                    onClick={() => {
                      nav(item.path);
                      setMobileOpen(false);
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <div style={s.userArea}>
            <div
              className="cl-usercard"
              style={s.userCard}
              onClick={() => nav("/client/settings")}
            >
              <div style={s.avatar}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  My Account
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.32)",
                    marginTop: 2,
                  }}
                >
                  Client
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={s.main}>
          <header className="cl-topbar" style={s.topbar}>
            <button
              className="cl-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 18, height: 18 }}
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div style={s.searchWrap}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="2"
                style={{ width: 15, height: 15, flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                placeholder="Search for a service…"
                style={s.searchInput}
              />
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div className="cl-iconbtn" style={s.iconBtn}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ width: 16, height: 16 }}
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <div
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    width: 7,
                    height: 7,
                    background: "#c8f135",
                    borderRadius: "50%",
                    border: "1.5px solid #141414",
                  }}
                />
              </div>
              <div
                style={{
                  ...s.avatar,
                  border: "2px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                }}
                onClick={() => nav("/client/settings")}
              >
                {initials}
              </div>
            </div>
          </header>

          <div className="cl-content" style={s.content}>
            {isHome ? (
              <ClientHome nav={nav} categories={CATEGORIES} />
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ClientHome({ nav, categories }) {
  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "#c8f135",
            marginBottom: 10,
          }}
        >
          ✦ Welcome back
        </div>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 28,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "-0.6px",
            margin: "0 0 8px",
          }}
        >
          What service do you need?
        </h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.32)" }}>
          Browse verified professionals near you.
        </p>
      </div>

      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: "rgba(255,255,255,0.22)",
          marginBottom: 12,
        }}
      >
        Browse Categories
      </div>
      <div
        className="cl-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginBottom: 28,
        }}
      >
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="cl-cat-card"
            onClick={() => nav(`/client/browse?category=${cat.name}`)}
          >
            <div
              style={{
                position: "absolute",
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: "rgba(200,241,53,0.06)",
                top: -18,
                right: -18,
              }}
            />
            <div
              className="cl-cat-icon"
              style={{
                width: 48,
                height: 48,
                background: "#1e1e1e",
                borderRadius: 13,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                marginBottom: 14,
                border: "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s",
              }}
            >
              {cat.icon}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                textTransform: "capitalize",
                marginBottom: 4,
              }}
            >
              {cat.name}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.32)",
                lineHeight: 1.5,
                marginBottom: 16,
              }}
            >
              {cat.desc}
            </div>
            <div
              className="cl-cat-cta"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12.5,
                fontWeight: 600,
                color: "rgba(255,255,255,0.28)",
                transition: "color 0.2s",
              }}
            >
              Browse workers
              <svg
                className="cl-cat-arrow cl-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ width: 13, height: 13 }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div
        className="cl-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 10,
        }}
      >
        {[
          { val: "200+", label: "Verified Workers" },
          { val: "4.8★", label: "Avg. Rating" },
          { val: "< 1 hr", label: "Avg. Response" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "14px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 3,
              }}
            >
              {s.val}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.28)",
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
