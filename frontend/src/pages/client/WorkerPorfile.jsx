import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { LanguageContext } from "../../context/LanguageContext.jsx";

export default function WorkerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    price: "",
    address: "",
  });

  useEffect(() => {
    fetchWorker();
  }, [id, lang]);

  const fetchWorker = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/portfolio/${id}?lang=${lang}`);
      setWorker(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestJob = async () => {
    if (!form.description.trim()) return;
    setBooking(true);
    try {
      const res = await api.post("/jobs", {
        workerId: id,
        description: form.description,
        price: form.price ? Number(form.price) : undefined,
        location: {
          address: form.address,
          lat: 12.9716,
          lng: 77.5946,
        },
      });
      navigate(`/client/job/${res.data._id}`);
    } catch (err) {
      alert(
        "Failed to send request: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setBooking(false);
    }
  };

  const s = {
    root: {
      fontFamily: "'Manrope','Segoe UI',sans-serif",
      minHeight: "100vh",
      background: "#0d0d0d",
      padding: "36px 28px 48px",
      boxSizing: "border-box",
    },
    back: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 12,
      fontWeight: 600,
      color: "rgba(255,255,255,0.3)",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: 0,
      marginBottom: 20,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      fontFamily: "'Manrope',sans-serif",
    },
    card: {
      background: "#1a1a1a",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18,
      padding: 28,
      marginBottom: 16,
    },
    lbl: {
      fontSize: 11,
      fontWeight: 600,
      color: "rgba(255,255,255,0.35)",
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      display: "block",
      marginBottom: 6,
    },
    inp: {
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
    },
    skill: {
      padding: "5px 12px",
      background: "rgba(200,241,53,0.1)",
      color: "#c8f135",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      border: "1px solid rgba(200,241,53,0.2)",
    },
    btnMain: {
      width: "100%",
      padding: "14px",
      background: "#c8f135",
      border: "none",
      borderRadius: 12,
      color: "#0d0d0d",
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      fontFamily: "'Manrope',sans-serif",
    },
    btnSec: {
      width: "100%",
      padding: "12px",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 12,
      color: "rgba(255,255,255,0.6)",
      fontSize: 14,
      cursor: "pointer",
      fontFamily: "'Manrope',sans-serif",
      marginTop: 8,
    },
  };

  if (loading)
    return (
      <div
        style={{
          ...s.root,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          Loading profile…
        </div>
      </div>
    );

  if (!worker)
    return (
      <div
        style={{
          ...s.root,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          Worker not found.
        </div>
      </div>
    );

  const name = worker.workerId?.name || "Worker";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const skills = worker.skills || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .wp-btn-main:hover { opacity: 0.88; }
        .wp-back:hover { color: #c8f135 !important; }
      `}</style>

      <div style={s.root}>
        <button className="wp-back" style={s.back} onClick={() => navigate(-1)}>
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

        <div style={{ maxWidth: 600 }}>
          {/* Profile header */}
          <div
            style={{
              ...s.card,
              display: "flex",
              alignItems: "center",
              gap: 20,
              marginBottom: 16,
            }}
          >
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
              }}
            >
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 3,
                  textTransform: "capitalize",
                }}
              >
                {worker.category || "Worker"}
              </div>
              {worker.experience && (
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.3)",
                    marginTop: 2,
                  }}
                >
                  {worker.experience} experience
                </div>
              )}
            </div>
            {worker.pricing && (
              <div
                style={{
                  background: "rgba(200,241,53,0.1)",
                  border: "1px solid rgba(200,241,53,0.2)",
                  borderRadius: 10,
                  padding: "10px 16px",
                  textAlign: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#c8f135",
                  }}
                >
                  {worker.pricing}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  per job
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {(worker.translatedDescription || worker.description) && (
            <div style={s.card}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 10,
                }}
              >
                About
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                {worker.translatedDescription || worker.description}
              </p>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div style={s.card}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Skills
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {skills.map((sk) => (
                  <span key={sk} style={s.skill}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Video */}
          {worker.videoUrl && (
            <div style={s.card}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Work video
              </div>
              <video
                src={worker.videoUrl}
                controls
                style={{
                  width: "100%",
                  borderRadius: 10,
                  maxHeight: 280,
                  background: "#000",
                }}
              />
            </div>
          )}

          {/* Book button or form */}
          {!showForm ? (
            <button
              className="wp-btn-main"
              style={s.btnMain}
              onClick={() => setShowForm(true)}
            >
              Request this Worker
            </button>
          ) : (
            <div style={s.card}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 20,
                }}
              >
                Send Job Request
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={s.lbl}>Describe what you need *</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="e.g. Fix ceiling fan, install 2 sockets near the kitchen counter…"
                  rows={4}
                  style={{ ...s.inp, resize: "none" }}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={s.lbl}>Your address</label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="e.g. 12th Cross, Koramangala, Bengaluru"
                  style={s.inp}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={s.lbl}>Your budget (₹) — optional</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder={`Worker charges: ${worker.pricing || "negotiable"}`}
                  style={s.inp}
                />
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.25)",
                    marginTop: 6,
                  }}
                >
                  Leave blank to use worker's rate. You can negotiate after
                  sending.
                </div>
              </div>

              <button
                className="wp-btn-main"
                style={{
                  ...s.btnMain,
                  opacity: !form.description.trim() || booking ? 0.5 : 1,
                }}
                disabled={!form.description.trim() || booking}
                onClick={requestJob}
              >
                {booking ? "Sending request…" : "Send Request →"}
              </button>
              <button style={s.btnSec} onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
