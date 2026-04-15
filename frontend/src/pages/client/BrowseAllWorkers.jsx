// src/pages/client/BrowseWorkers.jsx
// ✅ 3-column grid layout as shown in screenshot
// ✅ BLIP descriptions filtered — only worker-typed descriptions shown
// ✅ Shows: name, category badge, description (only if manually typed), skills, price, View Profile button

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { CATEGORY_DATA } from "../../data/categoryData.js";

const CATEGORIES = [
  "all",
  "electrician",
  "plumber",
  "cleaner",
  "cook",
  "tailor",
];

// ✅ Filter out BLIP-generated garbage
function isBlipDescription(text) {
  if (!text || text.length < 10) return true;
  const blip = [
    "a person is",
    "a man is",
    "a woman is",
    "indian girl",
    "girl in shorts",
    "playing with a toy",
    "standing in the middle",
    "person using",
    "person holding",
    "someone is",
    "man is using",
    "woman is using",
    "striped shirt",
    "standing near",
    "wearing a",
    "looking at",
    "sitting on",
    "holding a",
    "using a phone",
    "a boy is",
    "a girl is",
    "painting a wall",
    "working on a circuit",
  ];
  return blip.some((b) => text.toLowerCase().includes(b));
}

export default function BrowseAllWorkers() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const url =
      filter === "all" ? "/portfolios" : `/portfolios?category=${filter}`;
    api
      .get(url)
      .then((r) => setPortfolios(r.data || []))
      .catch(() => setPortfolios([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const shown = portfolios.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = (p.workerId?.name || p.name || "").toLowerCase();
    const skills = (p.skills || []).join(" ").toLowerCase();
    return name.includes(q) || skills.includes(q);
  });

  return (
    <div style={{ fontFamily: "'Manrope',sans-serif", maxWidth: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        .bw-card{background:#1a1a1a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px;transition:transform 0.15s,box-shadow 0.15s;}
        .bw-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.4);}
        .bw-filter:hover{border-color:rgba(255,255,255,0.22)!important;color:rgba(255,255,255,0.8)!important;}
        .bw-view-btn{width:100%;padding:12px;background:#c8f135;border:none;border-radius:10px;color:#0d0d0d;font-family:'Manrope',sans-serif;font-size:13.5px;font-weight:700;cursor:pointer;transition:opacity 0.15s;margin-top:auto;}
        .bw-view-btn:hover{opacity:0.88;}
        .bw-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        @media(max-width:1100px){.bw-grid{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:680px){.bw-grid{grid-template-columns:1fr;}}
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 5px",
          }}
        >
          Browse Workers
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
          Find verified professionals near you.
        </p>
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10,
          padding: "0 14px",
          height: 40,
          marginBottom: 16,
        }}
      >
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a service…"
          style={{
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
            width: "100%",
            fontFamily: "'Manrope',sans-serif",
          }}
        />
      </div>

      {/* Category filter pills */}
      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}
      >
        {CATEGORIES.map((cat) => {
          const cd = CATEGORY_DATA[cat];
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              className="bw-filter"
              onClick={() => setFilter(cat)}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                border: `1.5px solid ${isActive ? "#c8f135" : "rgba(255,255,255,0.12)"}`,
                background: isActive ? "rgba(200,241,53,0.12)" : "transparent",
                color: isActive ? "#c8f135" : "rgba(255,255,255,0.45)",
                fontFamily: "'Manrope',sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {cat === "all"
                ? "All Categories"
                : `${cd?.icon || ""} ${cd?.label || cat}`}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.15)",
              borderTopColor: "#c8f135",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          Loading workers…
        </div>
      ) : shown.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 24px",
            background: "#1a1a1a",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            No workers found
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            Try a different category or search term.
          </div>
        </div>
      ) : (
        <div className="bw-grid">
          {shown.map((p) => {
            const name = p.workerId?.name || p.name || "Worker";
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const catData = CATEGORY_DATA[p.category];
            const catLabel = catData?.label || p.category || "General";
            const catIcon = catData?.icon || "👤";
            // ✅ Only show description if worker manually typed it
            const showDesc = p.description && !isBlipDescription(p.description);

            return (
              <div key={p._id} className="bw-card">
                {/* Name + Category */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#f97316,#ec4899)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                      overflow: "hidden",
                    }}
                  >
                    {p.workerId?.profilePicture ? (
                      <img
                        src={p.workerId.profilePicture}
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
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 4,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {name}
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "2px 10px",
                        borderRadius: 20,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: "rgba(200,241,53,0.1)",
                        color: "#c8f135",
                        border: "1px solid rgba(200,241,53,0.18)",
                      }}
                    >
                      {catIcon} {catLabel}
                    </span>
                  </div>
                </div>

                {/* ✅ Description — ONLY if manually written, never BLIP */}
                {showDesc && (
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.5)",
                      lineHeight: 1.55,
                      margin: 0,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {p.description}
                  </p>
                )}

                {/* Skills */}
                {p.skills?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {p.skills.slice(0, 3).map((sk) => (
                      <span
                        key={sk}
                        style={{
                          padding: "3px 10px",
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.6)",
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 500,
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                    {p.skills.length > 3 && (
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "rgba(255,255,255,0.25)",
                          padding: "3px 6px",
                        }}
                      >
                        +{p.skills.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Rating */}
                {p.avgRating > 0 && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "#fbbf24",
                      fontWeight: 600,
                    }}
                  >
                    {"★".repeat(Math.round(p.avgRating))} {p.avgRating} (
                    {p.totalRatings} reviews)
                  </div>
                )}

                {/* Price */}
                {p.priceMin || p.priceMax ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                    >
                      From
                    </span>
                    <span
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#c8f135",
                      }}
                    >
                      ₹{Number(p.priceMin || 0).toLocaleString()}
                    </span>
                    {p.priceMax && (
                      <span
                        style={{
                          fontSize: 11.5,
                          color: "rgba(255,255,255,0.3)",
                        }}
                      >
                        – ₹{Number(p.priceMax).toLocaleString()}
                      </span>
                    )}
                  </div>
                ) : p.pricing ? (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 4 }}
                  >
                    <span style={{ fontSize: 13 }}>🪙</span>
                    <span
                      style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}
                    >
                      {p.pricing}
                    </span>
                  </div>
                ) : null}

                {/* View Profile button */}
                <button
                  className="bw-view-btn"
                  onClick={() =>
                    navigate(`/client/worker/${p.workerId?._id || p._id}`)
                  }
                >
                  View Profile →
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
