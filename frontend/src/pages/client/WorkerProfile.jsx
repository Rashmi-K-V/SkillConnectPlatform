// src/pages/client/WorkerProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";

export default function WorkerProfile() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [booking, setBooking] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [bookForm, setBookForm] = useState({
    description: "",
    location: "",
    price: "",
  });

  useEffect(() => {
    api
      .get(`/portfolios/worker/${workerId}`)
      .then((r) => setPortfolio(r.data))
      .catch(() => setPortfolio(null))
      .finally(() => setLoading(false));
  }, [workerId]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode using OpenStreetMap Nominatim (free, no key needed)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          );
          const data = await res.json();
          const addr =
            data.display_name ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setBookForm((p) => ({ ...p, location: addr }));
        } catch {
          setBookForm((p) => ({
            ...p,
            location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          }));
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        alert("Could not get location. Please enter manually.");
        setLocLoading(false);
      },
    );
  };

  const handleBook = async () => {
    if (!bookForm.description.trim()) {
      alert("Please describe what you need.");
      return;
    }
    setBooking(true);
    try {
      await api.post("/jobs", {
        workerId,
        description: bookForm.description,
        location: bookForm.location,
        price: bookForm.price ? Number(bookForm.price) : undefined,
      });
      alert("Job request sent! The worker will be notified.");
      navigate("/client/jobs");
    } catch (err) {
      alert("Booking failed: " + (err.response?.data?.message || err.message));
    } finally {
      setBooking(false);
    }
  };

  if (loading)
    return (
      <div
        style={{
          fontFamily: "'Manrope',sans-serif",
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        Loading profile…
      </div>
    );

  if (!portfolio)
    return (
      <div
        style={{
          fontFamily: "'Manrope',sans-serif",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>😕</div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
          }}
        >
          Profile not found
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#c8f135",
            color: "#0d0d0d",
            border: "none",
            borderRadius: 10,
            padding: "10px 20px",
            fontSize: 13.5,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          ← Go Back
        </button>
      </div>
    );

  const name = portfolio.workerId?.name || portfolio.name || "Worker";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const inp = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Manrope',sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ maxWidth: 620, fontFamily: "'Manrope',sans-serif" }}>
      <style>{`
        .wp-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.09)!important;}
        .wp-loc-btn:hover{border-color:#c8f135!important;color:#c8f135!important;}
      `}</style>

      <button
        onClick={() => navigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.35)",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "'Manrope',sans-serif",
          marginBottom: 20,
          padding: 0,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ width: 14, height: 14 }}
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 20,
          padding: 24,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 18,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f97316,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {portfolio.workerId?.profilePicture ? (
              <img
                src={portfolio.workerId.profilePicture}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 20,
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 6px",
              }}
            >
              {name}
            </h2>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  padding: "3px 11px",
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 600,
                  background: "rgba(200,241,53,0.1)",
                  color: "#c8f135",
                  textTransform: "capitalize",
                }}
              >
                {portfolio.category || "General"}
              </span>
              {portfolio.avgRating > 0 && (
                <span
                  style={{ fontSize: 12.5, color: "#fbbf24", fontWeight: 600 }}
                >
                  ★ {portfolio.avgRating} ({portfolio.totalRatings} reviews)
                </span>
              )}
            </div>
          </div>
        </div>
        {portfolio.description && (
          <p
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
            }}
          >
            {portfolio.description}
          </p>
        )}
      </div>

      {/* Details grid */}
      <div
        style={{
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 14,
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {[
            { label: "Experience", value: portfolio.experience },
            {
              label: "Pricing",
              value: portfolio.pricing ? `₹${portfolio.pricing}` : null,
            },
            { label: "Gender", value: portfolio.gender },
            { label: "Contact", value: portfolio.contact },
          ]
            .filter((d) => d.value)
            .map((d) => (
              <div
                key={d.label}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.28)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: 4,
                  }}
                >
                  {d.label}
                </div>
                <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>
                  {d.value}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Languages Known */}
      {portfolio.languagesKnown?.length > 0 && (
        <div
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            Languages Known
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {portfolio.languagesKnown.map((l) => (
              <span
                key={l}
                style={{
                  padding: "5px 13px",
                  background: "rgba(96,165,250,0.1)",
                  color: "#60a5fa",
                  borderRadius: 20,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: "1px solid rgba(96,165,250,0.2)",
                }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {portfolio.skills?.length > 0 && (
        <div
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            Skills
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {portfolio.skills.map((sk) => (
              <span
                key={sk}
                style={{
                  padding: "5px 13px",
                  background: "rgba(200,241,53,0.1)",
                  color: "#c8f135",
                  borderRadius: 20,
                  fontSize: 12.5,
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

      {/* Video */}
      {portfolio.videoUrl && (
        <div
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 12,
            }}
          >
            Work Video
          </div>
          <video
            src={portfolio.videoUrl}
            controls
            style={{
              width: "100%",
              borderRadius: 10,
              maxHeight: 240,
              background: "#000",
            }}
          />
        </div>
      )}

      {/* Client Reviews */}
      {portfolio.reviews?.length > 0 && (
        <div
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 14,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 16,
            }}
          >
            Client Reviews ({portfolio.reviews.length})
          </div>
          {portfolio.reviews.map((r, i) => (
            <div
              key={i}
              style={{
                padding: "14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                marginBottom: 10,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {r.clientName || "Client"}
                </span>
                <span style={{ color: "#fbbf24" }}>
                  {"★".repeat(r.rating)}
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>
                    {"★".repeat(5 - r.rating)}
                  </span>
                </span>
              </div>
              {r.comment && (
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.5,
                    margin: "0 0 8px",
                  }}
                >
                  {r.comment}
                </p>
              )}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {r.jobQuality && (
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                  >
                    Job Quality: {r.jobQuality}/5
                  </span>
                )}
                {r.timeliness && (
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                  >
                    Timeliness: {r.timeliness}/5
                  </span>
                )}
                {r.communication && (
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                  >
                    Communication: {r.communication}/5
                  </span>
                )}
                {r.wouldRecommend !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      color: r.wouldRecommend ? "#4ade80" : "#f87171",
                    }}
                  >
                    {r.wouldRecommend
                      ? "👍 Recommends"
                      : "👎 Doesn't recommend"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book */}
      {!showBook ? (
        <button
          onClick={() => setShowBook(true)}
          style={{
            width: "100%",
            padding: "14px",
            background: "#c8f135",
            color: "#0d0d0d",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Book {name}
        </button>
      ) : (
        <div
          style={{
            background: "#141414",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16,
            padding: 22,
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            Book {name}
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 18,
            }}
          >
            Describe what you need — the worker will confirm or negotiate.
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.38)",
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                display: "block",
                marginBottom: 6,
              }}
            >
              What do you need? *
            </label>
            <textarea
              className="wp-inp"
              value={bookForm.description}
              rows={3}
              onChange={(e) =>
                setBookForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="e.g. Blouse stitching, fix leaking pipe…"
              style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Location with current location button */}
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.38)",
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Location
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="wp-inp"
                value={bookForm.location}
                onChange={(e) =>
                  setBookForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Your address…"
                style={{ ...inp, flex: 1 }}
              />
              <button
                className="wp-loc-btn"
                onClick={useCurrentLocation}
                disabled={locLoading}
                title="Use current location"
                style={{
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.5)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.15s",
                  flexShrink: 0,
                }}
              >
                {locLoading ? (
                  <div
                    style={{
                      width: 13,
                      height: 13,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.2)",
                      borderTopColor: "#c8f135",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ width: 14, height: 14 }}
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
                    <circle cx="12" cy="12" r="10" strokeDasharray="3 3" />
                  </svg>
                )}
                {locLoading ? "Getting…" : "📍 Current"}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.38)",
                textTransform: "uppercase",
                letterSpacing: "0.09em",
                display: "block",
                marginBottom: 6,
              }}
            >
              Your Budget (₹)
            </label>
            <input
              className="wp-inp"
              type="number"
              value={bookForm.price}
              onChange={(e) =>
                setBookForm((p) => ({ ...p, price: e.target.value }))
              }
              placeholder="Optional"
              style={inp}
            />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowBook(false)}
              style={{
                flex: 1,
                padding: "11px",
                background: "rgba(255,255,255,0.07)",
                border: "none",
                borderRadius: 10,
                color: "rgba(255,255,255,0.5)",
                fontSize: 13.5,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleBook}
              disabled={booking}
              style={{
                flex: 2,
                padding: "11px",
                background: booking ? "rgba(200,241,53,0.5)" : "#c8f135",
                border: "none",
                borderRadius: 10,
                color: "#0d0d0d",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: booking ? "not-allowed" : "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              {booking ? "Sending…" : "Send Job Request"}
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
