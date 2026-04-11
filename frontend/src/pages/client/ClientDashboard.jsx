import { useNavigate } from "react-router-dom";

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

export default function ClientDashboard() {
  const navigate = useNavigate();
  const initials = getInitialsFromToken();

  const categories = [
    {
      name: "electrician",
      icon: "⚡",
      desc: "Wiring, repairs & installations",
    },
    { name: "plumber", icon: "🔧", desc: "Pipes, leaks & fixtures" },
    { name: "cleaner", icon: "🧹", desc: "Home & office cleaning" },
    { name: "cook", icon: "🍳", desc: "Home-cooked meals & catering" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .cd-root {
          font-family: 'Manrope', 'Segoe UI', sans-serif;
          min-height: 100vh;
          background: #0d0d0d;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .cd-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(200,241,53,0.06) 0%, transparent 70%);
          top: -160px; right: -120px;
          pointer-events: none;
        }
        .cd-glow2 {
          position: absolute;
          width: 400px; height: 400px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(167,139,250,0.05) 0%, transparent 70%);
          bottom: -100px; left: -80px;
          pointer-events: none;
        }

        /* ── TOPBAR ── */
        .cd-topbar {
          position: relative; z-index: 2;
          height: 58px;
          display: flex; align-items: center;
          padding: 0 28px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: #141414;
          gap: 12px;
        }
        .cd-brand {
          display: flex; align-items: center; gap: 9px;
        }
        .cd-brand-dot {
          width: 30px; height: 30px;
          background: #c8f135; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd-brand-name {
          font-family: 'Syne', sans-serif;
          font-weight: 700; font-size: 15px;
          color: #fff; letter-spacing: -0.3px;
        }
        .cd-topbar-right {
          margin-left: auto;
          display: flex; align-items: center; gap: 10px;
        }
        .cd-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg,#f97316,#ec4899);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff;
          cursor: pointer; border: 2px solid rgba(255,255,255,0.1);
        }
        .cd-icon-btn {
          width: 34px; height: 34px; border-radius: 9px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.4);
          position: relative; transition: all 0.15s;
        }
        .cd-icon-btn:hover { background: rgba(255,255,255,0.09); color: #fff; }
        .cd-notif-dot {
          position: absolute; top: 6px; right: 6px;
          width: 7px; height: 7px;
          background: #c8f135; border-radius: 50%;
          border: 1.5px solid #141414;
        }

        /* ── MAIN CONTENT ── */
        .cd-content {
          position: relative; z-index: 1;
          flex: 1;
          padding: 40px 28px 60px;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }

        .cd-greeting {
          text-align: center;
          margin-bottom: 10px;
        }
        .cd-eyebrow {
          font-size: 11.5px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #c8f135; margin-bottom: 10px;
        }
        .cd-title {
          font-family: 'Syne', sans-serif;
          font-size: 30px; font-weight: 800;
          color: #fff; letter-spacing: -0.6px;
          margin-bottom: 8px;
        }
        .cd-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.32);
          margin-bottom: 36px;
        }

        /* ── SEARCH BAR ── */
        .cd-search {
          display: flex; align-items: center; gap: 10px;
          background: #141414;
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px;
          padding: 0 16px;
          height: 48px;
          margin-bottom: 36px;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .cd-search:focus-within {
          border-color: #c8f135;
          box-shadow: 0 0 0 3px rgba(200,241,53,0.09);
        }
        .cd-search input {
          flex: 1; background: none; border: none; outline: none;
          font-size: 14px; color: #fff;
          font-family: 'Manrope', sans-serif;
        }
        .cd-search input::placeholder { color: rgba(255,255,255,0.2); }

        /* ── SECTION LABEL ── */
        .cd-section-label {
          font-size: 11px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: rgba(255,255,255,0.22);
          margin-bottom: 14px;
        }

        /* ── CATEGORY GRID ── */
        .cd-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .cd-cat-card {
          background: #141414;
          border: 1.5px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 26px 22px 22px;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s;
          display: flex; flex-direction: column;
          align-items: flex-start;
          text-align: left;
          position: relative;
          overflow: hidden;
        }
        .cd-cat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          border-color: #c8f135;
        }
        .cd-cat-card:active { transform: translateY(0); }

        .cd-cat-blob {
          position: absolute;
          width: 80px; height: 80px; border-radius: 50%;
          background: rgba(200,241,53,0.06);
          top: -20px; right: -20px;
          transition: opacity 0.2s;
        }
        .cd-cat-card:hover .cd-cat-blob { opacity: 2; background: rgba(200,241,53,0.1); }

        .cd-cat-icon-wrap {
          width: 52px; height: 52px;
          background: #1e1e1e;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px;
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.06);
          transition: background 0.2s;
        }
        .cd-cat-card:hover .cd-cat-icon-wrap {
          background: rgba(200,241,53,0.1);
          border-color: rgba(200,241,53,0.25);
        }

        .cd-cat-name {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700;
          color: #fff; text-transform: capitalize;
          margin-bottom: 5px;
        }
        .cd-cat-desc {
          font-size: 12.5px;
          color: rgba(255,255,255,0.32);
          line-height: 1.5;
          margin-bottom: 18px;
        }
        .cd-cat-cta {
          display: flex; align-items: center; gap: 5px;
          font-size: 12.5px; font-weight: 600;
          color: rgba(255,255,255,0.28);
          transition: color 0.2s;
        }
        .cd-cat-card:hover .cd-cat-cta { color: #c8f135; }
        .cd-cat-arrow { transition: transform 0.2s; }
        .cd-cat-card:hover .cd-cat-arrow { transform: translateX(4px); }

        /* ── STATS ROW ── */
        .cd-stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 10px;
          margin-top: 28px;
        }
        .cd-stat {
          background: #141414;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 16px;
          text-align: center;
        }
        .cd-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #fff; margin-bottom: 3px;
        }
        .cd-stat-label {
          font-size: 11px; color: rgba(255,255,255,0.28);
          font-weight: 500;
        }

        @media (max-width: 520px) {
          .cd-content { padding: 28px 16px 48px; }
          .cd-topbar { padding: 0 16px; }
          .cd-title { font-size: 24px; }
          .cd-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .cd-cat-card { padding: 20px 16px 18px; }
          .cd-cat-icon-wrap { width: 44px; height: 44px; font-size: 20px; }
          .cd-stats { grid-template-columns: repeat(3,1fr); }
        }

        @media (max-width: 360px) {
          .cd-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cd-root">
        <div className="cd-glow" />
        <div className="cd-glow2" />

        {/* Topbar */}
        <header className="cd-topbar">
          <div className="cd-brand">
            <div className="cd-brand-dot">
              <svg
                viewBox="0 0 24 24"
                fill="#0d0d0d"
                style={{ width: 13, height: 13 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
            <span className="cd-brand-name">WorkerHub</span>
          </div>
          <div className="cd-topbar-right">
            <div className="cd-icon-btn">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 15, height: 15 }}
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <div className="cd-notif-dot" />
            </div>
            <div
              className="cd-icon-btn"
              onClick={() => navigate("/client/settings")}
              title="Settings"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 15, height: 15 }}
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div
              className="cd-avatar"
              onClick={() => navigate("/client/settings")}
              title="My profile"
              style={{ cursor: "pointer" }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="cd-content">
          {/* Greeting */}
          <div className="cd-greeting">
            <div className="cd-eyebrow">✦ Welcome back</div>
            <h2 className="cd-title">What service do you need?</h2>
            <p className="cd-sub">Browse verified professionals near you.</p>
          </div>

          {/* Search */}
          <div className="cd-search">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="2"
              style={{ width: 16, height: 16, flexShrink: 0 }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input placeholder="Search for a service…" />
          </div>

          {/* Categories */}
          <div className="cd-section-label">Browse Categories</div>
          <div className="cd-grid">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="cd-cat-card"
                onClick={() => navigate(`/client/browse?category=${cat.name}`)}
              >
                <div className="cd-cat-blob" />
                <div className="cd-cat-icon-wrap">{cat.icon}</div>
                <div className="cd-cat-name">{cat.name}</div>
                <div className="cd-cat-desc">{cat.desc}</div>
                <div className="cd-cat-cta">
                  Browse workers
                  <svg
                    className="cd-cat-arrow"
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
          <div className="cd-stats">
            {[
              { val: "200+", label: "Verified Workers" },
              { val: "4.8★", label: "Avg. Rating" },
              { val: "1 hr", label: "Avg. Response" },
            ].map((s) => (
              <div key={s.label} className="cd-stat">
                <div className="cd-stat-val">{s.val}</div>
                <div className="cd-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
