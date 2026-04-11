import { useEffect, useState, useRef } from "react";
import api from "../../services/api.services.js";
import socket from "../../services/socket.services.js";

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [negotiating, setNeg] = useState(false);
  const [myPrice, setMyPrice] = useState("");
  const [note, setNote] = useState("");
  const [acting, setActing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [me, setMe] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    loadJobs();
    api
      .get("/auth/me")
      .then(function (r) {
        setMe(r.data);
      })
      .catch(function () {});
  }, []);

  useEffect(() => {
    if (!selected) return;

    loadMessages(selected._id);
    socket.emit("joinJob", selected._id);

    socket.on("receiveMessage", function (m) {
      setMessages(function (prev) {
        return [...prev, m];
      });
      setTimeout(function () {
        if (bottomRef.current)
          bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    });

    socket.on("jobStatusChanged", function (data) {
      var status = data.status;
      var price = data.price;
      setJobs(function (prev) {
        return prev.map(function (j) {
          return j._id === selected._id
            ? { ...j, status: status, price: price || j.price }
            : j;
        });
      });
      setSelected(function (prev) {
        return prev
          ? { ...prev, status: status, price: price || prev.price }
          : prev;
      });
    });

    return function () {
      socket.off("receiveMessage");
      socket.off("jobStatusChanged");
    };
  }, [selected && selected._id]);

  useEffect(
    function () {
      if (bottomRef.current)
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    },
    [messages],
  );

  const loadJobs = async function () {
    try {
      var res = await api.get("/jobs/worker");
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async function (jobId) {
    try {
      var res = await api.get("/messages/" + jobId);
      setMessages(res.data || []);
    } catch (err) {
      setMessages([]);
    }
  };

  const sendMsg = function () {
    if (!msg.trim() || !me || !selected) return;
    socket.emit("sendMessage", {
      jobId: selected._id,
      senderId: me._id,
      text: msg.trim(),
    });
    setMsg("");
  };

  const accept = async function (job) {
    setActing(true);
    try {
      await api.put("/jobs/" + job._id + "/accept", { price: job.price });
      socket.emit("jobStatusUpdate", {
        jobId: job._id,
        status: "accepted",
        price: job.price,
      });
      setJobs(function (prev) {
        return prev.map(function (j) {
          return j._id === job._id ? { ...j, status: "accepted" } : j;
        });
      });
      setSelected(function (prev) {
        return prev ? { ...prev, status: "accepted" } : prev;
      });
      setNeg(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  };

  const reject = async function (job) {
    setActing(true);
    try {
      await api.put("/jobs/" + job._id + "/reject");
      socket.emit("jobStatusUpdate", { jobId: job._id, status: "rejected" });
      setJobs(function (prev) {
        return prev.map(function (j) {
          return j._id === job._id ? { ...j, status: "rejected" } : j;
        });
      });
      setSelected(null);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  };

  const negotiate = async function (job) {
    if (!myPrice) return;
    setActing(true);
    try {
      await api.put("/jobs/" + job._id + "/negotiate", {
        price: Number(myPrice),
        note: note,
      });
      socket.emit("jobStatusUpdate", {
        jobId: job._id,
        status: "pending",
        price: Number(myPrice),
      });
      setJobs(function (prev) {
        return prev.map(function (j) {
          return j._id === job._id ? { ...j, price: Number(myPrice) } : j;
        });
      });
      setSelected(function (prev) {
        return prev ? { ...prev, price: Number(myPrice) } : prev;
      });
      setNeg(false);
      setMyPrice("");
      setNote("");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  };

  const markComplete = async function (job) {
    try {
      await api.put("/jobs/" + job._id + "/complete");
      setJobs(function (prev) {
        return prev.map(function (j) {
          return j._id === job._id ? { ...j, status: "completed" } : j;
        });
      });
      setSelected(function (prev) {
        return prev ? { ...prev, status: "completed" } : prev;
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  var STATUS = {
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

  var cardBase = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    cursor: "pointer",
    transition: "border-color 0.15s",
  };

  var cardSel = {
    ...cardBase,
    borderColor: "rgba(200,241,53,0.35)",
    background: "#1e1e1a",
  };

  var inp = {
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

  var pending = jobs.filter(function (j) {
    return j.status === "pending";
  });
  var active = jobs.filter(function (j) {
    return j.status === "accepted";
  });
  var past = jobs.filter(function (j) {
    return j.status === "rejected" || j.status === "completed";
  });

  function JobCard(props) {
    var job = props.job;
    var isSel = selected && selected._id === job._id;
    var st = STATUS[job.status] || STATUS.pending;
    var clientName =
      job.clientId && job.clientId.name ? job.clientId.name : "Client";
    var initials = clientName
      .split(" ")
      .map(function (n) {
        return n[0];
      })
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div
        style={isSel ? cardSel : cardBase}
        onClick={function () {
          setSelected(isSel ? null : job);
          setNeg(false);
          setMyPrice("");
          setNote("");
        }}
        onMouseOver={function (e) {
          if (!isSel)
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
        }}
        onMouseOut={function (e) {
          if (!isSel)
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                marginBottom: 5,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {job.description ? job.description.split("\n")[0] : "Job request"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 11, height: 11 }}
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {job.location && job.location.address
                ? job.location.address
                : "Location not set"}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            {job.price && (
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#c8f135",
                }}
              >
                ₹{job.price}
              </div>
            )}
            <span
              style={{
                padding: "3px 8px",
                borderRadius: 20,
                fontSize: 10,
                fontWeight: 700,
                background: st.bg,
                color: st.color,
                marginTop: 4,
                display: "inline-block",
              }}
            >
              {st.label}
            </span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#f97316,#ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 8,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {clientName}
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              marginLeft: "auto",
            }}
          >
            {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    );
  }

  function Section(props) {
    var title = props.title;
    var list = props.list;
    var color = props.color || "#c8f135";
    if (list.length === 0) return null;
    return (
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: color,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          {title} ({list.length})
        </div>
        {list.map(function (j) {
          return <JobCard key={j._id} job={j} />;
        })}
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .jobs-chat::-webkit-scrollbar { width: 4px; }
        .jobs-chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>

      <div>
        <h2
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            margin: "0 0 4px",
          }}
        >
          Job Requests
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.35)",
            marginBottom: 24,
          }}
        >
          Clients who booked you · accept, reject, or negotiate
        </p>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "48px 0",
              color: "rgba(255,255,255,0.25)",
              fontSize: 14,
            }}
          >
            Loading jobs…
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: selected ? "1fr 400px" : "1fr",
              gap: 16,
              alignItems: "start",
            }}
          >
            {/* Left: job list */}
            <div>
              {jobs.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "64px 0",
                    color: "rgba(255,255,255,0.2)",
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  No job requests yet.
                  <br />
                  <span
                    style={{ fontSize: 12, color: "rgba(255,255,255,0.15)" }}
                  >
                    Clients will appear here when they book you.
                  </span>
                </div>
              ) : (
                <>
                  <Section
                    title="New requests"
                    list={pending}
                    color="#fbbf24"
                  />
                  <Section title="Accepted" list={active} color="#c8f135" />
                  <Section
                    title="Past jobs"
                    list={past}
                    color="rgba(255,255,255,0.3)"
                  />
                </>
              )}
            </div>

            {/* Right: detail + chat panel */}
            {selected && (
              <div
                style={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16,
                  overflow: "hidden",
                  position: "sticky",
                  top: 0,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}
                    >
                      {selected.clientId && selected.clientId.name
                        ? selected.clientId.name
                        : "Client"}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        marginTop: 2,
                      }}
                    >
                      {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={function () {
                      setSelected(null);
                      setNeg(false);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.3)",
                      cursor: "pointer",
                      fontSize: 20,
                      padding: 0,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>

                {/* Job description + meta */}
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.7,
                      margin: "0 0 12px",
                    }}
                  >
                    {selected.description}
                  </p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {selected.price && (
                      <span
                        style={{
                          padding: "4px 10px",
                          background: "rgba(200,241,53,0.1)",
                          color: "#c8f135",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        ₹{selected.price}
                      </span>
                    )}
                    {selected.location && selected.location.address && (
                      <span
                        style={{
                          padding: "4px 10px",
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.5)",
                          borderRadius: 20,
                          fontSize: 12,
                        }}
                      >
                        {selected.location.address}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons — pending only */}
                {selected.status === "pending" && (
                  <div
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {!negotiating ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={function () {
                            accept(selected);
                          }}
                          disabled={acting}
                          style={{
                            padding: "11px",
                            background: "#c8f135",
                            border: "none",
                            borderRadius: 10,
                            color: "#0d0d0d",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'Manrope',sans-serif",
                            opacity: acting ? 0.6 : 1,
                          }}
                        >
                          ✓ Accept
                          {selected.price ? " at ₹" + selected.price : ""}
                        </button>
                        <button
                          onClick={function () {
                            setNeg(true);
                          }}
                          style={{
                            padding: "11px",
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
                          ₹ Counter Offer
                        </button>
                        <button
                          onClick={function () {
                            reject(selected);
                          }}
                          disabled={acting}
                          style={{
                            padding: "11px",
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            borderRadius: 10,
                            color: "rgba(255,255,255,0.35)",
                            fontSize: 13,
                            cursor: "pointer",
                            fontFamily: "'Manrope',sans-serif",
                            opacity: acting ? 0.6 : 1,
                          }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: "rgba(255,255,255,0.4)",
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            marginBottom: 6,
                          }}
                        >
                          Your counter price (₹)
                        </div>
                        <input
                          type="number"
                          value={myPrice}
                          onChange={function (e) {
                            setMyPrice(e.target.value);
                          }}
                          placeholder={
                            selected.price
                              ? "Client offered: ₹" + selected.price
                              : "Enter your price"
                          }
                          style={{
                            ...inp,
                            border: "1px solid rgba(167,139,250,0.3)",
                            marginBottom: 8,
                          }}
                        />
                        <textarea
                          value={note}
                          onChange={function (e) {
                            setNote(e.target.value);
                          }}
                          placeholder="Optional note to client…"
                          rows={2}
                          style={{ ...inp, resize: "none", marginBottom: 10 }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={function () {
                              setNeg(false);
                            }}
                            style={{
                              flex: 1,
                              padding: "9px",
                              background: "rgba(255,255,255,0.05)",
                              border: "none",
                              borderRadius: 10,
                              color: "rgba(255,255,255,0.4)",
                              fontSize: 13,
                              cursor: "pointer",
                              fontFamily: "'Manrope',sans-serif",
                            }}
                          >
                            Back
                          </button>
                          <button
                            onClick={function () {
                              negotiate(selected);
                            }}
                            disabled={!myPrice || acting}
                            style={{
                              flex: 2,
                              padding: "9px",
                              background: myPrice
                                ? "#a78bfa"
                                : "rgba(167,139,250,0.15)",
                              border: "none",
                              borderRadius: 10,
                              color: myPrice ? "#fff" : "rgba(255,255,255,0.3)",
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: myPrice ? "pointer" : "not-allowed",
                              fontFamily: "'Manrope',sans-serif",
                              opacity: acting ? 0.6 : 1,
                            }}
                          >
                            Send Counter Offer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Accepted bar */}
                {selected.status === "accepted" && (
                  <div
                    style={{
                      padding: "12px 20px",
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      background: "rgba(200,241,53,0.04)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        color: "#c8f135",
                        fontWeight: 600,
                        marginBottom: 8,
                      }}
                    >
                      ✓ Job accepted
                      {selected.price ? " — ₹" + selected.price : ""}
                    </div>
                    <button
                      onClick={function () {
                        markComplete(selected);
                      }}
                      style={{
                        padding: "8px 16px",
                        background: "rgba(52,211,153,0.15)",
                        border: "1px solid rgba(52,211,153,0.25)",
                        borderRadius: 8,
                        color: "#34d399",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif",
                      }}
                    >
                      Mark as completed
                    </button>
                  </div>
                )}

                {/* Chat */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: 280,
                  }}
                >
                  <div
                    className="jobs-chat"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px 16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                    }}
                  >
                    {messages.length === 0 && (
                      <div
                        style={{
                          textAlign: "center",
                          color: "rgba(255,255,255,0.2)",
                          fontSize: 12,
                          marginTop: 32,
                        }}
                      >
                        No messages yet
                      </div>
                    )}
                    {messages.map(function (m, i) {
                      var isMe =
                        m.senderId === (me && me._id) ||
                        (m.senderId && m.senderId._id) === (me && me._id);
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
                              maxWidth: "78%",
                              padding: "8px 12px",
                              borderRadius: isMe
                                ? "14px 14px 4px 14px"
                                : "14px 14px 14px 4px",
                              background: isMe
                                ? "#c8f135"
                                : "rgba(255,255,255,0.07)",
                              color: isMe ? "#0d0d0d" : "#fff",
                              fontSize: 12,
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
                      padding: "10px 12px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                      display: "flex",
                      gap: 6,
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
                      placeholder="Message…"
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 8,
                        padding: "8px 12px",
                        color: "#fff",
                        fontSize: 13,
                        fontFamily: "'Manrope',sans-serif",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={sendMsg}
                      style={{
                        width: 36,
                        height: 36,
                        background: "#c8f135",
                        border: "none",
                        borderRadius: 8,
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
                        style={{ width: 14, height: 14 }}
                      >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
