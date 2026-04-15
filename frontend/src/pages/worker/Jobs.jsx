// src/pages/worker/Jobs.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import api from "../../services/api.services.js";
import { getSocket } from "../../services/socket.services.js";

const STATUS = {
  pending: {
    bg: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    label: "New Request",
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
    label: "En Route 🚗",
  },
  verified: {
    bg: "rgba(96,165,250,0.12)",
    color: "#60a5fa",
    label: "Work Started 🔨",
  },
  work_done: {
    bg: "rgba(251,191,36,0.12)",
    color: "#fbbf24",
    label: "Awaiting Payment",
  },
  completed: {
    bg: "rgba(74,222,128,0.12)",
    color: "#4ade80",
    label: "Completed ✅",
  },
  rated: { bg: "rgba(251,191,36,0.12)", color: "#fbbf24", label: "Reviewed ★" },
  payment_dispute: {
    bg: "rgba(248,113,113,0.12)",
    color: "#f87171",
    label: "⚠ Payment Dispute",
  },
};
const PAYMENT_LABELS = {
  cash: "💵 Cash",
  upi: "📱 UPI",
  bank_transfer: "🏦 Bank Transfer",
};

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
      <div style={{ display: "flex", gap: 10 }}>
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
        <div style={{ flex: 1 }}>
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
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

