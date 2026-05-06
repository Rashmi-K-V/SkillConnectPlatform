// src/pages/client/MyJobs.jsx
// ✅ CORRECT OTP FLOW:
// 1. Worker clicks "En Route" → backend generates arrival OTP → CLIENT sees it on screen
// 2. Worker arrives, asks client for code → client shows screen → worker enters on their device
// 3. Arrival verified → work begins
// 4. Worker completes work → asks "paid?" → generates completion OTP
// 5. Completion OTP sent to CLIENT → client enters it to close job
// 6. If worker marks done but client doesn't pay within 10 min → payment dispute escalation

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { getSocket } from "../../services/socket.services.js";

const SECTIONS = [
  { id: "new", label: "New", statuses: ["pending"], color: "#fbbf24" },
  {
    id: "negotiating",
    label: "Negotiating",
    statuses: ["negotiating"],
    color: "#a78bfa",
  },
  {
    id: "active",
    label: "Active",
    statuses: ["accepted", "ongoing", "verified", "work_done"],
    color: "#4ade80",
  },
  {
    id: "past",
    label: "Past",
    statuses: ["completed", "rejected", "rated", "payment_dispute"],
    color: "#60a5fa",
  },
];

const STATUS_LABEL = {
  pending: "Awaiting Response",
  negotiating: "Negotiating 💬",
  accepted: "Accepted ✓",
  rejected: "Rejected",
  ongoing: "Worker En Route 🚗",
  verified: "Work In Progress 🔨",
  work_done: "Work Done — Awaiting Payment",
  completed: "Completed ✅",
  rated: "Reviewed ★",
  payment_dispute: "⚠ Payment Dispute",
};
const STATUS_COLOR = {
  pending: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  negotiating: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa" },
  accepted: { bg: "rgba(74,222,128,0.12)", color: "#4ade80" },
  rejected: { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
  ongoing: { bg: "rgba(167,139,250,0.12)", color: "#a78bfa" },
  verified: { bg: "rgba(96,165,250,0.12)", color: "#60a5fa" },
  work_done: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  completed: { bg: "rgba(74,222,128,0.12)", color: "#4ade80" },
  rated: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24" },
  payment_dispute: { bg: "rgba(248,113,113,0.12)", color: "#f87171" },
};

// ── Toast ──────────────────────────────────────────────────────
function Toast({ notif, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 7000);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999,
        background: "#1a1a1a",
        border: "1px solid rgba(200,241,53,0.35)",
        borderRadius: 14,
        padding: "14px 18px",
        maxWidth: 380,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}`}</style>
      <div
        style={{ display: "flex", gap: 10, animation: "slideIn 0.25s ease" }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#c8f135",
            flexShrink: 0,
            marginTop: 5,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 3,
            }}
          >
            {notif.title}
          </div>
          <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)" }}>
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
            fontSize: 18,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Completion OTP Modal (client enters code from worker) ─────
function CompletionOtpModal({ job, onClose, onVerified }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    if (otp.length !== 4) {
      setError("Enter the 4-digit code.");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/jobs/${job._id}/complete`, { otp });
      onVerified();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || "Incorrect code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 360,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          Confirm Job Completion
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          The worker has shared a 4-digit code. Enter it to confirm the job is
          done and payment is complete.
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
            fontSize: 32,
            letterSpacing: 16,
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
            onClick={handle}
            disabled={loading || otp.length !== 4}
            style={{
              flex: 2,
              padding: "11px",
              background: otp.length === 4 ? "#4ade80" : "rgba(74,222,128,0.3)",
              border: "none",
              borderRadius: 10,
              color: "#0d0d0d",
              fontSize: 13,
              fontWeight: 700,
              cursor: otp.length === 4 ? "pointer" : "not-allowed",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            {loading ? "Verifying…" : "Confirm & Close Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Modal ─────────────────────────────────────────────
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
              fontSize: 28,
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

  const handle = async () => {
    if (!form.rating) {
      setError("Overall rating required.");
      return;
    }
    if (form.wouldRecommend === null) {
      setError("Please select whether you'd recommend.");
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
        background: "rgba(0,0,0,0.85)",
        zIndex: 300,
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
          Your feedback appears on their profile and helps other clients.
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
                  fontSize: 13,
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
            onClick={handle}
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

// ── Progress Bar ───────────────────────────────────────────────
function ETABar({ job }) {
  const steps = ["Booked", "Accepted", "En Route", "Working", "Done"];
  const idx =
    {
      pending: 0,
      negotiating: 0,
      accepted: 1,
      ongoing: 2,
      verified: 3,
      work_done: 4,
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
          marginBottom: 8,
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
          marginBottom: 10,
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

// ── Negotiation Chat (client side) ─────────────────────────────
function NegotiateChat({ job, onClose, onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const bottomRef = useRef();

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
  }, [job.negotiationExpiry]);

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
        targetLang: "en",
      });
      setMessages((p) => [...p, r.data]);
      setText("");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  const mins = Math.floor(timeLeft / 60000),
    secs = Math.floor((timeLeft % 60000) / 1000);
  const urgent = timeLeft < 60000 && timeLeft > 0;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        zIndex: 300,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          height: "72vh",
          background: "#141414",
          border: "2px solid rgba(167,139,250,0.4)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(167,139,250,0.15)",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            background: "rgba(167,139,250,0.12)",
            borderBottom: "2px solid rgba(167,139,250,0.3)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                💬 Negotiation Chat
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(167,139,250,0.8)",
                  fontWeight: 600,
                }}
              >
                with {job.workerId?.name} — discuss price & terms
              </div>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                background: urgent
                  ? "rgba(248,113,113,0.2)"
                  : "rgba(167,139,250,0.2)",
                border: `1.5px solid ${urgent ? "#f87171" : "#a78bfa"}`,
                color: urgent ? "#f87171" : "#a78bfa",
                fontSize: 14,
                fontWeight: 800,
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
                fontSize: 12.5,
                color: "#f87171",
                fontWeight: 600,
                textAlign: "center",
                padding: "6px",
                background: "rgba(248,113,113,0.1)",
                borderRadius: 8,
              }}
            >
              ⚠ Less than 1 minute! Please decide to accept or reject.
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
              Worker will message here. Reply to discuss terms.
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
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                      background: isMe ? "#c8f135" : "rgba(255,255,255,0.09)",
                      fontSize: 13.5,
                      color: isMe ? "#0d0d0d" : "#fff",
                      lineHeight: 1.5,
                    }}
                  >
                    {m.translatedText || m.text}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div
          style={{
            padding: "12px 16px",
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            gap: 7,
            flexShrink: 0,
          }}
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send(text)}
            placeholder="Reply to worker…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 9,
              padding: "10px 14px",
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
              width: 40,
              height: 40,
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

