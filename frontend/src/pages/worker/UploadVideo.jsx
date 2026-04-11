// src/pages/worker/UploadVideo.jsx
import { useState } from "react";
import api from "../../services/api.services.js";
import { useWorker } from "../../context/WorkerContext.jsx";

const CATEGORIES = ["electrician", "plumber", "cleaner", "cook", "tailor"];

export default function UploadVideo() {
  const { refreshPortfolio, portfolio, user } = useWorker();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("idle"); // idle | uploading | done | saved
  const [stepIdx, setStepIdx] = useState(0);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: user?.name || "",
    age: "",
    gender: "",
    email: user?.email || "",
    contact: "",
    experience: "",
    pricing: "",
    skills: [],
    description: "",
    category: portfolio?.category || "",
    videoUrl: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [newSkill, setNewSkill] = useState("");

  // ── Shared styles ──────────────────────────────────────────
  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  };
  const lb = {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    display: "block",
    marginBottom: 6,
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
  const primaryBtn = (disabled = false) => ({
    padding: "13px 24px",
    background: disabled ? "rgba(200,241,53,0.4)" : "#c8f135",
    color: "#0d0d0d",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'Manrope',sans-serif",
    width: "100%",
    transition: "opacity 0.15s",
  });

  const STEPS = [
    "Uploading to Cloudinary",
    "Extracting frames",
    "Detecting skills (BLIP)",
    "Transcribing speech (Whisper)",
    "Saving to database",
  ];

  // ── Upload & Analyse ───────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStep("uploading");
    setStepIdx(0);

    const data = new FormData();
    data.append("video", file);

    const interval = setInterval(() => {
      setStepIdx((prev) => (prev < STEPS.length - 2 ? prev + 1 : prev));
    }, 2500);

    try {
      const res = await api.post("/video/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(interval);
      setStepIdx(STEPS.length - 1);

      const { auto_fill = {}, portfolio: p = {} } = res.data;

      // Pre-fill form with ML results — user can edit before saving
      setForm({
        name: auto_fill.name || user?.name || "",
        age: auto_fill.age || "",
        gender: auto_fill.gender || "",
        email: auto_fill.email || user?.email || "",
        contact: auto_fill.contact || "",
        experience: auto_fill.experience || "",
        pricing: auto_fill.pricing || "",
        description: p.description || auto_fill.description || "",
        skills: p.skills || auto_fill.skills || [],
        category: p.category || portfolio?.category || "",
        videoUrl: p.videoUrl || "",
      });

      setTimeout(() => setStep("done"), 500);
    } catch (err) {
      clearInterval(interval);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
      setStep("idle");
    } finally {
      setUploading(false);
    }
  };

  // ── Save to DB ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.category) {
      alert("Please select your worker category (e.g. Electrician, Cook).");
      return;
    }
    setSaving(true);
    try {
      // POST /portfolios → createOrUpdatePortfolio (upsert)
      // Returns the full portfolio object directly (not wrapped)
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
        category: form.category,
        videoUrl: form.videoUrl || undefined,
      });

      // Refresh WorkerContext so PortfolioPage shows updated data immediately
      await refreshPortfolio();
      setStep("saved");
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
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
  const reset = () => {
    setStep("idle");
    setFile(null);
    setStepIdx(0);
    setForm(emptyForm);
  };

  return (
    <div style={{ maxWidth: 620 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .uv-inp:focus { border-color: #c8f135 !important; box-shadow: 0 0 0 3px rgba(200,241,53,0.1) !important; }
        .uv-drop:hover { border-color: rgba(200,241,53,0.45) !important; }
        .uv-cat:hover { border-color: rgba(255,255,255,0.25) !important; }
      `}</style>

      <h2
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 6px",
        }}
      >
        Upload Video
      </h2>
      <p
        style={{
          fontSize: 13,
          color: "rgba(255,255,255,0.35)",
          marginBottom: 24,
        }}
      >
        Your video will be analysed to auto-detect your skills and fill your
        profile.
      </p>

      {/* ── IDLE ── */}
      {step === "idle" && (
        <div style={card}>
          <label style={lb}>Select video file</label>
          <div
            className="uv-drop"
            onClick={() => document.getElementById("vid-input").click()}
            style={{
              border: "2px dashed rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              transition: "border-color 0.15s",
              marginBottom: 16,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              style={{
                width: 40,
                height: 40,
                margin: "0 auto 12px",
                display: "block",
              }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {file ? (
              <div style={{ color: "#c8f135", fontSize: 14, fontWeight: 600 }}>
                {file.name}
              </div>
            ) : (
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
                Click to select a video (mp4, mov, avi)
              </div>
            )}
          </div>
          <input
            id="vid-input"
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            style={primaryBtn(!file)}
            disabled={!file}
            onClick={handleUpload}
          >
            Upload &amp; Analyse
          </button>
        </div>
      )}

      {/* ── UPLOADING ── */}
      {step === "uploading" && (
        <div style={card}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              marginBottom: 20,
            }}
          >
            Analysing your video…
          </div>
          {STEPS.map((s, i) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background:
                    i < stepIdx
                      ? "#c8f135"
                      : i === stepIdx
                        ? "rgba(200,241,53,0.15)"
                        : "rgba(255,255,255,0.07)",
                  border: i === stepIdx ? "2px solid #c8f135" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i < stepIdx ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#0d0d0d"
                    strokeWidth="3"
                    style={{ width: 12, height: 12 }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background:
                        i === stepIdx ? "#c8f135" : "rgba(255,255,255,0.2)",
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: i <= stepIdx ? "#fff" : "rgba(255,255,255,0.3)",
                  flex: 1,
                }}
              >
                {s}
              </span>
              {i === stepIdx && (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #c8f135",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── DONE: Review & Save ── */}
      {step === "done" && (
        <>
          {/* Success banner */}
          <div
            style={{
              ...card,
              borderColor: "rgba(200,241,53,0.2)",
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "rgba(200,241,53,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#c8f135"
                  strokeWidth="2.5"
                  style={{ width: 14, height: 14 }}
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#c8f135" }}>
                Video analysed — review the details and save your profile
              </span>
            </div>

            {/* Category picker — REQUIRED */}
            <label style={lb}>
              Your Category{" "}
              <span style={{ color: "#f87171", fontSize: 12 }}>* required</span>
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 18,
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="uv-cat"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  style={{
                    padding: "7px 16px",
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
                      form.category === cat
                        ? "#c8f135"
                        : "rgba(255,255,255,0.5)",
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

            {/* Skills */}
            <label style={lb}>
              Detected Skills{" "}
              <span
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "none",
                  fontSize: 11,
                  fontWeight: 400,
                }}
              >
                (editable)
              </span>
            </label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 4,
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
                    style={{
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                      opacity: 0.6,
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  className="uv-inp"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add skill…"
                  style={{
                    ...inp,
                    width: 120,
                    padding: "5px 10px",
                    fontSize: 12,
                    borderRadius: 20,
                  }}
                />
                <button
                  onClick={addSkill}
                  style={{
                    padding: "5px 12px",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    border: "none",
                    borderRadius: 20,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Profile fields */}
          <div style={card}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 16,
              }}
            >
              Profile Details
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
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
                    className="uv-inp"
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
                className="uv-inp"
                value={form.gender}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gender: e.target.value }))
                }
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={lb}>Description</label>
              <textarea
                className="uv-inp"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Tell clients about yourself and your work…"
                rows={3}
                style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>
          </div>

          <button
            style={primaryBtn(saving)}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving to database…" : "Save Profile"}
          </button>
        </>
      )}

      {/* ── SAVED ── */}
      {step === "saved" && (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              background: "rgba(200,241,53,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c8f135"
              strokeWidth="2"
              style={{ width: 28, height: 28 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 20,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Profile saved!
          </div>
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 24,
            }}
          >
            Your skills and details are now visible to clients. Check your
            Portfolio tab to see your profile.
          </p>
          <button
            style={{ ...primaryBtn(), width: "auto", padding: "12px 28px" }}
            onClick={reset}
          >
            Upload Another Video
          </button>
        </div>
      )}
    </div>
  );
}
