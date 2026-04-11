// src/pages/client/BrowseAllWorkers.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";

const CATEGORIES = [
  "all",
  "electrician",
  "plumber",
  "cleaner",
  "cook",
  "tailor",
];

export default function BrowseAllWorkers() {
  const [workers, setWorkers] = useState([]);
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
      .then((r) => setWorkers(r.data || []))
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false));
  }, [filter]);

  const displayed = workers.filter(
    (w) =>
      !search ||
      (w.workerId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (w.skills || []).some((s) =>
        s.toLowerCase().includes(search.toLowerCase()),
      ),
  );

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 0,
    transition: "transform 0.2s,box-shadow 0.2s,border-color 0.2s",
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <style>{`
        .baw-card:hover { transform:translateY(-3px)!important; box-shadow:0 18px 36px rgba(0,0,0,0.5)!important; border-color:rgba(255,255,255,0.14)!important; }
        .baw-filter:hover { border-color:rgba(255,255,255,0.25)!important; }
        .baw-inp:focus { border-color:#c8f135!important; box-shadow:0 0 0 3px rgba(200,241,53,0.09)!important; }
      `}</style>

      <div style={{ marginBottom: 24 }}>
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
          Find verified professionals across all categories.
        </p>
      </div>

      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 12,
          padding: "0 16px",
          height: 44,
          marginBottom: 16,
        }}
      >
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
        <input
          className="baw-inp"
          placeholder="Search by name or skill…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: "none",
            border: "none",
            outline: "none",
            fontSize: 13.5,
            color: "#fff",
            width: "100%",
            fontFamily: "'Manrope',sans-serif",
          }}
        />
      </div>

      {/* Category filters */}
      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="baw-filter"
            onClick={() => setFilter(cat)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              border:
                filter === cat
                  ? "1.5px solid #c8f135"
                  : "1.5px solid rgba(255,255,255,0.1)",
              background:
                filter === cat
                  ? "rgba(200,241,53,0.1)"
                  : "rgba(255,255,255,0.04)",
              color: filter === cat ? "#c8f135" : "rgba(255,255,255,0.45)",
              fontFamily: "'Manrope',sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
              transition: "all 0.15s",
            }}
          >
            {cat === "all" ? "All Categories" : cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div
          style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 14,
            padding: "40px 0",
            textAlign: "center",
          }}
        >
          Loading workers…
        </div>
      ) : displayed.length === 0 ? (
        <div
          style={{
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 18,
            padding: "56px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 17,
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
            gap: 14,
          }}
        >
          {displayed.map((w) => {
            const initials = (w.workerId?.name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={w._id} className="baw-card" style={card}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#f97316,#ec4899)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {w.workerId?.profilePicture ? (
                      <img
                        src={w.workerId.profilePicture}
                        alt=""
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: "50%",
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
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 15,
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 3,
                      }}
                    >
                      {w.workerId?.name || "Worker"}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 9px",
                        borderRadius: 20,
                        background: "rgba(200,241,53,0.1)",
                        color: "#c8f135",
                        textTransform: "capitalize",
                      }}
                    >
                      {w.category || "General"}
                    </span>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                    lineHeight: 1.6,
                    marginBottom: 14,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {w.description || "No description provided."}
                </p>
                {w.skills?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginBottom: 16,
                    }}
                  >
                    {w.skills.slice(0, 4).map((sk) => (
                      <span
                        key={sk}
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: 20,
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                )}
                {w.pricing && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.3)",
                      marginBottom: 14,
                    }}
                  >
                    💰 {w.pricing}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/client/worker/${w.workerId?._id}`)}
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "#c8f135",
                    color: "#0d0d0d",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px",
                    fontSize: 13.5,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                    width: "100%",
                  }}
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