const PAYMENT_LABELS = {
  cash: "💵 Cash",
  upi: "📱 UPI",
  bank_transfer: "🏦 Bank Transfer",
};

// ── Main ───────────────────────────────────────────────────────
export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("new");
  const [chatJob, setChatJob] = useState(null);
  const [completionJob, setCompletionJob] = useState(null); // client enters completion OTP
  const [feedbackJob, setFeedbackJob] = useState(null);
  const [notif, setNotif] = useState(null);
  // ✅ Store arrival OTPs per job so they stay visible on screen
  const [arrivalOtps, setArrivalOtps] = useState({});
  // ✅ Store completion OTPs per job
  const [completionOtps, setCompletionOtps] = useState({});
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

  useEffect(() => {
    const socket = getSocket();
    socket.on("job_accepted", (d) => {
      setNotif({ title: "Job Accepted! 🎉", message: d.message });
      fetchJobs();
    });
    socket.on("job_rejected", (d) => {
      setNotif({ title: "Job Declined", message: d.message });
      fetchJobs();
    });
    socket.on("negotiation_started", (d) => {
      setNotif({ title: "⚡ Worker wants to negotiate!", message: d.message });
      fetchJobs();
      setTab("negotiating");
    });
    // ✅ Arrival OTP comes to CLIENT — store it so it stays visible
    socket.on("arrival_otp", (d) => {
      setNotif({
        title: `${d.workerName} is on the way! 🚗`,
        message:
          "Your arrival code is ready. Show it to the worker when they arrive.",
      });
      setArrivalOtps((prev) => ({ ...prev, [d.jobId]: d.otp }));
      fetchJobs();
      setTab("active");
    });
    socket.on("arrival_verified", (d) => {
      setNotif({ title: "Worker arrived & verified ✅", message: d.message });
      fetchJobs();
    });
    socket.on("payment_requested", (d) => {
      setNotif({ title: "💰 Payment Requested", message: d.message });
      fetchJobs();
    });
    // ✅ Completion OTP comes to CLIENT — they enter it
    socket.on("completion_otp", (d) => {
      setNotif({
        title: "Work Complete! Enter completion code",
        message: d.message,
      });
      setCompletionOtps((prev) => ({ ...prev, [d.jobId]: d.otp }));
      fetchJobs();
    });
    socket.on("payment_dispute", (d) => {
      setNotif({ title: "⚠ Payment Dispute", message: d.message });
      fetchJobs();
    });
    socket.on("job_completed", (d) => {
      setNotif({ title: "Job Closed ✅", message: d.message });
      fetchJobs();
    });

    return () => {
      [
        "job_accepted",
        "job_rejected",
        "negotiation_started",
        "arrival_otp",
        "arrival_verified",
        "payment_requested",
        "completion_otp",
        "payment_dispute",
        "job_completed",
      ].forEach((e) => socket.off(e));
    };
  }, [fetchJobs]);

  const handleFeedback = async (jobId, form) => {
    await api.post(`/jobs/${jobId}/feedback`, form);
    fetchJobs();
  };
  const getSectionJobs = (section) =>
    jobs.filter((j) => section.statuses.includes(j.status));

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 22,
    marginBottom: 14,
  };

  return (
    <div style={{ maxWidth: 720, fontFamily: "'Manrope',sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.6}}
      `}</style>

      {notif && <Toast notif={notif} onDismiss={() => setNotif(null)} />}
      {chatJob && (
        <NegotiateChat
          job={chatJob}
          onClose={() => setChatJob(null)}
          onRefresh={fetchJobs}
        />
      )}
      {completionJob && (
        <CompletionOtpModal
          job={completionJob}
          onClose={() => setCompletionJob(null)}
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
          Track bookings from request to completion.
        </p>
      </div>

      {/* 4 tabs */}
      <div
        style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}
      >
        {SECTIONS.map((section) => {
          const count = getSectionJobs(section).length;
          const isActive = tab === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setTab(section.id)}
              style={{
                padding: "8px 18px",
                borderRadius: 20,
                border: `1.5px solid ${isActive ? section.color : "rgba(255,255,255,0.1)"}`,
                background: isActive
                  ? `${section.color}18`
                  : "rgba(255,255,255,0.03)",
                color: isActive ? section.color : "rgba(255,255,255,0.4)",
                fontFamily: "'Manrope',sans-serif",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {section.label}
              {count > 0 && (
                <span
                  style={{
                    background: isActive
                      ? section.color
                      : "rgba(255,255,255,0.1)",
                    color: isActive ? "#0d0d0d" : "rgba(255,255,255,0.5)",
                    borderRadius: 20,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
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
      ) : (
        (() => {
          const currentSection = SECTIONS.find((s) => s.id === tab);
          const shown = getSectionJobs(currentSection);
          if (shown.length === 0)
            return (
              <div
                style={{ ...card, textAlign: "center", padding: "44px 24px" }}
              >
                <div style={{ fontSize: 30, marginBottom: 12 }}>
                  {tab === "new"
                    ? "📋"
                    : tab === "negotiating"
                      ? "💬"
                      : tab === "active"
                        ? "🔨"
                        : "📁"}
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
                  No {currentSection.label.toLowerCase()} jobs
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.3)",
                    marginBottom: tab === "new" ? 20 : 0,
                  }}
                >
                  {tab === "new"
                    ? "Send a job request to a worker to get started."
                    : tab === "negotiating"
                      ? "When a worker wants to negotiate, it appears here."
                      : tab === "active"
                        ? "Accepted and ongoing work appears here."
                        : "Completed and rejected jobs appear here."}
                </div>
                {tab === "new" && (
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
            );

          return shown.map((job) => {
            const st = STATUS_COLOR[job.status] || STATUS_COLOR.pending;
            const workerName = job.workerId?.name || "Worker";
            const isNeg = job.status === "negotiating";
            const isActive = ["accepted", "ongoing", "verified"].includes(
              job.status,
            );
            const isOngoing = job.status === "ongoing"; // worker en route
            const isVerified = job.status === "verified"; // work in progress
            const isWorkDone = job.status === "work_done"; // worker done, awaiting payment
            const isDispute = job.status === "payment_dispute";
            const canFeedback =
              job.status === "completed" && !job.feedback?.rating;
            // ✅ Arrival OTP: client shows it to arriving worker
            const arrivalOtp = arrivalOtps[job._id] || job.arrivalOtp;
            // ✅ Completion OTP: client enters it when worker shows it
            const completionOtp = completionOtps[job._id];

            return (
              <div
                key={job._id}
                style={{
                  ...card,
                  border: isNeg
                    ? "2px solid rgba(167,139,250,0.35)"
                    : isDispute
                      ? "2px solid rgba(248,113,113,0.4)"
                      : card.border,
                }}
              >
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
                      style={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.35)",
                      }}
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
                      {job.paymentMethod && (
                        <span
                          style={{
                            marginLeft: 12,
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {PAYMENT_LABELS[job.paymentMethod] ||
                            job.paymentMethod}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "5px 13px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 700,
                      background: st.bg,
                      color: st.color,
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STATUS_LABEL[job.status] || job.status}
                  </span>
                </div>

                {/* Price + Location */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr",
                    gap: 10,
                    marginBottom: 14,
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
                        overflow: "hidden",
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
                      {/* ✅ Fix: Location truncated with ellipsis, full on hover via title */}
                      <div
                        style={{
                          fontSize: 12,
                          color: "#fff",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={job.location}
                      >
                        {job.location}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pending */}
                {job.status === "pending" && (
                  <div
                    style={{
                      padding: "10px 14px",
                      background: "rgba(251,191,36,0.07)",
                      borderRadius: 10,
                      border: "1px solid rgba(251,191,36,0.15)",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ fontSize: 12.5, color: "#fbbf24" }}>
                      ⏳ Waiting for {workerName} to respond. You'll be notified
                      instantly.
                    </div>
                  </div>
                )}

                {/* Negotiating callout */}
                {isNeg && (
                  <div
                    style={{
                      padding: "12px 16px",
                      background: "rgba(167,139,250,0.1)",
                      borderRadius: 10,
                      border: "2px solid rgba(167,139,250,0.3)",
                      marginBottom: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#a78bfa",
                        marginBottom: 4,
                      }}
                    >
                      💬 {workerName} wants to negotiate!
                    </div>
                    <div
                      style={{ fontSize: 12.5, color: "rgba(167,139,250,0.7)" }}
                    >
                      Open the chat below to discuss price and terms. Chat is
                      open for 5 minutes.
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                {(isActive ||
                  ["work_done", "completed", "rated"].includes(job.status)) && (
                  <ETABar job={job} />
                )}

                {/* ✅ ARRIVAL OTP: Client shows this to the arriving worker */}
                {arrivalOtp && isOngoing && !job.arrivalVerified && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "18px",
                      background: "rgba(200,241,53,0.06)",
                      borderRadius: 14,
                      border: "2px solid rgba(200,241,53,0.3)",
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.5)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: 6,
                      }}
                    >
                      📱 Show this to the Worker
                    </div>
                    <div
                      style={{
                        fontFamily: "'Syne',sans-serif",
                        fontSize: 52,
                        fontWeight: 900,
                        letterSpacing: 14,
                        color: "#c8f135",
                        padding: "8px 0",
                        animation: "blink 2s ease infinite",
                      }}
                    >
                      {arrivalOtp}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        marginTop: 8,
                        lineHeight: 1.5,
                      }}
                    >
                      When {workerName} arrives, show them your screen.
                      <br />
                      They will enter this code to verify arrival and begin
                      work.
                    </div>
                  </div>
                )}

                {/* Work in progress */}
                {isVerified && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px 14px",
                      background: "rgba(96,165,250,0.08)",
                      borderRadius: 10,
                      border: "1px solid rgba(96,165,250,0.2)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#60a5fa",
                      }}
                    >
                      🔨 {workerName} is currently working. You'll be notified
                      when done.
                    </div>
                  </div>
                )}

                {/* ✅ Work done — worker generated completion OTP, client enters it */}
                {isWorkDone && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "14px 16px",
                      background: "rgba(251,191,36,0.08)",
                      borderRadius: 12,
                      border: "2px solid rgba(251,191,36,0.3)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#fbbf24",
                        marginBottom: 6,
                      }}
                    >
                      💰 {workerName} has completed the work!
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: completionOtp ? 12 : 0,
                      }}
                    >
                      Please pay ₹{job.price} via{" "}
                      {PAYMENT_LABELS[job.paymentMethod] ||
                        "your agreed method"}
                      .
                      {!completionOtp &&
                        " The worker will share a completion code once payment is confirmed."}
                    </div>
                    {completionOtp && (
                      <div
                        style={{
                          background: "rgba(74,222,128,0.08)",
                          borderRadius: 10,
                          padding: "12px",
                          textAlign: "center",
                          border: "1px solid rgba(74,222,128,0.2)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            color: "rgba(255,255,255,0.4)",
                            marginBottom: 4,
                          }}
                        >
                          Completion Code Received
                        </div>
                        <div
                          style={{
                            fontFamily: "'Syne',sans-serif",
                            fontSize: 36,
                            fontWeight: 800,
                            letterSpacing: 10,
                            color: "#4ade80",
                          }}
                        >
                          {completionOtp}
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: "rgba(255,255,255,0.35)",
                            marginTop: 6,
                          }}
                        >
                          Enter this code below to confirm job completion
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Payment dispute */}
                {isDispute && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px 16px",
                      background: "rgba(248,113,113,0.08)",
                      borderRadius: 10,
                      border: "2px solid rgba(248,113,113,0.3)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13.5,
                        fontWeight: 700,
                        color: "#f87171",
                        marginBottom: 4,
                      }}
                    >
                      ⚠️ Payment Dispute Escalated
                    </div>
                    <div
                      style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}
                    >
                      Payment was not confirmed within 10 minutes. This dispute
                      has been flagged. Please resolve with the worker or
                      contact support.
                    </div>
                  </div>
                )}

                {/* Existing feedback */}
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

                {/* Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    marginTop: 14,
                    flexWrap: "wrap",
                  }}
                >
                  {isNeg && (
                    <button
                      onClick={() => setChatJob(job)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "10px 18px",
                        background: "rgba(167,139,250,0.2)",
                        border: "2px solid #a78bfa",
                        borderRadius: 10,
                        color: "#a78bfa",
                        fontSize: 13.5,
                        fontWeight: 800,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                        boxShadow: "0 0 12px rgba(167,139,250,0.2)",
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{ width: 15, height: 15 }}
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Open Negotiation Chat
                    </button>
                  )}

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

                  {/* ✅ Client enters completion OTP */}
                  {isWorkDone && (
                    <button
                      onClick={() => setCompletionJob(job)}
                      style={{
                        padding: "10px 18px",
                        background: "rgba(74,222,128,0.15)",
                        border: "2px solid #4ade80",
                        borderRadius: 10,
                        color: "#4ade80",
                        fontSize: 13.5,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      ✅ Enter Completion Code
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
          });
        })()
      )}
    </div>
  );
}
