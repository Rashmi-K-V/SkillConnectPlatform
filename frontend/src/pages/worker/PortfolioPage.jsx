// src/pages/worker/PortfolioPage.jsx
import { useState, useEffect, useContext } from "react";
import api from "../../services/api.services.js";
import { useWorker } from "../../context/WorkerContext.jsx";
import { LanguageContext } from "../../context/LanguageContext.jsx";

const CATEGORIES = ["electrician", "plumber", "cleaner", "cook", "tailor"];

export default function PortfolioPage() {
  const { portfolio, loading, refreshPortfolio } = useWorker();
  const { t } = useContext(LanguageContext);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Form state — mirrors Portfolio schema exactly
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    contact: "",
    experience: "",
    pricing: "",
    description: "",
    skills: [],
    category: "",
    videoUrl: "",
  });

  // When WorkerContext finishes loading, hydrate the form
  useEffect(() => {
    if (portfolio) {
      setForm({
        name: portfolio.name || "",
        age: portfolio.age || "",
        gender: portfolio.gender || "",
        email: portfolio.email || "",
        contact: portfolio.contact || "",
        experience: portfolio.experience || "",
        pricing: portfolio.pricing || "",
        description: portfolio.description || "",
        skills: portfolio.skills || [],
        category: portfolio.category || "",
        videoUrl: portfolio.videoUrl || "",
      });
    }
  }, [portfolio]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.post("/portfolios", {
        name: form.name || undefined,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        email: form.email || undefined,
        contact: form.contact || undefined,
        experience: form.experience || undefined,
        pricing: form.pricing || undefined,
        description: form.description || undefined,
        skills: form.skills,
        category: form.category || undefined,
        videoUrl: form.videoUrl || undefined,
      });
      await refreshPortfolio();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Error saving: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s))
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  };

  // ── Styles ─────────────────────────────────────────────────
  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "22px 24px",
    marginBottom: 14,
  };
  const lb = {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.38)",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    display: "block",
    marginBottom: 7,
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
    transition: "border-color 0.15s",
  };

  if (loading) {
    return (
      <div
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, padding: 24 }}
      >
        Loading portfolio…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680 }}>
      <style>{`
        .pp-inp:focus { border-color: #c8f135 !important; box-shadow: 0 0 0 3px rgba(200,241,53,0.09) !important; }
        .pp-cat:hover { border-color: rgba(255,255,255,0.3) !important; }
      `}</style>

      {/* Header */}
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
          {t("portfolio") || "Portfolio"}
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.32)" }}>
          Manage your public profile. Clients browse this when searching for
          workers.
        </p>
      </div>

      {/* No portfolio yet — prompt to upload */}
      {!portfolio && (
        <div
          style={{
            ...card,
            borderColor: "rgba(251,191,36,0.2)",
            background: "rgba(251,191,36,0.05)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#fbbf24",
                  marginBottom: 2,
                }}
              >
                No portfolio yet
              </div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)" }}>
                Upload a video first to auto-fill your profile, or fill in the
                details below manually.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video preview */}
      {form.videoUrl && (
        <div style={card}>
          <label style={lb}>Your Video</label>
          <video
            src={form.videoUrl}
            controls
            style={{
              width: "100%",
              borderRadius: 10,
              maxHeight: 240,
              background: "#000",
            }}
          />
        </div>
      )}

      {/* Category */}
      <div style={card}>
        <label style={lb}>
          Worker Category
          {!form.category && (
            <span style={{ color: "#f87171", marginLeft: 6, fontSize: 11 }}>
              * required for clients to find you
            </span>
          )}
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="pp-cat"
              onClick={() => setForm((p) => ({ ...p, category: cat }))}
              style={{
                padding: "7px 18px",
                borderRadius: 20,
                border:
                  form.category === cat
                    ? "1.5px solid #c8f135"
                    : "1.5px solid rgba(255,255,255,0.12)",
                background:
                  form.category === cat
                    ? "rgba(200,241,53,0.12)"
                    : "rgba(255,255,255,0.04)",
                color:
                  form.category === cat ? "#c8f135" : "rgba(255,255,255,0.5)",
                fontFamily: "'Manrope',sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={card}>
        <label style={lb}>About You</label>
        <textarea
          className="pp-inp"
          placeholder="Tell clients about yourself, your style, and what makes your work stand out…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          style={{ ...inp, resize: "vertical", lineHeight: 1.65 }}
        />
      </div>

      {/* Skills */}
      <div style={card}>
        <label style={lb}>
          {t("skills") || "Skills"}
          <span
            style={{
              color: "rgba(255,255,255,0.25)",
              textTransform: "none",
              fontSize: 11,
              fontWeight: 400,
              marginLeft: 6,
            }}
          >
            add comma-separated or one at a time
          </span>
        </label>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginBottom: 10,
          }}
        >
          {form.skills.map((sk) => (
            <span
              key={sk}
              style={{
                padding: "5px 12px",
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
              <span
                onClick={() => removeSkill(sk)}
                style={{ cursor: "pointer", fontSize: 14, opacity: 0.6 }}
              >
                ×
              </span>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="pp-inp"
            placeholder="Type a skill and press Enter or +"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSkill()}
            style={{ ...inp, flex: 1 }}
          />
          <button
            onClick={addSkill}
            style={{
              padding: "10px 18px",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Personal info grid */}
      <div style={card}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(255,255,255,0.38)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 16,
          }}
        >
          Personal Details
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {[
            { label: "Full Name", field: "name", type: "text" },
            { label: "Age", field: "age", type: "number" },
            { label: "Email", field: "email", type: "email" },
            { label: "Contact No.", field: "contact", type: "tel" },
            { label: "Experience", field: "experience", type: "text" },
            { label: "Pricing", field: "pricing", type: "text" },
          ].map(({ label, field, type }) => (
            <div key={field}>
              <label style={lb}>{label}</label>
              <input
                className="pp-inp"
                type={type}
                value={form[field]}
                onChange={(e) =>
                  setForm((p) => ({ ...p, [field]: e.target.value }))
                }
                style={inp}
                placeholder={label}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={lb}>Gender</label>
          <select
            className="pp-inp"
            value={form.gender}
            onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
            style={{ ...inp, cursor: "pointer" }}
          >
            <option value="">Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      {/* Save row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "13px 32px",
            background: saving ? "rgba(200,241,53,0.45)" : "#c8f135",
            color: "#0d0d0d",
            border: "none",
            borderRadius: 11,
            fontSize: 14,
            fontWeight: 700,
            cursor: saving ? "not-allowed" : "pointer",
            fontFamily: "'Manrope',sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {saving ? (
            <>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.2)",
                  borderTopColor: "#0d0d0d",
                  animation: "spin 0.7s linear infinite",
                }}
              />
              Saving…
            </>
          ) : (
            <>{t("save") || "Save Portfolio"}</>
          )}
        </button>

        {saved && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              fontWeight: 600,
              color: "#4ade80",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ width: 15, height: 15 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Portfolio saved!
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
