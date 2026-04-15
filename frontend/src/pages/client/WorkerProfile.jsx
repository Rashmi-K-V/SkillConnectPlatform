// src/pages/client/WorkerProfile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { CATEGORY_DATA } from "../../data/categoryData.js";

export default function WorkerProfile() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("overview"); // overview | book
  const [booking, setBooking] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [bookForm, setBookForm] = useState({
    description: "",
    location: "",
    price: "",
    selectedWorkType: "",
    paymentMethod: "cash", // cash | upi | bank_transfer
    upiId: "",
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
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`,
          );
          const d = await r.json();
          // ✅ Shorten address — just show area, city (not full 200 char string)
          const addr = d.address;
          const short =
            [
              addr?.suburb || addr?.neighbourhood,
              addr?.city || addr?.town,
              addr?.state,
            ]
              .filter(Boolean)
              .join(", ") || d.display_name;
          setBookForm((p) => ({ ...p, location: short }));
        } catch {
          setBookForm((p) => ({
            ...p,
            location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
          }));
        } finally {
          setLocLoading(false);
        }
      },
      () => {
        alert("Could not get location.");
        setLocLoading(false);
      },
    );
  };

  const handleBook = async () => {
    if (!bookForm.description.trim()) {
      alert("Please describe what you need.");
      return;
    }
    if (bookForm.paymentMethod === "upi" && !bookForm.upiId.trim()) {
      alert("Please enter your UPI ID.");
      return;
    }
    setBooking(true);
    try {
      await api.post("/jobs", {
        workerId,
        description: bookForm.selectedWorkType
          ? `${bookForm.selectedWorkType}: ${bookForm.description}`
          : bookForm.description,
        location: bookForm.location,
        price: bookForm.price ? Number(bookForm.price) : undefined,
        paymentMethod: bookForm.paymentMethod,
        upiId: bookForm.upiId || undefined,
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
  const catData = CATEGORY_DATA[portfolio.category] || null;
  const selectedServices =
    catData?.workTypes.filter((w) =>
      (portfolio.selectedWorkTypes || []).includes(w.id),
    ) || [];

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
  const card = {
    background: "#141414",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  };
  const lb = {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.38)",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    display: "block",
    marginBottom: 7,
  };

  const PAYMENT_OPTIONS = [
    { id: "cash", label: "💵 Cash", desc: "Pay in cash on completion" },
    { id: "upi", label: "📱 UPI", desc: "Google Pay, PhonePe, Paytm etc." },
    {
      id: "bank_transfer",
      label: "🏦 Bank Transfer",
      desc: "NEFT / IMPS transfer",
    },
  ];

  return (
    <div style={{ maxWidth: 640, fontFamily: "'Manrope',sans-serif" }}>
      <style>{`
        .wp-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.09)!important;}
        .wp-loc-btn:hover{border-color:#c8f135!important;color:#c8f135!important;}
        .wp-pay:hover{border-color:rgba(255,255,255,0.22)!important;}
        @keyframes spin{to{transform:rotate(360deg)}}
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

      {/* Header — ✅ NO description shown here (BLIP output was garbage) */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f97316,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
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
                fontSize: 21,
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
                marginBottom: 8,
              }}
            >
              {catData && (
                <span
                  style={{
                    padding: "3px 11px",
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: "rgba(200,241,53,0.1)",
                    color: "#c8f135",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {catData.icon} {catData.label}
                </span>
              )}
              {portfolio.avgRating > 0 && (
                <span
                  style={{ fontSize: 12.5, color: "#fbbf24", fontWeight: 600 }}
                >
                  ★ {portfolio.avgRating} ({portfolio.totalRatings} reviews)
                </span>
              )}
            </div>
            {/* Price range — shown prominently */}
            {(portfolio.priceMin || portfolio.priceMax) && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(200,241,53,0.08)",
                  border: "1px solid rgba(200,241,53,0.2)",
                  borderRadius: 10,
                  padding: "6px 14px",
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Price Range
                </span>
                <span
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#c8f135",
                  }}
                >
                  ₹{Number(portfolio.priceMin || 0).toLocaleString()} – ₹
                  {Number(portfolio.priceMax || 0).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
        {/* ✅ Only show description if worker manually wrote it (not BLIP output) */}
        {portfolio.description && !isBlipDescription(portfolio.description) && (
          <p
            style={{
              fontSize: 13.5,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.7,
              margin: "14px 0 0",
            }}
          >
            {portfolio.description}
          </p>
        )}
      </div>

      {/* Services list */}
      {selectedServices.length > 0 && (
        <div style={card}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: "rgba(255,255,255,0.28)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 14,
            }}
          >
            Services Offered
          </div>
          {selectedServices.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "11px 14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 10,
                marginBottom: 8,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "#fff" }}>
                {s.label}
              </span>
              <span
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#c8f135",
                  flexShrink: 0,
                  marginLeft: 12,
                }}
              >
                ₹{s.minPrice.toLocaleString()}–{s.maxPrice.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <div style={card}>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {[
            { label: "Experience", value: portfolio.experience },
            { label: "Gender", value: portfolio.gender },
            { label: "Contact", value: portfolio.contact },
            {
              label: "Age",
              value: portfolio.age ? `${portfolio.age} yrs` : null,
            },
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

      {/* Languages */}
      {portfolio.languagesKnown?.length > 0 && (
        <div style={card}>
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
        <div style={card}>
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
        <div style={card}>
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
        <div style={card}>
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
                <span style={{ color: "#fbbf24" }}>{"★".repeat(r.rating)}</span>
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
                    Quality: {r.jobQuality}/5
                  </span>
                )}
                {r.timeliness && (
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                  >
                    Timeliness: {r.timeliness}/5
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

      {/* Book section */}
      {view === "overview" ? (
        <button
          onClick={() => setView("book")}
          style={{
            width: "100%",
            padding: "15px",
            background: "#c8f135",
            color: "#0d0d0d",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          Book {name}
        </button>
      ) : (
        <div style={{ ...card, border: "1px solid rgba(200,241,53,0.2)" }}>
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
            Describe what you need. The worker will confirm or negotiate.
          </div>

          {/* Select service */}
          {selectedServices.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <label style={lb}>Select Service</label>
              {selectedServices.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setBookForm((p) => ({
                      ...p,
                      selectedWorkType: s.label,
                      price: s.minPrice,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${bookForm.selectedWorkType === s.label ? "#c8f135" : "rgba(255,255,255,0.1)"}`,
                    background:
                      bookForm.selectedWorkType === s.label
                        ? "rgba(200,241,53,0.08)"
                        : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "'Manrope',sans-serif",
                    marginBottom: 6,
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color:
                        bookForm.selectedWorkType === s.label
                          ? "#c8f135"
                          : "#fff",
                    }}
                  >
                    {s.label}
                  </span>
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}
                  >
                    ₹{s.minPrice.toLocaleString()}–{s.maxPrice.toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: 12 }}>
            <label style={lb}>What do you need? *</label>
            <textarea
              className="wp-inp"
              value={bookForm.description}
              rows={3}
              onChange={(e) =>
                setBookForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Describe the job in detail…"
              style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Location — ✅ Fix 3: truncated, short address */}
          <div style={{ marginBottom: 12 }}>
            <label style={lb}>Location</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="wp-inp"
                value={bookForm.location}
                onChange={(e) =>
                  setBookForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Your address…"
                style={{
                  ...inp,
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              />
              <button
                className="wp-loc-btn"
                onClick={useCurrentLocation}
                disabled={locLoading}
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
                  "📍"
                )}
                {locLoading ? "Getting…" : "Current"}
              </button>
            </div>
          </div>

          {/* Budget */}
          <div style={{ marginBottom: 16 }}>
            <label style={lb}>Your Budget (₹)</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: 13,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  pointerEvents: "none",
                }}
              >
                ₹
              </span>
              <input
                className="wp-inp"
                type="number"
                value={bookForm.price}
                onChange={(e) =>
                  setBookForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder="Optional"
                style={{ ...inp, paddingLeft: 28 }}
              />
            </div>
          </div>

          {/* ✅ Payment Method */}
          <div style={{ marginBottom: 16 }}>
            <label style={lb}>Payment Method *</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className="wp-pay"
                  onClick={() =>
                    setBookForm((p) => ({
                      ...p,
                      paymentMethod: opt.id,
                      upiId: opt.id !== "upi" ? "" : p.upiId,
                    }))
                  }
                  style={{
                    padding: "11px 14px",
                    borderRadius: 10,
                    border: `1.5px solid ${bookForm.paymentMethod === opt.id ? "#c8f135" : "rgba(255,255,255,0.1)"}`,
                    background:
                      bookForm.paymentMethod === opt.id
                        ? "rgba(200,241,53,0.08)"
                        : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontFamily: "'Manrope',sans-serif",
                    transition: "all 0.15s",
                    textAlign: "left",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13.5,
                      fontWeight: 600,
                      color:
                        bookForm.paymentMethod === opt.id ? "#c8f135" : "#fff",
                    }}
                  >
                    {opt.label}
                  </span>
                  <span
                    style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)" }}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
            {/* UPI ID input */}
            {bookForm.paymentMethod === "upi" && (
              <input
                className="wp-inp"
                value={bookForm.upiId}
                onChange={(e) =>
                  setBookForm((p) => ({ ...p, upiId: e.target.value }))
                }
                placeholder="yourname@upi"
                style={{ ...inp, marginTop: 10 }}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setView("overview")}
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
    </div>
  );
}

// Helper — detect BLIP-generated garbage descriptions
function isBlipDescription(text) {
  if (!text) return true;
  const blipPhrases = [
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
  ];
  return blipPhrases.some((b) => text.toLowerCase().includes(b));
}
