import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import socket from "../../services/socket.services.js";
import { LanguageContext } from "../../context/LanguageContext.jsx";

export default function JobTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const bottomRef = useRef(null);

  const [job, setJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  useEffect(() => {
    loadData();
    socket.emit("joinJob", id);

    socket.on("receiveMessage", (m) => {
      setMessages((prev) => [...prev, m]);
      setTimeout(
        () => bottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    });

    socket.on("jobStatusChanged", ({ status, price }) => {
      setJob((prev) =>
        prev ? { ...prev, status, price: price || prev.price } : prev,
      );
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("jobStatusChanged");
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const jobRes = await api.get("/jobs/client");
      const msgRes = await api.get("/messages/" + id);

      setMe(meRes.data);
      setJob(jobRes.data.find((j) => j._id === id) || null);
      setMessages(msgRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMsg = () => {
    if (!msg.trim() || !me || !id) return;
    socket.emit("sendMessage", {
      jobId: id,
      senderId: me._id,
      text: msg.trim(),
      lang: lang,
    });
    setMsg("");
  };

  const acceptCounterOffer = async () => {
    try {
      await api.put("/jobs/" + id + "/accept", { price: job.price });
      setJob((prev) => ({ ...prev, status: "accepted" }));
      socket.emit("jobStatusUpdate", {
        jobId: id,
        status: "accepted",
        price: job.price,
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const cancelJob = async () => {
    if (!window.confirm("Cancel this job request?")) return;
    try {
      await api.put("/jobs/" + id + "/reject");
      navigate("/client/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const STATUS = {
    pending: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", label: "Pending" },
    accepted: {
      bg: "rgba(200,241,53,0.1)",
      color: "#c8f135",
      label: "Accepted",
    },
    rejected: {
      bg: "rgba(248,113,113,0.1)",
      color: "#f87171",
      label: "Rejected",
    },
    completed: {
      bg: "rgba(52,211,153,0.1)",
      color: "#34d399",
      label: "Completed",
    },
  };

  const root = {
    fontFamily: "'Manrope','Segoe UI',sans-serif",
    minHeight: "100vh",
    background: "#0d0d0d",
    padding: "28px",
    boxSizing: "border-box",
  };

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  };

  const backBtn = {
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
  };

  const inp = {
    flex: 1,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontSize: 14,
    fontFamily: "'Manrope',sans-serif",
    outline: "none",
  };

  if (loading)
    return (
      <div
        style={{
          ...root,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          Loading…
        </div>
      </div>
    );

  if (!job)
    return (
      <div
        style={{
          ...root,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
          Job not found.
        </div>
      </div>
    );

  const st = STATUS[job.status] || STATUS.pending;
  const workerName = job.workerId?.name || "Worker";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .jt-back:hover { color: #c8f135 !important; }
        .jt-send:hover { opacity: 0.85; }
        .jt-chat::-webkit-scrollbar { width: 4px; }
        .jt-chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      <div style={root}>
        <button
          style={backBtn}
          className="jt-back"
          onClick={() => navigate("/client/dashboard")}
        >
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
          Dashboard
        </button>

        <div style={{ maxWidth: 640 }}>
          {/* Status card */}
          <div style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 16,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 4,
                  }}
                >
                  {job.description?.split("\n")[0]}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  with {workerName}
                </div>
              </div>
              <span
                style={{
                  padding: "5px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                  background: st.bg,
                  color: st.color,
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
              }}
            >
              {[
                ["Price", job.price ? "₹" + job.price : "Not set"],
                ["Location", job.location?.address || "—"],
              ].map(function (item) {
                return (
                  <div
                    key={item[0]}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      borderRadius: 10,
                      padding: "10px 12px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 4,
                      }}
                    >
                      {item[0]}
                    </div>
                    <div
                      style={{ fontSize: 14, color: "#fff", fontWeight: 500 }}
                    >
                      {item[1]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Counter offer banner */}
            {job.status === "pending" && job.price && (
              <div
                style={{
                  marginTop: 14,
                  background: "rgba(167,139,250,0.08)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#a78bfa",
                    fontWeight: 600,
                    marginBottom: 10,
                  }}
                >
                  Worker sent a counter offer: ₹{job.price}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={acceptCounterOffer}
                    style={{
                      flex: 1,
                      padding: "9px",
                      background: "#c8f135",
                      border: "none",
                      borderRadius: 8,
                      color: "#0d0d0d",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    Accept ₹{job.price}
                  </button>
                  <button
                    onClick={cancelJob}
                    style={{
                      flex: 1,
                      padding: "9px",
                      background: "rgba(248,113,113,0.1)",
                      border: "1px solid rgba(248,113,113,0.2)",
                      borderRadius: 8,
                      color: "#f87171",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'Manrope',sans-serif",
                    }}
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}

            {job.status === "pending" && !job.price && (
              <button
                onClick={cancelJob}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "10px",
                  background: "rgba(248,113,113,0.08)",
                  border: "1px solid rgba(248,113,113,0.15)",
                  borderRadius: 10,
                  color: "#f87171",
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                }}
              >
                Cancel Request
              </button>
            )}
          </div>

          {/* Chat */}
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "14px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
              }}
            >
              Chat with {workerName}
            </div>

            <div
              className="jt-chat"
              style={{
                height: 320,
                overflowY: "auto",
                padding: "16px 18px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {messages.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 13,
                    marginTop: 40,
                  }}
                >
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map(function (m, i) {
                var isMe =
                  m.senderId === me?._id || m.senderId?._id === me?._id;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "72%",
                        padding: "10px 14px",
                        borderRadius: isMe
                          ? "16px 16px 4px 16px"
                          : "16px 16px 16px 4px",
                        background: isMe ? "#c8f135" : "rgba(255,255,255,0.07)",
                        color: isMe ? "#0d0d0d" : "#fff",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      {m.translatedText || m.text}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div
              style={{
                padding: "12px 16px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                gap: 8,
              }}
            >
              <input
                value={msg}
                onChange={function (e) {
                  setMsg(e.target.value);
                }}
                onKeyDown={function (e) {
                  if (e.key === "Enter") sendMsg();
                }}
                placeholder="Type a message…"
                style={inp}
              />
              <button
                className="jt-send"
                onClick={sendMsg}
                style={{
                  width: 42,
                  height: 42,
                  background: "#c8f135",
                  border: "none",
                  borderRadius: 10,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0d0d0d"
                  strokeWidth="2.5"
                  style={{ width: 16, height: 16 }}
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
