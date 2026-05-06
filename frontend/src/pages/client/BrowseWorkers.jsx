import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api.services.js";

// ✅ Detect and filter out BLIP-generated garbage descriptions
function isBlipDescription(text) {
  if (!text || text.trim().length < 10) return true;
  const blipPhrases = [
    "a person is",
    "a man is",
    "a woman is",
    "a bed with",
    "a person using",
    "person holding",
    "someone is",
    "man is using",
    "woman is using",
    "standing near",
    "wearing a",
    "looking at",
    "sitting on",
    "holding a",
    "a boy is",
    "a girl is",
    "painting a wall",
    "working on",
    "man in a",
    "a pink",
    "a blue",
    "a red",
    "a green",
    "a white",
    "a black",
    "sandpaper",
    "floral print",
    "floral pattern",
  ];
  return blipPhrases.some((b) => text.toLowerCase().includes(b));
}

export default function BrowseWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const category = params.get("category") || "";

  useEffect(() => {
    api
      .get("/portfolios?category=" + category.toLowerCase())
      .then((res) => setWorkers(res.data || []))
      .catch(() => setWorkers([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .bw-root{font-family:'Manrope','Segoe UI',sans-serif;min-height:100vh;background:#0d0d0d;padding:36px 28px 48px;box-sizing:border-box;}
        .bw-back{display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.3);background:none;border:none;cursor:pointer;padding:0;margin-bottom:14px;font-family:'Manrope',sans-serif;letter-spacing:0.04em;text-transform:uppercase;transition:color 0.15s;}
        .bw-back:hover{color:#c8f135;}
        .bw-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;margin:0 0 6px;text-transform:capitalize;}
        .bw-count{display:inline-block;background:rgba(200,241,53,0.12);color:#c8f135;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;margin-left:10px;letter-spacing:0.04em;vertical-align:middle;}
        .bw-divider{width:100%;height:1px;background:rgba(255,255,255,0.06);margin:20px 0 28px;}
        .bw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;}
        .bw-card{background:#1a1a1a;border:1px solid rgba(255,255,255,0.07);border-radius:18px;padding:22px;transition:transform 0.2s ease,box-shadow 0.2s ease,border-color 0.2s;display:flex;flex-direction:column;gap:0;}
        .bw-card:hover{transform:translateY(-3px);box-shadow:0 18px 36px rgba(0,0,0,0.5);border-color:rgba(255,255,255,0.13);}
        .bw-btn{display:flex;align-items:center;justify-content:center;gap:7px;background:#c8f135;color:#0d0d0d;font-family:'Manrope',sans-serif;font-size:13.5px;font-weight:700;border:none;border-radius:11px;padding:11px 0;width:100%;cursor:pointer;transition:opacity 0.15s,transform 0.15s;}
        .bw-btn:hover{opacity:0.88;transform:scale(0.99);}
        @media(max-width:600px){.bw-root{padding:24px 16px 40px;}.bw-grid{grid-template-columns:1fr;}}
      `}</style>

      <div className="bw-root">
        <button className="bw-back" onClick={() => navigate(-1)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ width: 13, height: 13 }}
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        <h2 className="bw-title">
          {category} Workers
          <span className="bw-count">{workers.length} found</span>
        </h2>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.32)" }}>
          Browse talented professionals in this category.
        </p>
        <div className="bw-divider" />

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "rgba(255,255,255,0.3)",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        ) : (
          <div className="bw-grid">
            {workers.length === 0 ? (
              <div
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  padding: "64px 20px",
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 18,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
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
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>
                  No workers listed in this category yet.
                </div>
              </div>
            ) : (
              workers.map((w) => {
                const name = w.workerId?.name || w.name || "Worker";
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const skills = w.skills || [];

                // ✅ Only show description if worker manually wrote it
                const showDesc =
                  w.description && !isBlipDescription(w.description);

                return (
                  <div key={w._id} className="bw-card">
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 13,
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
                        {initials}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 16,
                            fontWeight: 700,
                            color: "#fff",
                            margin: "0 0 3px",
                          }}
                        >
                          {name}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              background: "rgba(200,241,53,0.1)",
                              color: "#c8f135",
                              fontSize: 10.5,
                              fontWeight: 600,
                              padding: "2px 9px",
                              borderRadius: 20,
                              letterSpacing: "0.06em",
                              textTransform: "capitalize",
                            }}
                          >
                            {w.category || category}
                          </span>
                          {w.avgRating > 0 && (
                            <span
                              style={{
                                fontSize: 11.5,
                                color: "#fbbf24",
                                fontWeight: 600,
                              }}
                            >
                              ★ {w.avgRating}
                            </span>
                          )}
                        </div>
                      </div>
                      {(w.priceMin || w.priceMax) && (
                        <div
                          style={{
                            marginLeft: "auto",
                            textAlign: "right",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "'Syne',sans-serif",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#c8f135",
                            }}
                          >
                            ₹{w.priceMin || 0}–{w.priceMax || "?"}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "rgba(255,255,255,0.3)",
                            }}
                          >
                            price range
                          </div>
                        </div>
                      )}
                    </div>

                    {/* ✅ Show worker's own description — NEVER BLIP output */}
                    {showDesc && (
                      <p
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.45)",
                          lineHeight: 1.65,
                          marginBottom: 12,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {w.description}
                      </p>
                    )}

                    {/* ✅ Show skills instead of BLIP description */}
                    {skills.length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 6,
                          marginBottom: 14,
                        }}
                      >
                        {skills.slice(0, 4).map((sk) => (
                          <span
                            key={sk}
                            style={{
                              padding: "3px 10px",
                              background: "rgba(200,241,53,0.08)",
                              color: "#c8f135",
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              border: "1px solid rgba(200,241,53,0.15)",
                            }}
                          >
                            {sk}
                          </span>
                        ))}
                        {skills.length > 4 && (
                          <span
                            style={{
                              padding: "3px 10px",
                              background: "rgba(255,255,255,0.05)",
                              color: "rgba(255,255,255,0.35)",
                              borderRadius: 20,
                              fontSize: 11,
                            }}
                          >
                            +{skills.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Experience */}
                    {w.experience && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.3)",
                          marginBottom: 14,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ width: 11, height: 11 }}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        {w.experience} experience
                      </div>
                    )}

                    <button
                      className="bw-btn"
                      onClick={() =>
                        navigate("/client/worker/" + w.workerId?._id)
                      }
                    >
                      View Profile
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        style={{ width: 14, height: 14 }}
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}
