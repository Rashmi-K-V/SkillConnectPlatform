// src/pages/client/MyJobs.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";

const STATUS_COLORS = {
  pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Pending" },
  accepted: {
    bg: "rgba(74,222,128,0.12)",
    color: "#4ade80",
    label: "Accepted",
  },
  rejected: {
    bg: "rgba(248,113,113,0.12)",
    color: "#f87171",
    label: "Rejected",
  },
  completed: {
    bg: "rgba(96,165,250,0.12)",
    color: "#60a5fa",
    label: "Completed",
  },
  ongoing: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa", label: "Ongoing" },
};

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          style={{
            fontSize: 24,
            cursor: "pointer",
            color:
              (hover || value) >= star ? "#fbbf24" : "rgba(255,255,255,0.15)",
            transition: "color 0.1s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ETAProgress({ job }) {
  // Simple visual progress based on status
  const steps = ["Booked", "Worker En Route", "In Progress", "Done"];
  const idx =
    job.status === "accepted"
      ? 1
      : job.status === "ongoing"
        ? 2
        : job.status === "completed"
          ? 3
          : 0;
  const pct = Math.round((idx / 3) * 100);

  return (
    <div
      style={{
        marginTop: 16,
        padding: "16px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Job Progress
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#c8f135" }}>
          {pct}%
        </span>
      </div>
      {/* Progress bar */}
      <div
        style={{
          height: 6,
          borderRadius: 6,
          background: "rgba(255,255,255,0.07)",
          marginBottom: 14,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 6,
            background: "#c8f135",
            width: `${pct}%`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      {/* Steps */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {steps.map((step, i) => (
          <div key={step} style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                margin: "0 auto 4px",
                background: i <= idx ? "#c8f135" : "rgba(255,255,255,0.08)",
                border: i === idx ? "2px solid #c8f135" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
            >
              {i < idx && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d0d0d"
                  strokeWidth="3"
                  style={{ width: 10, height: 10 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div
              style={{
                fontSize: 10,
                color:
                  i <= idx ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)",
                fontWeight: i === idx ? 600 : 400,
              }}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
      {job.eta && (
        <div
          style={{
            marginTop: 12,
            fontSize: 12.5,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          🕐 Estimated arrival:{" "}
          <span style={{ color: "#c8f135", fontWeight: 600 }}>{job.eta}</span>
        </div>
      )}
    </div>
  );
}

function RatingModal({ job, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!rating) {
      alert("Please select a rating.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(job._id, rating, feedback);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 100,
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
          maxWidth: 420,
        }}
      >
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          Rate {job.workerId?.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 20,
          }}
        >
          How was your experience?
        </div>
        <div style={{ marginBottom: 18 }}>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave a comment (optional)…"
          rows={3}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#fff",
            fontSize: 13.5,
            fontFamily: "'Manrope',sans-serif",
            outline: "none",
            resize: "vertical",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: 10,
              color: "rgba(255,255,255,0.6)",
              fontSize: 13.5,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{
              flex: 2,
              padding: "11px",
              background: "#c8f135",
              border: "none",
              borderRadius: 10,
              color: "#0d0d0d",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Submitting…" : "Submit Rating"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active"); // active | past
  const [ratingJob, setRatingJob] = useState(null);
  const [chatJob, setChatJob] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = () => {
    setLoading(true);
    api
      .get("/jobs/client")
      .then((r) => setJobs(r.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleRate = async (jobId, rating, feedback) => {
    await api.post(`/jobs/${jobId}/rate`, { rating, feedback });
    fetchJobs();
  };

  const active = jobs.filter((j) =>
    ["pending", "accepted", "ongoing"].includes(j.status),
  );
  const past = jobs.filter((j) => ["completed", "rejected"].includes(j.status));
  const shown = tab === "active" ? active : past;

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 22,
    marginBottom: 14,
  };
  const lb = {
    fontSize: 10,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "rgba(255,255,255,0.28)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {ratingJob && (
        <RatingModal
          job={ratingJob}
          onClose={() => setRatingJob(null)}
          onSubmit={handleRate}
        />
      )}
      {chatJob && <ChatDrawer job={chatJob} onClose={() => setChatJob(null)} />}

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
          My Jobs
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
          Track your bookings, chat with workers, and leave feedback.
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 20,
          padding: "4px",
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12,
          width: "fit-content",
        }}
      >
        {[
          { id: "active", label: `Active (${active.length})` },
          { id: "past", label: `Past (${past.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              border: "none",
              fontFamily: "'Manrope',sans-serif",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: tab === t.id ? "#c8f135" : "transparent",
              color: tab === t.id ? "#0d0d0d" : "rgba(255,255,255,0.4)",
              transition: "all 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

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
              border: "2px solid rgba(255,255,255,0.2)",
              borderTopColor: "#c8f135",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          Loading jobs…
        </div>
      ) : shown.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>
            {tab === "active" ? "📋" : "📁"}
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {tab === "active" ? "No active jobs" : "No past jobs"}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 20,
            }}
          >
            {tab === "active"
              ? "Browse workers to book a service."
              : "Your completed jobs will appear here."}
          </div>
          {tab === "active" && (
            <button
              onClick={() => navigate("/client/browse-all")}
              style={{
                background: "#c8f135",
                color: "#0d0d0d",
                border: "none",
                borderRadius: 10,
                padding: "11px 24px",
                fontSize: 13.5,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              Browse Workers
            </button>
          )}
        </div>
      ) : (
        shown.map((job) => {
          const st = STATUS_COLORS[job.status] || STATUS_COLORS.pending;
          const workerName = job.workerId?.name || "Worker";
          const isActive = ["accepted", "ongoing"].includes(job.status);
          const canRate = job.status === "completed" && !job.rating;

          return (
            <div key={job._id} style={card}>
              {/* Job header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 14,
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    {job.description?.slice(0, 60)}
                    {job.description?.length > 60 ? "…" : ""}
                  </div>
                  <div
                    style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)" }}
                  >
                    Worker:{" "}
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {workerName}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: st.bg,
                    color: st.color,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {st.label}
                </span>
              </div>

              {/* Job details row */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                {job.price && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <span style={lb}>Price</span>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#c8f135",
                        fontFamily: "'Syne',sans-serif",
                      }}
                    >
                      ₹{job.price}
                    </div>
                  </div>
                )}
                {job.location && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 10,
                      padding: "10px 14px",
                    }}
                  >
                    <span style={lb}>Location</span>
                    <div style={{ fontSize: 13, color: "#fff" }}>
                      {job.location}
                    </div>
                  </div>
                )}
              </div>

              {/* ETA Progress — shown when accepted or ongoing */}
              {isActive && <ETAProgress job={job} />}

              {/* Rating display — if already rated */}
              {job.rating && (
                <div
                  style={{
                    marginTop: 14,
                    padding: "12px 16px",
                    background: "rgba(251,191,36,0.06)",
                    borderRadius: 12,
                    border: "1px solid rgba(251,191,36,0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 4,
                    }}
                  >
                    Your Rating
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div>
                      {"★".repeat(job.rating)}
                      <span style={{ color: "rgba(255,255,255,0.15)" }}>
                        {"★".repeat(5 - job.rating)}
                      </span>
                    </div>
                    <span
                      style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
                    >
                      {job.feedback || ""}
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 16,
                  flexWrap: "wrap",
                }}
              >
                {isActive && (
                  <button
                    onClick={() => setChatJob(job)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 16px",
                      background: "rgba(167,139,250,0.12)",
                      border: "1px solid rgba(167,139,250,0.25)",
                      borderRadius: 10,
                      color: "#a78bfa",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: 14, height: 14 }}
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Chat
                  </button>
                )}
                {isActive && (
                  <a
                    href={`tel:${job.workerId?.contact || ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 16px",
                      background: "rgba(34,197,94,0.1)",
                      border: "1px solid rgba(34,197,94,0.2)",
                      borderRadius: 10,
                      color: "#4ade80",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "none",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{ width: 14, height: 14 }}
                    >
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.9a16 16 0 0 0 6.09 6.09l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Call
                  </a>
                )}
                {canRate && (
                  <button
                    onClick={() => setRatingJob(job)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 16px",
                      background: "#c8f135",
                      border: "none",
                      borderRadius: 10,
                      color: "#0d0d0d",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    ★ Rate & Review
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/client/worker/${job.workerId?._id}`)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "9px 16px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  View Profile
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── CHAT DRAWER ────────────────────────────────────────────────
function ChatDrawer({ job, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const bottomRef = useRef();

  // Get client's language from context/token
  function getClientLang() {
    try {
      const token = localStorage.getItem("token");
      const p = JSON.parse(atob(token.split(".")[1]));
      return p.language || "en";
    } catch {
      return "en";
    }
  }

  useEffect(() => {
    api
      .get(`/messages/${job._id}`)
      .then((r) => setMessages(r.data || []))
      .catch(() => {});
  }, [job._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content, audioBlob = null) => {
    if (!content?.trim() && !audioBlob) return;
    setSending(true);
    try {
      const fd = new FormData();
      if (content) fd.append("text", content);
      if (audioBlob) fd.append("audio", audioBlob, "voice.webm");
      fd.append("targetLang", getClientLang());
      const r = await api.post(`/messages/${job._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessages((prev) => [...prev, r.data]);
      setText("");
    } catch (e) {
      alert("Send failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  // Web Speech API voice recording
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = "en-US"; // worker may speak any lang — backend handles translation
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.start();
  };

  const clientLang = getClientLang();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          height: "80vh",
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              Chat with {job.workerId?.name || "Worker"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.3)",
                marginTop: 2,
              }}
            >
              Messages translated to your language automatically
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.08) transparent",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.25)",
                fontSize: 13,
                marginTop: 40,
              }}
            >
              No messages yet. Say hello!
            </div>
          )}
          {messages.map((m, i) => {
            const isMe = m.senderRole === "client";
            return (
              <div
                key={m._id || i}
                style={{
                  display: "flex",
                  flexDirection: isMe ? "row-reverse" : "row",
                  gap: 8,
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: isMe
                      ? "linear-gradient(135deg,#f97316,#ec4899)"
                      : "linear-gradient(135deg,#6366f1,#a78bfa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {isMe ? "You" : (job.workerId?.name || "W")[0].toUpperCase()}
                </div>
                <div style={{ maxWidth: "70%" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: isMe
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                      background: isMe ? "#c8f135" : "rgba(255,255,255,0.07)",
                      fontSize: 13.5,
                      color: isMe ? "#0d0d0d" : "#fff",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.translatedText || m.text}
                  </div>
                  {m.translatedText && m.text !== m.translatedText && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.25)",
                        marginTop: 3,
                        paddingLeft: 4,
                      }}
                    >
                      Original: {m.text}
                    </div>
                  )}
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "rgba(255,255,255,0.25)",
                      marginTop: 3,
                      textAlign: isMe ? "right" : "left",
                    }}
                  >
                    {new Date(m.createdAt || Date.now()).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: 8,
            flexShrink: 0,
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && sendMessage(text)
            }
            placeholder="Type a message…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#fff",
              fontSize: 13.5,
              fontFamily: "'Manrope',sans-serif",
              outline: "none",
            }}
          />
          {/* Voice button */}
          <button
            onClick={startListening}
            title="Speak"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "none",
              background: listening
                ? "rgba(239,68,68,0.2)"
                : "rgba(255,255,255,0.07)",
              color: listening ? "#f87171" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: 16, height: 16 }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
          {/* Send button */}
          <button
            onClick={() => sendMessage(text)}
            disabled={sending || !text.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "none",
              background: text.trim() ? "#c8f135" : "rgba(255,255,255,0.07)",
              color: text.trim() ? "#0d0d0d" : "rgba(255,255,255,0.3)",
              cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ width: 15, height: 15 }}
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
