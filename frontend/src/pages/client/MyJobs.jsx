// src/pages/client/MyJobs.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { getSocket } from "../../services/socket.services.js";

function getClientLang() {
  try {
    return (
      JSON.parse(atob(localStorage.getItem("token").split(".")[1])).language ||
      "en"
    );
  } catch {
    return "en";
  }
}

const STATUS = {
  pending: {
    bg: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    label: "Awaiting Response",
  },
  negotiating: {
    bg: "rgba(167,139,250,0.12)",
    color: "#a78bfa",
    label: "Negotiating",
  },
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
  ongoing: {
    bg: "rgba(167,139,250,0.12)",
    color: "#a78bfa",
    label: "En Route",
  },
  verified: {
    bg: "rgba(96,165,250,0.12)",
    color: "#60a5fa",
    label: "Work Started",
  },
  completed: {
    bg: "rgba(74,222,128,0.12)",
    color: "#4ade80",
    label: "Completed",
  },
  rated: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Reviewed" },
};

// ── Notification Toast ────────────────────────────────────────
function Toast({ notif, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 300,
        background: "#1a1a1a",
        border: "1px solid rgba(200,241,53,0.3)",
        borderRadius: 14,
        padding: "14px 18px",
        maxWidth: 340,
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#c8f135",
            flexShrink: 0,
            marginTop: 5,
          }}
        />
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              marginBottom: 3,
            }}
          >
            {notif.title}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>
            {notif.message}
          </div>
        </div>
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            cursor: "pointer",
            fontSize: 16,
            lineHeight: 1,
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── OTP Verify Modal (client enters OTP to confirm worker arrival) ──
function OtpModal({ job, onClose, onVerified }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError("Enter the 4-digit code.");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/jobs/${job._id}/verify-arrival`, { otp });
      onVerified();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 200,
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
          maxWidth: 360,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          Worker Arrived?
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 24,
          }}
        >
          Enter the 4-digit code the worker shows you to verify their arrival
          and start the job.
        </div>
        <input
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 4));
            setError("");
          }}
          placeholder="_ _ _ _"
          maxLength={4}
          style={{
            width: "100%",
            textAlign: "center",
            fontSize: 28,
            letterSpacing: 12,
            fontWeight: 700,
            background: "rgba(255,255,255,0.06)",
            border: `1px solid ${error ? "#f87171" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 12,
            padding: "16px",
            color: "#fff",
            outline: "none",
            fontFamily: "'Syne',sans-serif",
            boxSizing: "border-box",
            marginBottom: 8,
          }}
        />
        {error && (
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: 10,
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading || otp.length !== 4}
            style={{
              flex: 2,
              padding: "11px",
              background: otp.length === 4 ? "#c8f135" : "rgba(200,241,53,0.3)",
              border: "none",
              borderRadius: 10,
              color: "#0d0d0d",
              fontSize: 13,
              fontWeight: 700,
              cursor: otp.length === 4 ? "pointer" : "not-allowed",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            {loading ? "Verifying…" : "Verify & Start Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Modal ────────────────────────────────────────────
function FeedbackModal({ job, onClose, onSubmit }) {
  const [form, setForm] = useState({
    rating: 0,
    jobQuality: 0,
    timeliness: 0,
    communication: 0,
    wouldRecommend: null,
    comment: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const Stars = ({ field, label }) => (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            onClick={() => setForm((p) => ({ ...p, [field]: s }))}
            style={{
              fontSize: 26,
              cursor: "pointer",
              color: form[field] >= s ? "#fbbf24" : "rgba(255,255,255,0.12)",
              transition: "color 0.1s",
            }}
          >
            ★
          </span>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async () => {
    if (!form.rating) {
      setError("Overall rating is required.");
      return;
    }
    if (form.wouldRecommend === null) {
      setError("Please select whether you'd recommend this worker.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(job._id, form);
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 440,
          margin: "auto",
        }}
      >
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Rate {job.workerId?.name}
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 24,
          }}
        >
          Your feedback helps other clients and improves the worker's profile.
        </div>

        <Stars field="rating" label="Overall Rating *" />
        <Stars field="jobQuality" label="Job Quality" />
        <Stars field="timeliness" label="Timeliness" />
        <Stars field="communication" label="Communication" />

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Would you recommend? *
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { v: true, l: "👍 Yes" },
              { v: false, l: "👎 No" },
            ].map(({ v, l }) => (
              <button
                key={String(v)}
                onClick={() => setForm((p) => ({ ...p, wouldRecommend: v }))}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: `1.5px solid ${form.wouldRecommend === v ? "#c8f135" : "rgba(255,255,255,0.1)"}`,
                  background:
                    form.wouldRecommend === v
                      ? "rgba(200,241,53,0.1)"
                      : "rgba(255,255,255,0.04)",
                  color:
                    form.wouldRecommend === v
                      ? "#c8f135"
                      : "rgba(255,255,255,0.5)",
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Comments
          </div>
          <textarea
            value={form.comment}
            onChange={(e) =>
              setForm((p) => ({ ...p, comment: e.target.value }))
            }
            placeholder="Share your experience…"
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
            }}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: 10,
              color: "rgba(255,255,255,0.5)",
              fontSize: 13,
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
              background: saving ? "rgba(200,241,53,0.5)" : "#c8f135",
              border: "none",
              borderRadius: 10,
              color: "#0d0d0d",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            {saving ? "Submitting…" : "Submit Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────
function ETABar({ job }) {
  const steps = ["Booked", "Accepted", "En Route", "Work Started", "Done"];
  const idx =
    {
      pending: 0,
      negotiating: 0,
      accepted: 1,
      ongoing: 2,
      verified: 3,
      completed: 4,
      rated: 4,
    }[job.status] || 0;
  const pct = Math.round((idx / 4) * 100);
  return (
    <div
      style={{
        marginTop: 14,
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12,
        padding: "14px 16px",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Progress
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#c8f135" }}>
          {pct}%
        </span>
      </div>
      <div
        style={{
          height: 5,
          borderRadius: 5,
          background: "rgba(255,255,255,0.07)",
          marginBottom: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            borderRadius: 5,
            background: "#c8f135",
            width: `${pct}%`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {steps.map((s, i) => (
          <div key={s} style={{ textAlign: "center", flex: 1 }}>
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                margin: "0 auto 3px",
                background:
                  i < idx
                    ? "#c8f135"
                    : i === idx
                      ? "rgba(200,241,53,0.2)"
                      : "rgba(255,255,255,0.08)",
                border: i === idx ? "2px solid #c8f135" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {i < idx && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d0d0d"
                  strokeWidth="3"
                  style={{ width: 8, height: 8 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <div
              style={{
                fontSize: 9,
                color:
                  i <= idx ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)",
                fontWeight: i === idx ? 600 : 400,
              }}
            >
              {s}
            </div>
          </div>
        ))}
      </div>
      {job.eta && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
          }}
        >
          🕐 ETA:{" "}
          <span style={{ color: "#c8f135", fontWeight: 600 }}>{job.eta}</span>
        </div>
      )}
    </div>
  );
}

// ── Negotiate Chat (5-min timer) ──────────────────────────────
function NegotiateChat({ job, onClose, onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const bottomRef = useRef();
  const lang = getClientLang();

  // Countdown timer
  useEffect(() => {
    if (!job.negotiationExpiry) return;
    const update = () => {
      const left = Math.max(0, new Date(job.negotiationExpiry) - Date.now());
      setTimeLeft(left);
      if (left === 0) {
        onClose();
        onRefresh();
      }
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [job.negotiationExpiry, onClose, onRefresh]);

  useEffect(() => {
    api
      .get(`/messages/${job._id}`)
      .then((r) => setMessages(r.data || []))
      .catch(() => {});
  }, [job._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (content) => {
    if (!content?.trim()) return;
    setSending(true);
    try {
      const r = await api.post(`/messages/${job._id}`, {
        text: content,
        targetLang: lang,
      });
      setMessages((p) => [...p, r.data]);
      setText("");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
  const urgent = timeLeft < 60000;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          height: "70vh",
          background: "#141414",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                Negotiation Chat
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)" }}>
                with {job.workerId?.name}
              </div>
            </div>
            {/* Timer */}
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                background: urgent
                  ? "rgba(248,113,113,0.15)"
                  : "rgba(200,241,53,0.1)",
                border: `1px solid ${urgent ? "rgba(248,113,113,0.3)" : "rgba(200,241,53,0.2)"}`,
                color: urgent ? "#f87171" : "#c8f135",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "'Syne',sans-serif",
              }}
            >
              {mins}:{secs.toString().padStart(2, "0")}
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
          {urgent && (
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: "#f87171",
                textAlign: "center",
              }}
            >
              ⚠ Chat closing soon — please decide to accept or reject.
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            scrollbarWidth: "thin",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "rgba(255,255,255,0.25)",
                fontSize: 13,
                marginTop: 30,
              }}
            >
              Worker will chat here to negotiate. Check back or reply.
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
                  gap: 7,
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: isMe
                      ? "linear-gradient(135deg,#f97316,#ec4899)"
                      : "linear-gradient(135deg,#6366f1,#a78bfa)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
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
                      padding: "9px 13px",
                      borderRadius: isMe
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                      background: isMe ? "#c8f135" : "rgba(255,255,255,0.07)",
                      fontSize: 13,
                      color: isMe ? "#0d0d0d" : "#fff",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.translatedText || m.text}
                  </div>
                  {m.translatedText && m.text !== m.translatedText && (
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "rgba(255,255,255,0.22)",
                        marginTop: 2,
                      }}
                    >
                      Original: {m.text}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(text)}
            placeholder="Reply to worker…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 9,
              padding: "9px 13px",
              color: "#fff",
              fontSize: 13,
              fontFamily: "'Manrope',sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={() => send(text)}
            disabled={!text.trim() || sending}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              border: "none",
              background: text.trim() ? "#c8f135" : "rgba(255,255,255,0.07)",
              color: text.trim() ? "#0d0d0d" : "rgba(255,255,255,0.3)",
              cursor: text.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ width: 14, height: 14 }}
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

// ── Main Component ────────────────────────────────────────────
export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");
  const [chatJob, setChatJob] = useState(null);
  const [otpJob, setOtpJob] = useState(null);
  const [feedbackJob, setFeedbackJob] = useState(null);
  const [notif, setNotif] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = useCallback(() => {
    api
      .get("/jobs/client")
      .then((r) => setJobs(r.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Socket notifications
  useEffect(() => {
    const socket = getSocket();

    socket.on("job_accepted", (data) => {
      setNotif({ title: "Job Accepted! 🎉", message: data.message });
      fetchJobs();
    });
    socket.on("job_rejected", (data) => {
      setNotif({ title: "Job Declined", message: data.message });
      fetchJobs();
    });
    socket.on("negotiation_started", (data) => {
      setNotif({
        title: "Worker wants to negotiate 💬",
        message: data.message,
      });
      fetchJobs();
    });
    socket.on("arrival_otp", (data) => {
      setNotif({
        title: `Worker is on the way! 🚗`,
        message: `${data.message} — Tap 'Enter OTP' to verify arrival.`,
      });
      fetchJobs();
    });
    socket.on("job_completed", (data) => {
      setNotif({ title: "Job Completed ✅", message: data.message });
      fetchJobs();
    });

    return () => {
      socket.off("job_accepted");
      socket.off("job_rejected");
      socket.off("negotiation_started");
      socket.off("arrival_otp");
      socket.off("job_completed");
    };
  }, [fetchJobs]);

  const handleFeedback = async (jobId, form) => {
    await api.post(`/jobs/${jobId}/feedback`, form);
    fetchJobs();
  };

  const active = jobs.filter((j) =>
    ["pending", "negotiating", "accepted", "ongoing", "verified"].includes(
      j.status,
    ),
  );
  const past = jobs.filter((j) =>
    ["completed", "rejected", "rated"].includes(j.status),
  );
  const shown = tab === "active" ? active : past;

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 22,
    marginBottom: 14,
  };

  return (
    <div style={{ maxWidth: 680, fontFamily: "'Manrope',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {notif && <Toast notif={notif} onDismiss={() => setNotif(null)} />}
      {chatJob && (
        <NegotiateChat
          job={chatJob}
          onClose={() => setChatJob(null)}
          onRefresh={fetchJobs}
        />
      )}
      {otpJob && (
        <OtpModal
          job={otpJob}
          onClose={() => setOtpJob(null)}
          onVerified={fetchJobs}
        />
      )}
      {feedbackJob && (
        <FeedbackModal
          job={feedbackJob}
          onClose={() => setFeedbackJob(null)}
          onSubmit={handleFeedback}
        />
      )}

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
          Track bookings, verify arrivals, and leave reviews.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          background: "rgba(255,255,255,0.04)",
          padding: 4,
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
              border: "2px solid rgba(255,255,255,0.15)",
              borderTopColor: "#c8f135",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          Loading…
        </div>
      ) : shown.length === 0 ? (
        <div style={{ ...card, textAlign: "center", padding: "44px 24px" }}>
          <div style={{ fontSize: 30, marginBottom: 12 }}>
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
            No {tab} jobs
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 20,
            }}
          >
            {tab === "active"
              ? "Book a service to get started."
              : "Completed jobs appear here."}
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
          const st = STATUS[job.status] || STATUS.pending;
          const isNegotiating = job.status === "negotiating";
          const isActive = ["accepted", "ongoing", "verified"].includes(
            job.status,
          );
          const isOngoing = job.status === "ongoing";
          const canVerify = job.status === "ongoing" && !job.arrivalVerified;
          const canFeedback =
            job.status === "completed" && !job.feedback?.rating;
          const canChat = isActive || isNegotiating;
          const workerName = job.workerId?.name || "Worker";

          return (
            <div key={job._id} style={card}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 14,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                      wordBreak: "break-word",
                    }}
                  >
                    {job.description?.slice(0, 80)}
                    {job.description?.length > 80 ? "…" : ""}
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginBottom: 0,
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
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.28)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 3,
                      }}
                    >
                      Price
                    </div>
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
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.28)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 3,
                      }}
                    >
                      Location
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#fff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {job.location}
                    </div>
                  </div>
                )}
              </div>

              {/* Pending note */}
              {job.status === "pending" && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "rgba(251,191,36,0.07)",
                    borderRadius: 10,
                    border: "1px solid rgba(251,191,36,0.15)",
                  }}
                >
                  <div style={{ fontSize: 12.5, color: "#fbbf24" }}>
                    ⏳ Waiting for {workerName} to respond. You'll be notified
                    instantly.
                  </div>
                </div>
              )}

              {/* Negotiating note */}
              {isNegotiating && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    background: "rgba(167,139,250,0.08)",
                    borderRadius: 10,
                    border: "1px solid rgba(167,139,250,0.2)",
                  }}
                >
                  <div style={{ fontSize: 12.5, color: "#a78bfa" }}>
                    💬 {workerName} wants to negotiate. Open chat to discuss the
                    price.
                  </div>
                </div>
              )}

              {(isActive ||
                job.status === "completed" ||
                job.status === "rated") && <ETABar job={job} />}

              {/* Existing feedback display */}
              {job.feedback?.rating && (
                <div
                  style={{
                    marginTop: 12,
                    padding: "12px 14px",
                    background: "rgba(251,191,36,0.06)",
                    borderRadius: 10,
                    border: "1px solid rgba(251,191,36,0.12)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      marginBottom: 4,
                    }}
                  >
                    Your Review
                  </div>
                  <span style={{ color: "#fbbf24" }}>
                    {"★".repeat(job.feedback.rating)}
                  </span>
                  {job.feedback.comment && (
                    <p
                      style={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.45)",
                        marginTop: 4,
                        marginBottom: 0,
                      }}
                    >
                      {job.feedback.comment}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginTop: 14,
                  flexWrap: "wrap",
                }}
              >
                {canVerify && (
                  <button
                    onClick={() => setOtpJob(job)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "9px 16px",
                      background: "rgba(200,241,53,0.12)",
                      border: "1px solid rgba(200,241,53,0.25)",
                      borderRadius: 10,
                      color: "#c8f135",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    🔑 Enter OTP to Verify Arrival
                  </button>
                )}
                {canChat && (
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
                    {isNegotiating ? "Open Negotiation Chat" : "Chat"}
                  </button>
                )}
                {isActive && job.workerId?.contact && (
                  <a
                    href={`tel:${job.workerId.contact}`}
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
                    📞 Call
                  </a>
                )}
                {canFeedback && (
                  <button
                    onClick={() => setFeedbackJob(job)}
                    style={{
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
                    ★ Leave Review
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/client/worker/${job.workerId?._id}`)
                  }
                  style={{
                    padding: "9px 14px",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: 10,
                    color: "rgba(255,255,255,0.5)",
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
