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
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── OTP Display Modal (worker shows OTP to client) ────────────
function OtpDisplayModal({ otp, job, onClose }) {
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
          border: "1px solid rgba(200,241,53,0.3)",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 360,
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
          Show this to the client
        </div>
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            marginBottom: 24,
          }}
        >
          Ask the client to enter this code to verify you've arrived.
        </div>
        <div
          style={{
            background: "rgba(200,241,53,0.08)",
            border: "1px solid rgba(200,241,53,0.3)",
            borderRadius: 14,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: 12,
              color: "#c8f135",
            }}
          >
            {otp}
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 16,
          }}
        >
          This code expires in 15 minutes. The client has also been notified.
        </div>
        <button
          onClick={onClose}
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
}

// ── Negotiation Chat (worker side, with voice + any language) ──
function NegotiateChat({ job, onClose, onRefresh }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const bottomRef = useRef();

  // Countdown timer
  useEffect(() => {
    if (!job.negotiationExpiry) return;
    const update = () => {
      const left = Math.max(0, new Date(job.negotiationExpiry) - Date.now());
      setTimeLeft(left);
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

  // Send — backend translates for client
  const send = async (content) => {
    if (!content?.trim()) return;
    setSending(true);
    try {
      // targetLang = client's preferred language (stored in job or default en)
      const r = await api.post(`/messages/${job._id}`, {
        text: content,
        targetLang: "en", // translated to English for client
      });
      setMessages((p) => [...p, r.data]);
      setText("");
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setSending(false);
    }
  };

  // Voice — any language, translated to English for client
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported. Try Chrome.");
      return;
    }
    const rec = new SR();
    rec.lang = "en-US"; // browser handles multilingual
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => send(e.results[0][0].transcript);
    rec.start();
  };

  const mins = Math.floor(timeLeft / 60000);
  const secs = Math.floor((timeLeft % 60000) / 1000);
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
                Negotiate with {job.clientId?.name || "Client"}
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.3)" }}>
                Speak or type — translated to English for client
              </div>
            </div>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                background: urgent
                  ? "rgba(248,113,113,0.15)"
                  : "rgba(200,241,53,0.1)",
                color: urgent ? "#f87171" : "#c8f135",
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
            <div style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>
              ⚠ Chat closing soon! Accept or reject after negotiation.
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
                    {m.text}
                  </div>
                  {m.translatedText && m.text !== m.translatedText && (
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "rgba(255,255,255,0.22)",
                        marginTop: 2,
                      }}
                    >
                      Sent as: {m.translatedText}
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
            placeholder="Type or use voice…"
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
  const [otpJob, setOtpJob] = useState(null); // shows OTP to worker
  const [otpCode, setOtpCode] = useState("");
  const [notif, setNotif] = useState(null);
  const [etaInput, setEtaInput] = useState("");
  const [etaJobId, setEtaJobId] = useState(null);

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

  // Socket notifications
  useEffect(() => {
    const socket = getSocket();
    socket.on("arrival_verified", (data) => {
      setNotif({
        title: "Client verified! Start working 🔨",
        message: data.message,
      });
      fetchJobs();
    });
    socket.on("new_review", (data) => {
      setNotif({ title: `New ${data.rating}★ Review!`, message: data.message });
    });
    return () => {
      socket.off("arrival_verified");
      socket.off("new_review");
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
      await fetchJobs();
      // Reopen with fresh job data
      const fresh = await api.get("/jobs/worker");
      const updated = (fresh.data || []).find((j) => j._id === job._id);
      if (updated) setChatJob(updated);
    } catch (e) {
      alert("Failed: " + (e.response?.data?.message || e.message));
    }
  };

  const handleGenerateOtp = async (job) => {
    const eta = etaJobId === job._id ? etaInput : "";
    try {
      const r = await api.put(`/jobs/${job._id}/arrival-otp`, {
        eta: eta || undefined,
      });
      setOtpCode(r.data.otp);
      setOtpJob(job);
      fetchJobs();
    } catch (e) {
      alert("Failed: " + (e.response?.data?.message || e.message));
    }
  };

  const newJobs = jobs.filter((j) => j.status === "pending");
  const activeJobs = jobs.filter((j) =>
    ["negotiating", "accepted", "ongoing", "verified"].includes(j.status),
  );
  const pastJobs = jobs.filter((j) =>
    ["completed", "rejected", "rated"].includes(j.status),
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
        <OtpDisplayModal
          otp={otpCode}
          job={otpJob}
          onClose={() => setOtpJob(null)}
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
          Manage requests. Negotiate → Accept → Generate OTP → Client verifies →
          Work → Complete.
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
              ? "New requests appear here instantly."
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

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
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

              {/* ETA input for accepted jobs */}
              {isAccepted && (
                <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
                  <input
                    value={etaJobId === job._id ? etaInput : ""}
                    onChange={(e) => {
                      setEtaJobId(job._id);
                      setEtaInput(e.target.value);
                    }}
                    placeholder="ETA (e.g. 15 mins)"
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 9,
                      padding: "9px 12px",
                      color: "#fff",
                      fontSize: 13,
                      fontFamily: "'Manrope',sans-serif",
                      outline: "none",
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
                    {/* Negotiate — opens chat immediately */}
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

                {isAccepted && (
                  <button
                    onClick={() => handleGenerateOtp(job)}
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
                    🚗 I'm En Route — Generate OTP
                  </button>
                )}

                {isVerified && (
                  <button
                    onClick={() => action(job._id, "complete")}
                    style={{
                      padding: "9px 16px",
                      background: "rgba(96,165,250,0.12)",
                      border: "1px solid rgba(96,165,250,0.25)",
                      borderRadius: 10,
                      color: "#60a5fa",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    ✓ Mark Job Complete
                  </button>
                )}

                {job.clientId?.contact &&
                  (isAccepted || isOngoing || isVerified) && (
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
