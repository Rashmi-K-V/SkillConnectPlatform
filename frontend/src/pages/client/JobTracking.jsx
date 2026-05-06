import { useEffect, useState, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { getSocket } from "../../services/socket.services.js";
import { LanguageContext } from "../../context/LanguageContext.jsx";

export default function JobTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useContext(LanguageContext);
  const bottomRef = useRef(null);
  const socket = getSocket();

  const [job, setJob] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [workerLoc, setWorkerLoc] = useState(null);
  const [otpInput, setOtpInput] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    loadData();
    socket.emit("joinJob", id);

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
      setJob(function (prev) {
        return prev
          ? { ...prev, status: data.status, price: data.price || prev.price }
          : prev;
      });
    });

    socket.on("updateWorkerLocation", function (data) {
      setWorkerLoc(data.location);
    });

    socket.on("arrival_otp", function (data) {
      setJob(function (prev) {
        return prev
          ? { ...prev, arrivalOtp: data.otp, status: "ongoing" }
          : prev;
      });
    });

    socket.on("completion_otp", function (data) {
      setJob(function (prev) {
        return prev
          ? { ...prev, completionOtp: data.otp, status: "work_done" }
          : prev;
      });
    });

    socket.on("payment_requested", function (data) {
      setJob(function (prev) {
        return prev
          ? { ...prev, status: "work_done", paymentDisputeAt: data.deadline }
          : prev;
      });
    });

    socket.on("payment_dispute", function () {
      setJob(function (prev) {
        return prev ? { ...prev, status: "payment_dispute" } : prev;
      });
    });

    socket.on("arrival_verified", function () {
      setJob(function (prev) {
        return prev ? { ...prev, status: "verified" } : prev;
      });
    });

    socket.on("job_completed_worker", function () {
      setJob(function (prev) {
        return prev ? { ...prev, status: "completed" } : prev;
      });
    });

    return function () {
      socket.off("receiveMessage");
      socket.off("jobStatusChanged");
      socket.off("updateWorkerLocation");
      socket.off("arrival_otp");
      socket.off("completion_otp");
      socket.off("payment_requested");
      socket.off("payment_dispute");
      socket.off("arrival_verified");
      socket.off("job_completed_worker");
    };
  }, [id]);

  useEffect(
    function () {
      if (bottomRef.current)
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
    },
    [messages],
  );

  var loadData = async function () {
    try {
      var meRes = await api.get("/auth/me");
      var jobRes = await api.get("/jobs/client");
      var msgRes = await api.get("/messages/" + id);

      setMe(meRes.data);
      var found = (jobRes.data || []).find(function (j) {
        return j._id === id;
      });
      setJob(found || null);
      setMessages(msgRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  var sendMsg = function () {
    if (!msg.trim() || !me || !id) return;
    socket.emit("sendMessage", {
      jobId: id,
      senderId: me._id,
      text: msg.trim(),
      lang: lang,
    });
    setMsg("");
  };

  var acceptCounterOffer = async function () {
    setActing(true);
    try {
      await api.put("/jobs/" + id + "/accept", { price: job.price });
      setJob(function (prev) {
        return { ...prev, status: "accepted" };
      });
      socket.emit("jobStatusUpdate", {
        jobId: id,
        status: "accepted",
        price: job.price,
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  };

  var submitCompletionOtp = async function () {
    if (!otpInput.trim()) {
      alert("Enter the completion code from the worker.");
      return;
    }
    setActing(true);
    try {
      await api.put("/jobs/" + id + "/complete", { otp: otpInput });
      setJob(function (prev) {
        return { ...prev, status: "completed" };
      });
      setOtpInput("");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  };

  var cancelJob = async function () {
    if (!window.confirm("Cancel this job request?")) return;
    setActing(true);
    try {
      await api.put("/jobs/" + id + "/reject");
      navigate("/client/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setActing(false);
    }
  };

  var [showFeedback, setShowFeedback] = useState(false);
  var [feedback, setFeedback] = useState({
    rating: 5,
    comment: "",
    wouldRecommend: true,
  });
  var [submittingFb, setSubmittingFb] = useState(false);

  var submitFeedback = async function () {
    setSubmittingFb(true);
    try {
      await api.post("/jobs/" + id + "/feedback", feedback);
      setJob(function (prev) {
        return { ...prev, status: "rated" };
      });
      setShowFeedback(false);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmittingFb(false);
    }
  };

  var STATUS = {
    pending: { bg: "rgba(251,191,36,0.1)", color: "#fbbf24", label: "Pending" },
    negotiating: {
      bg: "rgba(167,139,250,0.1)",
      color: "#a78bfa",
      label: "Negotiating",
    },
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
    ongoing: {
      bg: "rgba(96,165,250,0.1)",
      color: "#60a5fa",
      label: "Worker En Route",
    },
    verified: {
      bg: "rgba(52,211,153,0.1)",
      color: "#34d399",
      label: "Work Started",
    },
    work_done: {
      bg: "rgba(251,191,36,0.1)",
      color: "#fbbf24",
      label: "Work Done",
    },
    completed: {
      bg: "rgba(200,241,53,0.1)",
      color: "#c8f135",
      label: "Completed",
    },
    rated: { bg: "rgba(200,241,53,0.1)", color: "#c8f135", label: "Rated" },
    payment_dispute: {
      bg: "rgba(248,113,113,0.1)",
      color: "#f87171",
      label: "Payment Dispute",
    },
  };

  var root = {
    fontFamily: "'Manrope','Segoe UI',sans-serif",
    minHeight: "100vh",
    background: "#0d0d0d",
    padding: "28px",
    boxSizing: "border-box",
  };
  var card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
  };
  var inp = {
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
  var backBtn = {
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

  var st = STATUS[job.status] || STATUS.pending;
  var workerName = job.workerId?.name || "Worker";
  var isEnRoute = job.status === "ongoing";
  var isWorkDone = job.status === "work_done";
  var isCompleted = job.status === "completed" || job.status === "rated";
  var isNeg =
    job.status === "negotiating" || (job.status === "pending" && job.price);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Manrope:wght@400;500;600&display=swap');
        .jt-back:hover { color: #c8f135 !important; }
        .jt-send:hover { opacity: 0.85; }
        .jt-chat::-webkit-scrollbar { width: 4px; }
        .jt-chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to { transform: rotate(360deg); } }
      `}</style>

      <div style={root}>
        <button
          className="jt-back"
          style={backBtn}
          onClick={function () {
            navigate("/client/dashboard");
          }}
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
          {/* ── Status card ── */}
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
                ["Location", job.location || "—"],
                [
                  "Payment",
                  job.paymentMethod === "cash"
                    ? "💵 Cash"
                    : job.paymentMethod === "upi"
                      ? "📱 UPI"
                      : "🏦 Bank",
                ],
                ["Booked on", new Date(job.createdAt).toLocaleDateString()],
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
                      style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}
                    >
                      {item[1]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Negotiation / Counter offer ── */}
            {isNeg && job.price && (
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
                    disabled={acting}
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
                      opacity: acting ? 0.6 : 1,
                    }}
                  >
                    Accept ₹{job.price}
                  </button>
                  <button
                    onClick={cancelJob}
                    disabled={acting}
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

            {/* ── Cancel (only while pending, no price set yet) ── */}
            {job.status === "pending" && !job.price && (
              <button
                onClick={cancelJob}
                disabled={acting}
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

          {/* ── Worker En Route: live map + arrival OTP ── */}
          {isEnRoute && (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#60a5fa",
                    animation: "pulse 1s infinite",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {workerName} is on the way
                </span>
                {workerLoc && (
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      marginLeft: "auto",
                    }}
                  >
                    📍 Live tracking
                  </span>
                )}
              </div>

              {workerLoc ? (
                <iframe
                  title="Worker live location"
                  width="100%"
                  height="220"
                  style={{ border: "none", display: "block" }}
                  src={
                    "https://www.google.com/maps?q=" +
                    workerLoc.lat +
                    "," +
                    workerLoc.lng +
                    "&z=15&output=embed"
                  }
                />
              ) : (
                <div
                  style={{
                    height: 120,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.25)",
                    fontSize: 13,
                    background: "rgba(0,0,0,0.2)",
                  }}
                >
                  Waiting for worker's location…
                </div>
              )}

              {job.arrivalOtp && (
                <div
                  style={{
                    padding: "14px 16px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(200,241,53,0.04)",
                  }}
                >
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
                    Your arrival code — show this to the worker when they arrive
                  </div>
                  <div
                    style={{
                      fontFamily: "'Syne',sans-serif",
                      fontSize: 36,
                      fontWeight: 700,
                      color: "#c8f135",
                      letterSpacing: 12,
                      marginBottom: 4,
                    }}
                  >
                    {job.arrivalOtp}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    The worker will enter this 4-digit code on their device to
                    confirm arrival
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Work Done: client enters completion OTP ── */}
          {isWorkDone && (
            <div style={{ ...card, borderColor: "rgba(251,191,36,0.2)" }}>
              {job.completionOtp ? (
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    Work completed! Enter the code from the worker
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      marginBottom: 16,
                    }}
                  >
                    The worker will show you a 4-digit completion code
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={otpInput}
                      onChange={function (e) {
                        setOtpInput(
                          e.target.value.replace(/\D/g, "").slice(0, 4),
                        );
                      }}
                      placeholder="Enter 4-digit code"
                      maxLength={4}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(200,241,53,0.3)",
                        borderRadius: 10,
                        padding: "12px 14px",
                        color: "#fff",
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: 10,
                        textAlign: "center",
                        fontFamily: "'Syne',sans-serif",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={submitCompletionOtp}
                      disabled={otpInput.length !== 4 || acting}
                      style={{
                        padding: "12px 20px",
                        background:
                          otpInput.length === 4
                            ? "#c8f135"
                            : "rgba(255,255,255,0.05)",
                        border: "none",
                        borderRadius: 10,
                        color:
                          otpInput.length === 4
                            ? "#0d0d0d"
                            : "rgba(255,255,255,0.3)",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor:
                          otpInput.length === 4 ? "pointer" : "not-allowed",
                        fontFamily: "'Manrope',sans-serif",
                        opacity: acting ? 0.6 : 1,
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 20 }}>💰</span>
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#fbbf24",
                        }}
                      >
                        Awaiting payment from you
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 2,
                        }}
                      >
                        {workerName} has completed the work. Please pay ₹
                        {job.price}.
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(248,113,113,0.7)",
                      padding: "8px 12px",
                      background: "rgba(248,113,113,0.06)",
                      borderRadius: 8,
                    }}
                  >
                    ⚠️ If not paid within 10 minutes, this will be escalated
                    automatically.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Payment Dispute ── */}
          {job.status === "payment_dispute" && (
            <div
              style={{
                ...card,
                borderColor: "rgba(248,113,113,0.2)",
                background: "rgba(248,113,113,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#f87171",
                  marginBottom: 6,
                }}
              >
                ⚠️ Payment dispute escalated
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
                This case has been escalated. Please contact support to resolve.
              </div>
            </div>
          )}

          {/* ── Completed: leave a review ── */}
          {isCompleted && !showFeedback && job.status !== "rated" && (
            <div
              style={{
                ...card,
                borderColor: "rgba(200,241,53,0.2)",
                background: "rgba(200,241,53,0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#c8f135",
                  marginBottom: 4,
                }}
              >
                ✓ Job completed!
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: 12,
                }}
              >
                How was your experience with {workerName}?
              </div>
              <button
                onClick={function () {
                  setShowFeedback(true);
                }}
                style={{
                  width: "100%",
                  padding: "11px",
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
                Leave a Review
              </button>
            </div>
          )}

          {job.status === "rated" && (
            <div
              style={{
                ...card,
                background: "rgba(200,241,53,0.04)",
                borderColor: "rgba(200,241,53,0.15)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: "#c8f135" }}>
                ✓ Review submitted — thank you!
              </div>
            </div>
          )}

          {/* ── Feedback form ── */}
          {showFeedback && (
            <div style={card}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                Rate your experience
              </div>

              <div style={{ marginBottom: 14 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 8,
                  }}
                >
                  Overall Rating
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(function (star) {
                    return (
                      <button
                        key={star}
                        onClick={function () {
                          setFeedback(function (p) {
                            return { ...p, rating: star };
                          });
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          border:
                            feedback.rating >= star
                              ? "none"
                              : "1px solid rgba(255,255,255,0.1)",
                          background:
                            feedback.rating >= star
                              ? "rgba(251,191,36,0.2)"
                              : "rgba(255,255,255,0.04)",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                      >
                        {feedback.rating >= star ? "★" : "☆"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
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
                  Comment (optional)
                </div>
                <textarea
                  value={feedback.comment}
                  onChange={function (e) {
                    setFeedback(function (p) {
                      return { ...p, comment: e.target.value };
                    });
                  }}
                  placeholder="Share your experience…"
                  rows={3}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 10,
                    padding: "10px 14px",
                    color: "#fff",
                    fontSize: 13,
                    fontFamily: "'Manrope',sans-serif",
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  marginBottom: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  Would you recommend {workerName}?
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {["Yes", "No"].map(function (opt) {
                    var val = opt === "Yes";
                    return (
                      <button
                        key={opt}
                        onClick={function () {
                          setFeedback(function (p) {
                            return { ...p, wouldRecommend: val };
                          });
                        }}
                        style={{
                          padding: "6px 16px",
                          borderRadius: 20,
                          border:
                            feedback.wouldRecommend === val
                              ? "none"
                              : "1px solid rgba(255,255,255,0.1)",
                          background:
                            feedback.wouldRecommend === val
                              ? val
                                ? "rgba(74,222,128,0.2)"
                                : "rgba(248,113,113,0.2)"
                              : "rgba(255,255,255,0.04)",
                          color:
                            feedback.wouldRecommend === val
                              ? val
                                ? "#4ade80"
                                : "#f87171"
                              : "rgba(255,255,255,0.4)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                          fontFamily: "'Manrope',sans-serif",
                        }}
                      >
                        {opt === "Yes" ? "👍 Yes" : "👎 No"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={function () {
                    setShowFeedback(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: 10,
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={submitFeedback}
                  disabled={submittingFb}
                  style={{
                    flex: 2,
                    padding: "10px",
                    background: "#c8f135",
                    border: "none",
                    borderRadius: 10,
                    color: "#0d0d0d",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                    opacity: submittingFb ? 0.6 : 1,
                  }}
                >
                  {submittingFb ? "Submitting…" : "Submit Review"}
                </button>
              </div>
            </div>
          )}

          {/* ── Chat ── */}
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
                height: 280,
                overflowY: "auto",
                padding: "14px 16px",
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
                    marginTop: 32,
                  }}
                >
                  No messages yet. Say hello!
                </div>
              )}
              {messages.map(function (m, i) {
                var isMe =
                  m.senderId === me?._id ||
                  (m.senderId && m.senderId._id) === me?._id;
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
                      <div
                        style={{
                          fontSize: 10,
                          marginTop: 3,
                          opacity: 0.5,
                          textAlign: "right",
                        }}
                      >
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
            <div
              style={{
                padding: "12px 14px",
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
