// src/pages/worker/Messages.jsx
import { useState, useRef, useEffect } from "react";

const MOCK_THREADS = [
  {
    _id: "t1",
    client: "Priya S.",
    clientAvatar: "PS",
    jobTitle: "Fix ceiling fan wiring",
    lastMsg: "Can you come today at 5pm?",
    time: "2m ago",
    unread: 2,
    messages: [
      {
        from: "client",
        text: "Hi, I need the ceiling fan wiring fixed. Are you available?",
        time: "10:20 AM",
      },
      {
        from: "me",
        text: "Yes I'm available. Can you share the address?",
        time: "10:22 AM",
      },
      {
        from: "client",
        text: "Koramangala 5th Block. Budget is ₹800.",
        time: "10:25 AM",
      },
      { from: "client", text: "Can you come today at 5pm?", time: "10:26 AM" },
    ],
  },
  {
    _id: "t2",
    client: "Amit D.",
    clientAvatar: "AD",
    jobTitle: "Install 4 sockets",
    lastMsg: "Budget is non-negotiable.",
    time: "1hr ago",
    unread: 0,
    messages: [
      {
        from: "client",
        text: "Need 4 sockets installed in kitchen. Budget ₹1200.",
        time: "9:00 AM",
      },
      {
        from: "me",
        text: "I can do it for ₹1500 including wiring.",
        time: "9:10 AM",
      },
      { from: "client", text: "Budget is non-negotiable.", time: "9:12 AM" },
    ],
  },
  {
    _id: "t3",
    client: "Sunita R.",
    clientAvatar: "SR",
    jobTitle: "MCB tripping",
    lastMsg: "Ok confirmed for tomorrow 10am",
    time: "Yesterday",
    unread: 0,
    messages: [
      {
        from: "client",
        text: "My MCB trips every evening. Can you check?",
        time: "Yesterday",
      },
      {
        from: "me",
        text: "Sure, diagnosis charges ₹300. Fix extra.",
        time: "Yesterday",
      },
      {
        from: "client",
        text: "Ok confirmed for tomorrow 10am",
        time: "Yesterday",
      },
    ],
  },
];

export default function Messages() {
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [active, setActive] = useState(null);
  const [msg, setMsg] = useState("");
  const [neg, setNeg] = useState(false);
  const [offerAmt, setOfferAmt] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active]);

  const send = () => {
    if (!msg.trim() || !active) return;
    const text = msg.trim();
    setMsg("");
    setThreads((p) =>
      p.map((t) =>
        t._id === active._id
          ? {
              ...t,
              lastMsg: text,
              messages: [...t.messages, { from: "me", text, time: "now" }],
              unread: 0,
            }
          : t,
      ),
    );
    setActive((p) =>
      p
        ? { ...p, messages: [...p.messages, { from: "me", text, time: "now" }] }
        : null,
    );
  };

  const sendOffer = () => {
    if (!offerAmt) return;
    const text = `💰 Counter offer: ₹${offerAmt}`;
    setNeg(false);
    setOfferAmt("");
    setMsg(text);
    setTimeout(send, 0);
  };

  const thread = active ? threads.find((t) => t._id === active._id) : null;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 56px - 56px)",
        gap: 0,
        background: "#141414",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Thread list */}
      <div
        style={{
          width: 280,
          borderRight: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
          overflowY: "auto",
          background: "#161616",
        }}
      >
        <div
          style={{
            padding: "16px 16px 10px",
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          Messages
        </div>
        {threads.map((t) => (
          <div
            key={t._id}
            onClick={() => {
              setActive(t);
              setThreads((p) =>
                p.map((x) => (x._id === t._id ? { ...x, unread: 0 } : x)),
              );
            }}
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
              cursor: "pointer",
              background:
                active?._id === t._id ? "rgba(200,241,53,0.06)" : "transparent",
              transition: "background 0.1s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background =
                active?._id === t._id
                  ? "rgba(200,241,53,0.06)"
                  : "rgba(255,255,255,0.03)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background =
                active?._id === t._id ? "rgba(200,241,53,0.06)" : "transparent")
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#f97316,#ec4899)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                {t.clientAvatar}
                {t.unread > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: -3,
                      right: -3,
                      width: 16,
                      height: 16,
                      background: "#c8f135",
                      borderRadius: "50%",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#0d0d0d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {t.unread}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                  >
                    {t.client}
                  </span>
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}
                  >
                    {t.time}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.3)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {t.jobTitle}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 2,
                  }}
                >
                  {t.lastMsg}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat area */}
      {thread ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "linear-gradient(135deg,#f97316,#ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {thread.clientAvatar}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                {thread.client}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                {thread.jobTitle}
              </div>
            </div>
            <button
              onClick={() => setNeg(!neg)}
              style={{
                marginLeft: "auto",
                padding: "7px 14px",
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 8,
                color: "#a78bfa",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              ₹ Negotiate
            </button>
          </div>

          {/* Negotiate bar */}
          {neg && (
            <div
              style={{
                padding: "12px 20px",
                background: "rgba(167,139,250,0.06)",
                borderBottom: "1px solid rgba(167,139,250,0.15)",
                display: "flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>
                Counter offer:
              </span>
              <input
                type="number"
                value={offerAmt}
                onChange={(e) => setOfferAmt(e.target.value)}
                placeholder="₹ amount"
                style={{
                  width: 120,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(167,139,250,0.3)",
                  borderRadius: 8,
                  padding: "6px 10px",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "'Manrope',sans-serif",
                }}
              />
              <button
                onClick={sendOffer}
                disabled={!offerAmt}
                style={{
                  padding: "6px 14px",
                  background: offerAmt ? "#a78bfa" : "rgba(167,139,250,0.2)",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: offerAmt ? "pointer" : "not-allowed",
                  fontFamily: "'Manrope',sans-serif",
                }}
              >
                Send
              </button>
              <button
                onClick={() => setNeg(false)}
                style={{
                  padding: "6px 12px",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {thread.messages.map((m, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: m.from === "me" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "10px 14px",
                    borderRadius:
                      m.from === "me"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      m.from === "me" ? "#c8f135" : "rgba(255,255,255,0.07)",
                    color: m.from === "me" ? "#0d0d0d" : "#fff",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {m.text}
                  <div
                    style={{
                      fontSize: 10,
                      marginTop: 4,
                      opacity: 0.5,
                      textAlign: "right",
                    }}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Type a message…"
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "10px 14px",
                color: "#fff",
                fontSize: 14,
                fontFamily: "'Manrope',sans-serif",
                outline: "none",
              }}
            />
            <button
              onClick={send}
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
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.2)",
            fontSize: 14,
            flexDirection: "column",
            gap: 12,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            style={{ width: 40, height: 40, opacity: 0.3 }}
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Select a conversation
        </div>
      )}
    </div>
  );
}
