// src/pages/worker/WorkerDashboard.jsx
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useState } from "react";
import { useWorker } from "../../context/WorkerContext.jsx";

const NAV = [
  {
    label: "Dashboard",
    path: "/worker/dashboard",
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
    label: "Upload Video",
    path: "/worker/upload",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ width: 18, height: 18 }}
      >
        <polyline points="16 16 12 12 8 16" />
        <line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
      </svg>
    ),
  },
  {
    label: "Portfolio",
    path: "/worker/portfolio",
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
    label: "Jobs",
    path: "/worker/jobs",
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
    label: "Messages",
    path: "/worker/messages",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ width: 18, height: 18 }}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    path: "/worker/settings",
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

export default function WorkerLayout() {
  const nav = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, portfolio, loading } = useWorker();
  const currentPath = location.pathname;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const isHome =
    currentPath === "/worker" || currentPath === "/worker/dashboard";

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
        .wh-navbtn:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,0.85) !important; }
        .wh-navbtn.active:hover { background: #c8f135 !important; }
        .wh-iconbtn:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
        .wh-usercard:hover { background: rgba(255,255,255,0.05) !important; }
        .wh-action-card { border:none; text-align:left; width:100%; cursor:pointer; position:relative; overflow:hidden; transition:transform 0.2s ease,box-shadow 0.2s ease; border-radius:18px; padding:22px; }
        .wh-action-card:hover { transform:translateY(-3px); box-shadow:0 18px 36px rgba(0,0,0,0.5); }
        .wh-arrow { transition:transform 0.2s; }
        .wh-action-card:hover .wh-arrow { transform:translateX(4px); }
        .wh-content::-webkit-scrollbar { width:4px; }
        .wh-content::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:4px; }
        .wh-hamburger { display:none; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.08); border-radius:9px; cursor:pointer; color:rgba(255,255,255,0.5); padding:7px; align-items:center; justify-content:center; flex-shrink:0; }
        .wh-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:40; }
        .wh-act-row { display:flex; align-items:center; gap:12px; padding:13px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .wh-act-row:last-child { border-bottom:none; }
        .wh-todo-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
        .wh-todo-row:last-child { border-bottom:none; }
        @media(max-width:900px){ .wh-bottom-grid { grid-template-columns:1fr !important; } }
        @media(max-width:768px){
          .wh-sidebar{position:fixed!important;top:0;left:0;bottom:0;transform:translateX(-100%)!important;width:240px!important;}
          .wh-sidebar.open{transform:translateX(0)!important;}
          .wh-overlay.open{display:block!important;}
          .wh-hamburger{display:flex!important;}
          .wh-content{padding:20px 16px 28px!important;}
          .wh-topbar{padding:0 16px!important;}
          .wh-stats{grid-template-columns:repeat(2,1fr)!important;}
          .wh-cards{grid-template-columns:1fr 1fr!important;}
        }
        @media(max-width:480px){
          .wh-stats{grid-template-columns:1fr!important;}
          .wh-cards{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div
        className={`wh-overlay ${mobileOpen ? "open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      <div style={s.root}>
        {/* SIDEBAR */}
        <aside
          className={`wh-sidebar ${mobileOpen ? "open" : ""}`}
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

          <div style={s.sectionLabel}>Main Menu</div>

          <ul style={s.navList}>
            {NAV.map((item) => {
              const active =
                item.path === "/worker/dashboard"
                  ? isHome
                  : currentPath.startsWith(item.path);
              return (
                <li key={item.path}>
                  <button
                    className={`wh-navbtn ${active ? "active" : ""}`}
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
              className="wh-usercard"
              style={s.userCard}
              onClick={() => nav("/worker/settings")}
            >
              <div style={s.avatar}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {loading ? "Loading…" : (user?.name ?? "Worker")}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.32)",
                    marginTop: 2,
                    textTransform: "capitalize",
                  }}
                >
                  {user?.category ?? "Worker"}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <div style={s.main}>
          <header className="wh-topbar" style={s.topbar}>
            <button
              className="wh-hamburger"
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
              <input placeholder="Search anything..." style={s.searchInput} />
            </div>
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div className="wh-iconbtn" style={s.iconBtn}>
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
                onClick={() => nav("/worker/settings")}
              >
                {initials}
              </div>
            </div>
          </header>

          <div className="wh-content" style={s.content}>
            {isHome ? (
              <DashboardHome
                user={user}
                portfolio={portfolio}
                loading={loading}
                nav={nav}
                getGreeting={getGreeting}
              />
            ) : (
              <Outlet />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────
   DASHBOARD HOME
───────────────────────────────────── */
function DashboardHome({ user, portfolio, loading, nav, getGreeting }) {
  const firstName = user?.name?.split(" ")[0] ?? "there";
  const skills = portfolio?.skills ?? [];

  // Profile completion
  const checks = [
    { label: "Name added", done: !!user?.name, path: "/worker/settings" },
    { label: "Photo uploaded", done: !!user?.avatar, path: "/worker/settings" },
    {
      label: "Skills listed",
      done: skills.length > 0,
      path: "/worker/portfolio",
    },
    {
      label: "Description written",
      done: !!portfolio?.description,
      path: "/worker/portfolio",
    },
    {
      label: "Price range set",
      done: !!portfolio?.priceRange?.min,
      path: "/worker/portfolio",
    },
  ];
  const completedCount = checks.filter((c) => c.done).length;
  const pct = Math.round((completedCount / checks.length) * 100);

  const STATS = [
    {
      label: "Skills Listed",
      value: skills.length || "0",
      delta: skills.length ? "from portfolio" : "add skills",
      accent: "#c8f135",
    },
    {
      label: "Profile Views",
      value: "—",
      delta: "coming soon",
      accent: "#a78bfa",
    },
    {
      label: "Jobs Completed",
      value: "—",
      delta: "coming soon",
      accent: "#60a5fa",
    },
  ];

  const ACTIONS = [
    {
      label: "Upload Video",
      desc: "Add new work to your reel.",
      cta: "Get started",
      path: "/worker/upload",
      bg: "#c8f135",
      textDark: true,
      accent: "#c8f135",
      iconStroke: "#0d0d0d",
    },
    {
      label: "Find Jobs",
      desc: "Browse nearby job requests.",
      cta: "Browse jobs",
      path: "/worker/jobs",
      bg: "#1a1a1a",
      textDark: false,
      accent: "#a78bfa",
      iconStroke: "#a78bfa",
    },
    {
      label: "My Portfolio",
      desc: "Edit and manage your profile.",
      cta: "View portfolio",
      path: "/worker/portfolio",
      bg: "#1a1a1a",
      textDark: false,
      accent: "#34d399",
      iconStroke: "#34d399",
    },
    {
      label: "Messages",
      desc: "Chat with your clients.",
      cta: "Open chat",
      path: "/worker/messages",
      bg: "#1a1a1a",
      textDark: false,
      accent: "#fb923c",
      iconStroke: "#fb923c",
    },
  ];

  const ACTIVITY = [
    {
      name: "Brand Ad — TechCorp v2.mp4",
      time: "2 hours ago",
      status: "Processing",
    },
    {
      name: "Reel Edit — Client Project.mp4",
      time: "Yesterday",
      status: "Live",
    },
    {
      name: "Promo Cut — Local Business.mp4",
      time: "3 days ago",
      status: "Live",
    },
  ];

  const actionIcon = (label, stroke) => {
    if (label === "Upload Video")
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          strokeWidth="2.2"
          style={{ width: 20, height: 20 }}
        >
          <polyline points="16 16 12 12 8 16" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
        </svg>
      );
    if (label === "Find Jobs")
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          strokeWidth="2.2"
          style={{ width: 20, height: 20 }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      );
    if (label === "My Portfolio")
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          strokeWidth="2.2"
          style={{ width: 20, height: 20 }}
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      );
    if (label === "Messages")
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke={stroke}
          strokeWidth="2.2"
          style={{ width: 20, height: 20 }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
  };

  const secLabel = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "rgba(255,255,255,0.22)",
    marginBottom: 10,
  };
  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
  };

  return (
    <>
      {/* GREETING */}
      <div style={{ marginBottom: 26 }}>
        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "-0.4px",
            margin: "0 0 4px",
          }}
        >
          {getGreeting()}, {loading ? "…" : firstName} 👋
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
          Here's what's happening with your profile today.
        </p>
      </div>

      {/* STATS */}
      <div
        className="wh-stats"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} style={{ ...card, padding: "18px 20px" }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.28)",
                marginBottom: 8,
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 30,
                fontWeight: 700,
                color: "#fff",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)" }}>
              <span style={{ color: stat.accent }}>
                {stat.delta.split(" ")[0]}
              </span>
              {" " + stat.delta.split(" ").slice(1).join(" ")}
            </div>
          </div>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div style={secLabel}>Quick Actions</div>
      <div
        className="wh-cards"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {ACTIONS.map((action) => (
          <button
            key={action.label}
            className="wh-action-card"
            style={{
              background: action.bg,
              border: action.textDark
                ? "none"
                : "1px solid rgba(255,255,255,0.08)",
            }}
            onClick={() => nav(action.path)}
          >
            <div
              style={{
                position: "absolute",
                width: 70,
                height: 70,
                borderRadius: "50%",
                background: action.textDark
                  ? "rgba(0,0,0,0.1)"
                  : `${action.accent}18`,
                top: -18,
                right: -18,
              }}
            />
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 11,
                background: action.textDark
                  ? "rgba(0,0,0,0.15)"
                  : `${action.accent}18`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
                border: `1px solid ${action.textDark ? "rgba(0,0,0,0.1)" : action.accent + "30"}`,
              }}
            >
              {actionIcon(action.label, action.iconStroke)}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: 14,
                color: action.textDark ? "#0d0d0d" : "#fff",
                marginBottom: 5,
              }}
            >
              {action.label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: action.textDark
                  ? "rgba(0,0,0,0.45)"
                  : "rgba(255,255,255,0.32)",
                marginBottom: 18,
                lineHeight: 1.4,
              }}
            >
              {action.desc}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 12,
                fontWeight: 600,
                color: action.textDark ? "#0d0d0d" : action.accent,
              }}
            >
              {action.cta}
              <svg
                className="wh-arrow"
                viewBox="0 0 24 24"
                fill="none"
                stroke={action.textDark ? "#0d0d0d" : action.accent}
                strokeWidth="2.5"
                style={{ width: 13, height: 13 }}
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* BOTTOM: ACTIVITY + PROFILE COMPLETION */}
      <div
        className="wh-bottom-grid"
        style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}
      >
        {/* Recent Activity */}
        <div style={card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <span
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Recent Uploads
            </span>
            <button
              onClick={() => nav("/worker/upload")}
              style={{
                fontSize: 12,
                color: "#c8f135",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              + Upload →
            </button>
          </div>
          <div style={{ padding: "0 20px" }}>
            {ACTIVITY.map((item, i) => (
              <div
                key={item.name}
                className="wh-act-row"
                style={{
                  borderBottom: i === ACTIVITY.length - 1 ? "none" : undefined,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="1.8"
                    style={{ width: 15, height: 15 }}
                  >
                    <polygon points="5,3 19,12 5,21" />
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: "rgba(255,255,255,0.28)",
                      marginTop: 2,
                    }}
                  >
                    {item.time}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "4px 10px",
                    borderRadius: 20,
                    flexShrink: 0,
                    background:
                      item.status === "Live"
                        ? "rgba(34,197,94,0.13)"
                        : "rgba(251,191,36,0.12)",
                    color: item.status === "Live" ? "#4ade80" : "#fbbf24",
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
          {/* Skills preview inside activity card if any */}
          {skills.length > 0 && (
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(255,255,255,0.22)",
                  marginBottom: 8,
                }}
              >
                Your Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {skills.map((sk) => (
                  <span
                    key={sk}
                    style={{
                      padding: "4px 11px",
                      background: "rgba(200,241,53,0.1)",
                      color: "#c8f135",
                      borderRadius: 20,
                      fontSize: 11.5,
                      fontWeight: 600,
                      border: "1px solid rgba(200,241,53,0.2)",
                    }}
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Completion */}
        <div style={{ ...card, padding: "20px" }}>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 3,
            }}
          >
            Profile Completion
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 16,
            }}
          >
            Complete your profile to attract clients
          </div>

          {/* Circular progress */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: `conic-gradient(#c8f135 ${pct * 3.6}deg, rgba(255,255,255,0.07) 0deg)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#1a1a1a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {pct}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                {completedCount} of {checks.length} complete
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "rgba(255,255,255,0.28)",
                  marginTop: 2,
                }}
              >
                {pct === 100
                  ? "🎉 Profile is complete!"
                  : "Finish setup to get hired"}
              </div>
            </div>
          </div>

          {/* Checklist */}
          {checks.map((c) => (
            <div key={c.label} className="wh-todo-row">
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: c.done
                    ? "rgba(200,241,53,0.15)"
                    : "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${c.done ? "#c8f135" : "rgba(255,255,255,0.12)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {c.done && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#c8f135"
                    strokeWidth="3"
                    style={{ width: 10, height: 10 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span
                style={{
                  flex: 1,
                  fontSize: 12.5,
                  color: c.done ? "rgba(255,255,255,0.4)" : "#fff",
                  fontWeight: c.done ? 400 : 500,
                  textDecoration: c.done ? "line-through" : "none",
                }}
              >
                {c.label}
              </span>
              {!c.done && (
                <button
                  onClick={() => nav(c.path)}
                  style={{
                    fontSize: 11,
                    color: "#c8f135",
                    fontWeight: 600,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  Fix →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