function ArrivalOtpModal({ job, onClose, onVerified }) {
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
      await api.post(`/jobs/${job._id}/verify-arrival`, { otp });
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
          border: "1px solid rgba(200,241,53,0.3)",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>📱</div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          Enter Client's Arrival Code
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 24,
            lineHeight: 1.6,
          }}
        >
          Ask <strong style={{ color: "#c8f135" }}>{job.clientId?.name}</strong>{" "}
          to show their screen.
          <br />
          Enter the 4-digit code to verify your arrival and start work.
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
            {loading ? "Verifying…" : "Verify & Start Work"}
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkDoneModal({ job, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [completionOtp, setCompletionOtp] = useState("");

  const handle = async (paymentReceived) => {
    setLoading(true);
    try {
      const res = await api.put(`/jobs/${job._id}/work-done`, {
        paymentReceived,
      });
      if (paymentReceived && res.data.otp) {
        setCompletionOtp(res.data.otp);
      } else {
        onRefresh();
        onClose();
      }
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (completionOtp)
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
            maxWidth: 380,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            Completion Code
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 20,
              lineHeight: 1.6,
            }}
          >
            The client has received this on their screen. Share it verbally if
            needed.
          </div>
          <div
            style={{
              background: "rgba(74,222,128,0.08)",
              border: "2px solid rgba(74,222,128,0.3)",
              borderRadius: 14,
              padding: "20px",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontSize: 52,
                fontWeight: 900,
                letterSpacing: 14,
                color: "#4ade80",
              }}
            >
              {completionOtp}
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 16,
            }}
          >
            Expires in 15 minutes.
          </div>
          <button
            onClick={() => {
              onRefresh();
              onClose();
            }}
            style={{
              width: "100%",
              padding: "12px",
              background: "#c8f135",
              border: "none",
              borderRadius: 10,
              color: "#0d0d0d",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            Done
          </button>
        </div>
      </div>
    );

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
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 12 }}>💰</div>
        <div
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 6,
          }}
        >
          Work Complete!
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 8,
            lineHeight: 1.6,
          }}
        >
          Has <strong style={{ color: "#c8f135" }}>{job.clientId?.name}</strong>{" "}
          paid you?
        </div>
        <div
          style={{
            fontSize: 12.5,
            color: "rgba(255,255,255,0.3)",
            marginBottom: 24,
          }}
        >
          Payment:{" "}
          <strong style={{ color: "#fff" }}>
            {PAYMENT_LABELS[job.paymentMethod] || "Cash"}
          </strong>
          {job.price && (
            <>
              <br />
              Amount: <strong style={{ color: "#c8f135" }}>₹{job.price}</strong>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => handle(false)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              background: "rgba(248,113,113,0.12)",
              border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10,
              color: "#f87171",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
              lineHeight: 1.4,
            }}
          >
            ❌ Not Paid
            <br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              Wait 10 min then escalate
            </span>
          </button>
          <button
            onClick={() => handle(true)}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              background: "rgba(74,222,128,0.12)",
              border: "1px solid rgba(74,222,128,0.25)",
              borderRadius: 10,
              color: "#4ade80",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
              lineHeight: 1.4,
            }}
          >
            ✅ Yes, Paid!
            <br />
            <span style={{ fontSize: 11, opacity: 0.7 }}>
              Generate completion code
            </span>
          </button>
        </div>
        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px",
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.3)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function NegotiateChat({ job, onClose }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const bottomRef = useRef();

  useEffect(() => {
    if (!job.negotiationExpiry) return;
    const upd = () => {
      const left = Math.max(0, new Date(job.negotiationExpiry) - Date.now());
      setTimeLeft(left);
    };
    upd();
    const t = setInterval(upd, 1000);
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

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.start();
  };

  const mins = Math.floor(timeLeft / 60000),
    secs = Math.floor((timeLeft % 60000) / 1000);
  const urgent = timeLeft < 60000 && timeLeft > 0;

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
          border: "2px solid rgba(167,139,250,0.4)",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            background: "rgba(167,139,250,0.1)",
            borderBottom: "1px solid rgba(167,139,250,0.2)",
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
                Negotiate with {job.clientId?.name}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(167,139,250,0.7)" }}>
                Speak or type — translated to English for client
              </div>
            </div>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                background: urgent
                  ? "rgba(248,113,113,0.15)"
                  : "rgba(167,139,250,0.15)",
                color: urgent ? "#f87171" : "#a78bfa",
                fontSize: 13,
                fontWeight: 700,
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
                fontWeight: 600,
              }}
            >
              ⚠ Closing soon! Accept or reject after discussion.
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
              Explain your terms to the client.
            </div>
          )}
          {messages.map((m, i) => {
            const isMe = m.senderRole === "worker";
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
                  {isMe ? "You" : (job.clientId?.name || "C")[0].toUpperCase()}
                </div>
                <div
                  style={{
                    maxWidth: "72%",
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
                  {m.text}
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
            placeholder="Type or use voice…"
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 9,
              padding: "9px 13px",
              color: "#fff",
              fontSize: 13,
              fontFamily: "'Manrope',sans-serif",
              outline: "none",
            }}
          />
          <button
            onClick={startVoice}
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              border: "none",
              background: listening
                ? "rgba(239,68,68,0.15)"
                : "rgba(255,255,255,0.07)",
              color: listening ? "#f87171" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: 15, height: 15 }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
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

export default function WorkerJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("new");
  const [chatJob, setChatJob] = useState(null);
  const [arrivalOtpJob, setArrivalOtpJob] = useState(null);
  const [workDoneJob, setWorkDoneJob] = useState(null);
  const [notif, setNotif] = useState(null);
  const [etaInputs, setEtaInputs] = useState({});

  const fetchJobs = useCallback(() => {
    setLoading(true);
    api
      .get("/jobs/worker")
      .then((r) => setJobs(r.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const socket = getSocket();
    socket.on("arrival_verified", (d) => {
      setNotif({
        title: "Client verified! Work started 🔨",
        message: d.message,
      });
      fetchJobs();
    });
    socket.on("new_review", (d) => {
      setNotif({ title: `New ${d.rating}★ Review!`, message: d.message });
    });
    socket.on("payment_dispute_worker", (d) => {
      setNotif({ title: "⚠ Payment Dispute", message: d.message });
      fetchJobs();
    });
    socket.on("job_completed_worker", (d) => {
      setNotif({ title: "Job closed ✅", message: d.message });
      fetchJobs();
    });
    return () => {
      [
        "arrival_verified",
        "new_review",
        "payment_dispute_worker",
        "job_completed_worker",
      ].forEach((e) => socket.off(e));
    };
  }, [fetchJobs]);

  const action = async (id, endpoint, body = {}) => {
    try {
      await api.put(`/jobs/${id}/${endpoint}`, body);
      fetchJobs();
    } catch (e) {
      alert("Failed: " + (e.response?.data?.message || e.message));
    }
  };

  const handleNegotiate = async (job) => {
    try {
      await api.put(`/jobs/${job._id}/negotiate`);
      const fresh = await api.get("/jobs/worker");
      const updated = (fresh.data || []).find((j) => j._id === job._id);
      if (updated) setChatJob(updated);
      fetchJobs();
    } catch (e) {
      alert("Failed: " + (e.response?.data?.message || e.message));
    }
  };

  // ✅ FIX: Use "en-route" (with hyphen) to match backend route exactly
  const handleEnRoute = async (job) => {
    const eta = etaInputs[job._id] || "";
    try {
      await api.put(`/jobs/${job._id}/en-route`, { eta: eta || undefined });
      fetchJobs();
      // After going en route, open the OTP entry modal
      // Re-fetch to get the updated job with latest data
      const fresh = await api.get("/jobs/worker");
      const updated = (fresh.data || []).find((j) => j._id === job._id);
      setArrivalOtpJob(updated || job);
    } catch (e) {
      console.error("En route error:", e.response?.data || e.message);
      alert(
        "Failed to go en route: " + (e.response?.data?.message || e.message),
      );
    }
  };

  const newJobs = jobs.filter((j) => j.status === "pending");
  const activeJobs = jobs.filter((j) =>
    ["negotiating", "accepted", "ongoing", "verified", "work_done"].includes(
      j.status,
    ),
  );
  const pastJobs = jobs.filter((j) =>
    ["completed", "rejected", "rated", "payment_dispute"].includes(j.status),
  );

  const tabs = [
    { id: "new", label: `New (${newJobs.length})` },
    { id: "active", label: `Active (${activeJobs.length})` },
    { id: "past", label: `Past (${pastJobs.length})` },
  ];
  const shown =
    tab === "new" ? newJobs : tab === "active" ? activeJobs : pastJobs;

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 18,
    padding: 22,
    marginBottom: 14,
  };

  return (
    <div style={{ maxWidth: 700, fontFamily: "'Manrope',sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {notif && <Toast notif={notif} onDismiss={() => setNotif(null)} />}
      {chatJob && (
        <NegotiateChat job={chatJob} onClose={() => setChatJob(null)} />
      )}
      {arrivalOtpJob && (
        <ArrivalOtpModal
          job={arrivalOtpJob}
          onClose={() => setArrivalOtpJob(null)}
          onVerified={fetchJobs}
        />
      )}
      {workDoneJob && (
        <WorkDoneModal
          job={workDoneJob}
          onClose={() => setWorkDoneJob(null)}
          onRefresh={fetchJobs}
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
          Jobs
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
          Accept → En Route → Client shows OTP → Enter it → Work → Mark Done →
          Payment → Close.
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
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "7px 16px",
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
        <div style={{ ...card, textAlign: "center", padding: "40px 24px" }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 4,
            }}
          >
            No {tab} jobs
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            {tab === "new"
              ? "New requests appear instantly."
              : tab === "active"
                ? "Accepted jobs appear here."
                : "Completed jobs appear here."}
          </div>
        </div>
      ) : (
        shown.map((job) => {
          const st = STATUS[job.status] || STATUS.pending;
          const isPending = job.status === "pending";
          const isNeg = job.status === "negotiating";
          const isAccepted = job.status === "accepted";
          const isOngoing = job.status === "ongoing";
          const isVerified = job.status === "verified";
          const isWorkDone = job.status === "work_done";

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
                    Client:{" "}
                    <span
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontWeight: 600,
                      }}
                    >
                      {job.clientId?.name || "Client"}
                    </span>
                    {job.paymentMethod && (
                      <span
                        style={{
                          marginLeft: 10,
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {PAYMENT_LABELS[job.paymentMethod]}
                      </span>
                    )}
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
                  }}
                >
                  {st.label}
                </span>
              </div>

              {/* Price + Location — truncated */}
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
                      Budget
                    </div>
                    <div
                      style={{
                        fontSize: 15,
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

              {/* Context messages */}
              {isOngoing && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: "10px 14px",
                    background: "rgba(200,241,53,0.07)",
                    borderRadius: 10,
                    border: "1px solid rgba(200,241,53,0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#c8f135",
                      marginBottom: 2,
                    }}
                  >
                    📱 Ask the client to show their screen
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    Enter the 4-digit code shown on client's phone to verify
                    arrival and start work.
                  </div>
                </div>
              )}

              {isWorkDone && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: "12px 14px",
                    background: "rgba(251,191,36,0.08)",
                    borderRadius: 10,
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#fbbf24",
                      marginBottom: 2,
                    }}
                  >
                    💰 Awaiting payment from {job.clientId?.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                    If not paid within 10 minutes, a dispute will be
                    automatically escalated.
                  </div>
                </div>
              )}

              {/* ETA input for accepted jobs */}
              {isAccepted && (
                <div style={{ marginBottom: 12 }}>
                  <input
                    value={etaInputs[job._id] || ""}
                    onChange={(e) =>
                      setEtaInputs((p) => ({ ...p, [job._id]: e.target.value }))
                    }
                    placeholder="Your ETA (e.g. 15 mins, 10:30 AM)"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 9,
                      padding: "9px 12px",
                      color: "#fff",
                      fontSize: 13,
                      fontFamily: "'Manrope',sans-serif",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {isPending && (
                  <>
                    <button
                      onClick={() => action(job._id, "accept")}
                      style={{
                        padding: "9px 16px",
                        background: "rgba(74,222,128,0.12)",
                        border: "1px solid rgba(74,222,128,0.25)",
                        borderRadius: 10,
                        color: "#4ade80",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleNegotiate(job)}
                      style={{
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
                      💬 Negotiate
                    </button>
                    <button
                      onClick={() => action(job._id, "reject")}
                      style={{
                        padding: "9px 16px",
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: 10,
                        color: "#f87171",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {isNeg && (
                  <>
                    <button
                      onClick={() => setChatJob(job)}
                      style={{
                        padding: "9px 16px",
                        background: "rgba(167,139,250,0.15)",
                        border: "1px solid rgba(167,139,250,0.3)",
                        borderRadius: 10,
                        color: "#a78bfa",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      💬 Open Chat
                    </button>
                    <button
                      onClick={() => action(job._id, "accept")}
                      style={{
                        padding: "9px 16px",
                        background: "rgba(74,222,128,0.12)",
                        border: "1px solid rgba(74,222,128,0.25)",
                        borderRadius: 10,
                        color: "#4ade80",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => action(job._id, "reject")}
                      style={{
                        padding: "9px 16px",
                        background: "rgba(248,113,113,0.1)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: 10,
                        color: "#f87171",
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      ✕ Reject
                    </button>
                  </>
                )}

                {/* ✅ En Route uses correct "en-route" path */}
                {isAccepted && (
                  <button
                    onClick={() => handleEnRoute(job)}
                    style={{
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
                    🚗 I'm En Route
                  </button>
                )}

                {isOngoing && (
                  <button
                    onClick={() => setArrivalOtpJob(job)}
                    style={{
                      padding: "9px 20px",
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
                    🔑 Enter Client's Code
                  </button>
                )}

                {isVerified && (
                  <button
                    onClick={() => setWorkDoneJob(job)}
                    style={{
                      padding: "9px 16px",
                      background: "rgba(74,222,128,0.12)",
                      border: "1px solid rgba(74,222,128,0.25)",
                      borderRadius: 10,
                      color: "#4ade80",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    ✓ Mark Work Done
                  </button>
                )}

                {(isAccepted || isOngoing || isVerified) &&
                  job.clientId?.contact && (
                    <a
                      href={`tel:${job.clientId.contact}`}
                      style={{
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
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
