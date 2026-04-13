// src/pages/worker/Messages.jsx
// Workers chat via the Jobs page chat button (after accepting a job)
// This page shows a summary of all active job chats

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";

export default function WorkerMessages() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/jobs/worker")
      .then((r) =>
        setJobs(
          (r.data || []).filter((j) =>
            ["accepted", "ongoing"].includes(j.status),
          ),
        ),
      )
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 10,
    cursor: "pointer",
    transition: "border-color 0.15s",
  };

  return (
    <div style={{ maxWidth: 560, fontFamily: "'Manrope',sans-serif" }}>
      <style>{`.wm-card:hover{border-color:rgba(255,255,255,0.18)!important;}`}</style>
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
          Messages
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
          Chat is available for accepted and ongoing jobs.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            color: "rgba(255,255,255,0.3)",
            fontSize: 14,
            textAlign: "center",
            padding: "48px 0",
          }}
        >
          Loading…
        </div>
      ) : jobs.length === 0 ? (
        <div
          style={{
            ...card,
            textAlign: "center",
            padding: "44px 24px",
            cursor: "default",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            No active chats
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.3)",
              marginBottom: 18,
            }}
          >
            Accept a job request to start chatting with clients.
          </div>
          <button
            onClick={() => navigate("/worker/jobs")}
            style={{
              background: "#c8f135",
              color: "#0d0d0d",
              border: "none",
              borderRadius: 10,
              padding: "10px 22px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            View Jobs
          </button>
        </div>
      ) : (
        jobs.map((job) => (
          <div
            key={job._id}
            className="wm-card"
            style={card}
            onClick={() => navigate("/worker/jobs")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#6366f1,#a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {(job.clientId?.name || "C")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    marginBottom: 2,
                  }}
                >
                  {job.clientId?.name || "Client"}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.35)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {job.description?.slice(0, 50)}
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background:
                    job.status === "ongoing"
                      ? "rgba(167,139,250,0.12)"
                      : "rgba(74,222,128,0.12)",
                  color: job.status === "ongoing" ? "#a78bfa" : "#4ade80",
                }}
              >
                {job.status === "ongoing" ? "In Progress" : "Accepted"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
