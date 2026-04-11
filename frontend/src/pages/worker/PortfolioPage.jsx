// src/pages/worker/Portfolio.jsx
import { useState, useEffect } from "react";
import { useWorker } from "../../context/WorkerContext.jsx";
import axios from "axios";

export default function Portfolio() {
  const { user, portfolio, refreshPortfolio } = useWorker();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (portfolio) {
      setForm({
        name: portfolio.name || user?.name || "",
        age: portfolio.age || "",
        gender: portfolio.gender || "",
        email: portfolio.email || user?.email || "",
        contact: portfolio.contact || "",
        experience: portfolio.experience || "",
        pricing: portfolio.pricing || "",
        skills: portfolio.skills || [],
        category: portfolio.category || user?.category || "",
      });
    }
  }, [portfolio, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/portfolio/update", form);
      await refreshPortfolio();
      setEditing(false);
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  };
  const lbl = {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    display: "block",
    marginBottom: 5,
  };
  const inp = {
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
  const val = { fontSize: 15, color: "#fff", fontWeight: 500 };

  const Field = ({ label, field, type = "text", options }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={lbl}>{label}</label>
      {editing ? (
        options ? (
          <select
            value={form[field] || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, [field]: e.target.value }))
            }
            style={{ ...inp, cursor: "pointer" }}
          >
            <option value="">Select</option>
            {options.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={form[field] || ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, [field]: e.target.value }))
            }
            style={inp}
          />
        )
      ) : (
        <div style={val}>
          {form[field] || (
            <span style={{ color: "rgba(255,255,255,0.2)" }}>Not set</span>
          )}
        </div>
      )}
    </div>
  );

  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s))
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";

  return (
    <div style={{ maxWidth: 640 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: "#fff",
              margin: 0,
            }}
          >
            My Portfolio
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              marginTop: 4,
            }}
          >
            How clients see your profile
          </p>
        </div>
        {editing ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: "9px 18px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.6)",
                fontSize: 13,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "9px 18px",
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
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: "9px 18px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: 14, height: 14 }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Profile
          </button>
        )}
      </div>

      {/* Header card */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#f97316,#ec4899)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {form.name || user?.name || "—"}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              marginTop: 3,
              textTransform: "capitalize",
            }}
          >
            {form.category || user?.category || "Worker"}
          </div>
          {portfolio?.videoUrl && (
            <a
              href={portfolio.videoUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                fontSize: 12,
                color: "#c8f135",
                marginTop: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                textDecoration: "none",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ width: 12, height: 12 }}
              >
                <polygon points="5,3 19,12 5,21" />
              </svg>
              View portfolio video
            </a>
          )}
        </div>
        {form.pricing && (
          <div
            style={{
              background: "rgba(200,241,53,0.1)",
              border: "1px solid rgba(200,241,53,0.2)",
              borderRadius: 10,
              padding: "8px 14px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, color: "#c8f135" }}>
              {form.pricing}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
              per job
            </div>
          </div>
        )}
      </div>

      {/* Personal info */}
      <div style={card}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            style={{ width: 14, height: 14 }}
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Personal Info
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0 24px",
          }}
        >
          <Field label="Full Name" field="name" />
          <Field label="Age" field="age" type="number" />
          <Field
            label="Gender"
            field="gender"
            options={["Male", "Female", "Other"]}
          />
          <Field label="Email" field="email" type="email" />
          <Field label="Contact No" field="contact" type="tel" />
          <Field label="Experience" field="experience" />
          <Field label="Pricing" field="pricing" />
          <Field
            label="Category"
            field="category"
            options={["plumber", "electrician", "cook", "cleaner", "tailor"]}
          />
        </div>
      </div>

      {/* Skills */}
      <div style={card}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 16,
          }}
        >
          Skills
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(form.skills || []).map((sk) => (
            <span
              key={sk}
              style={{
                padding: "6px 14px",
                background: "rgba(200,241,53,0.1)",
                color: "#c8f135",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                border: "1px solid rgba(200,241,53,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {sk}
              {editing && (
                <span
                  onClick={() => removeSkill(sk)}
                  style={{
                    cursor: "pointer",
                    fontSize: 15,
                    lineHeight: 1,
                    opacity: 0.7,
                  }}
                >
                  ×
                </span>
              )}
            </span>
          ))}
          {editing && (
            <div style={{ display: "flex", gap: 4 }}>
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add skill…"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "6px 12px",
                  color: "#fff",
                  fontSize: 12,
                  outline: "none",
                  width: 120,
                  fontFamily: "'Manrope',sans-serif",
                }}
              />
              <button
                onClick={addSkill}
                style={{
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 20,
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
          )}
          {(form.skills || []).length === 0 && !editing && (
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
              No skills yet — upload a video to auto-detect
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {portfolio?.description && (
        <div style={card}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 10,
            }}
          >
            AI-generated description
          </div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            {portfolio.description}
          </p>
        </div>
      )}
    </div>
  );
}
