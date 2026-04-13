// src/pages/worker/UploadVideo.jsx
import { useState } from "react";
import api from "../../services/api.services.js";
import { useWorker } from "../../context/WorkerContext.jsx";

const CATEGORIES = ["electrician", "plumber", "cleaner", "cook", "tailor"];

// BLIP outputs like "a person is using X" — strip these, keep only skill keywords
function isUselessDescription(text) {
  if (!text) return true;
  const bad = [
    "a person",
    "a man",
    "a woman",
    "someone is",
    "person is",
    "man is",
    "woman is",
    "using a",
    "holding a",
    "standing near",
  ];
  const lower = text.toLowerCase();
  return bad.some((b) => lower.includes(b));
}

export default function UploadVideo() {
  const { refreshPortfolio, user } = useWorker();

  const [file, setFile] = useState(null);
  const [step, setStep] = useState("idle"); // idle | uploading | done | saved
  const [stepIdx, setStepIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState("");

  // Form — email pre-filled from logged-in user
  const [form, setForm] = useState({
    name: user?.name || "",
    age: "",
    gender: "",
    email: user?.email || "",
    contact: "",
    experience: "",
    pricing: "",
    skills: [],
    category: "",
    videoUrl: "",
  });

  const STEPS = [
    "Uploading to Cloudinary",
    "Extracting frames",
    "Detecting skills (BLIP)",
    "Transcribing speech (Whisper)",
    "Saving to database",
  ];

  // ── Validation ────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.category) e.category = "Please select your category";
    if (!form.name?.trim()) e.name = "Full name is required";
    if (!form.contact?.trim()) e.contact = "Contact number is required";
    if (!form.experience?.trim()) e.experience = "Experience is required";
    if (!form.pricing?.trim()) e.pricing = "Pricing is required";
    if (!form.gender) e.gender = "Gender is required";
    if (form.skills.length === 0) e.skills = "Add at least one skill";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Upload ────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStep("uploading");
    setStepIdx(0);

    const data = new FormData();
    data.append("video", file);

    const interval = setInterval(() => {
      setStepIdx((p) => (p < STEPS.length - 2 ? p + 1 : p));
    }, 2500);

    try {
      const res = await api.post("/video/upload", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      clearInterval(interval);
      setStepIdx(STEPS.length - 1);

      const { auto_fill = {}, portfolio: p = {} } = res.data;

      setForm((prev) => ({
        ...prev,
        name: auto_fill.name || user?.name || prev.name,
        age: auto_fill.age || prev.age,
        gender: auto_fill.gender || prev.gender,
        email: user?.email || prev.email, // always use logged-in email
        contact: auto_fill.contact || prev.contact,
        experience: auto_fill.experience || prev.experience,
        pricing: auto_fill.pricing || prev.pricing,
        // Filter out garbage BLIP skill outputs
        skills: (p.skills || auto_fill.skills || []).filter(
          (s) => s && s.trim().length > 1 && !isUselessDescription(s),
        ),
        videoUrl: p.videoUrl || "",
        // NOTE: description intentionally NOT pulled from BLIP
        // User fills it manually in Portfolio page with voice/text
      }));

      setTimeout(() => setStep("done"), 400);
    } catch (err) {
      clearInterval(interval);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
      setStep("idle");
    } finally {
      setUploading(false);
    }
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.post("/portfolios", {
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender,
        email: form.email,
        contact: form.contact,
        experience: form.experience,
        pricing: form.pricing,
        skills: form.skills,
        category: form.category,
        videoUrl: form.videoUrl || undefined,
      });
      // Force refresh so PortfolioPage shows updated data immediately
      await refreshPortfolio();
      setStep("saved");
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s))
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  };
  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  const reset = () => {
    setStep("idle");
    setFile(null);
    setStepIdx(0);
  };

  // ── Shared styles ─────────────────────────────────────────
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
  const errStyle = { fontSize: 12, color: "#f87171", marginTop: 4 };
  const reqStar = <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>;

  return (
    <div style={{ maxWidth: 620 }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .uv-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.1)!important;}
        .uv-drop:hover{border-color:rgba(200,241,53,0.45)!important;}
        .uv-cat:hover{border-color:rgba(255,255,255,0.25)!important;}
        .uv-err{border-color:#f87171!important;}
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
        Upload a video of your work. Skills will be auto-detected and your
        profile pre-filled.
      </p>

      {/* ── IDLE ── */}
      {step === "idle" && (
        <div style={card}>
          <label style={lb}>Select video file</label>
          <div
            className="uv-drop"
            onClick={() => document.getElementById("uv-file").click()}
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
            id="uv-file"
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            disabled={!file}
            onClick={handleUpload}
            style={{
              width: "100%",
              padding: "13px",
              background: file ? "#c8f135" : "rgba(200,241,53,0.4)",
              color: "#0d0d0d",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: file ? "pointer" : "not-allowed",
              fontFamily: "'Manrope',sans-serif",
            }}
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

      {/* ── DONE: review form ── */}
      {step === "done" && (
        <>
          {/* Category — required */}
          <div style={{ ...card, borderColor: "rgba(200,241,53,0.15)" }}>
            <label style={lb}>Your Category {reqStar}</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: errors.category ? 4 : 0,
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="uv-cat"
                  onClick={() => {
                    setForm((p) => ({ ...p, category: cat }));
                    setErrors((e) => ({ ...e, category: undefined }));
                  }}
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
            {errors.category && <div style={errStyle}>{errors.category}</div>}

            {/* Skills */}
            <label style={{ ...lb, marginTop: 18 }}>
              Detected Skills {reqStar}
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
              <div style={{ display: "flex", gap: 6 }}>
                <input
                  className="uv-inp"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add skill…"
                  style={{
                    ...inp,
                    width: 130,
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
            {errors.skills && <div style={errStyle}>{errors.skills}</div>}
          </div>

          {/* Profile fields */}
          <div style={card}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
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
                { label: "Age", field: "age", type: "number", required: false },
                {
                  label: "Email",
                  field: "email",
                  type: "email",
                  readOnly: true,
                },
                { label: "Contact No.", field: "contact", type: "tel" },
                { label: "Experience", field: "experience", type: "text" },
                { label: "Pricing", field: "pricing", type: "text" },
              ].map(
                ({ label, field, type, required = true, readOnly = false }) => (
                  <div key={field}>
                    <label style={lb}>
                      {label}
                      {required && reqStar}
                    </label>
                    <input
                      className={`uv-inp ${errors[field] ? "uv-err" : ""}`}
                      type={type}
                      value={form[field]}
                      readOnly={readOnly}
                      onChange={(e) => {
                        if (readOnly) return;
                        setForm((p) => ({ ...p, [field]: e.target.value }));
                        setErrors((e2) => ({ ...e2, [field]: undefined }));
                      }}
                      style={{
                        ...inp,
                        background: readOnly
                          ? "rgba(255,255,255,0.03)"
                          : inp.background,
                        cursor: readOnly ? "not-allowed" : "text",
                      }}
                      placeholder={readOnly ? "(from your account)" : label}
                    />
                    {errors[field] && (
                      <div style={errStyle}>{errors[field]}</div>
                    )}
                  </div>
                ),
              )}
            </div>
            <div style={{ marginTop: 14 }}>
              <label style={lb}>Gender {reqStar}</label>
              <select
                className={`uv-inp ${errors.gender ? "uv-err" : ""}`}
                value={form.gender}
                onChange={(e) => {
                  setForm((p) => ({ ...p, gender: e.target.value }));
                  setErrors((e2) => ({ ...e2, gender: undefined }));
                }}
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              {errors.gender && <div style={errStyle}>{errors.gender}</div>}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "14px",
              background: saving ? "rgba(200,241,53,0.5)" : "#c8f135",
              color: "#0d0d0d",
              border: "none",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "'Manrope',sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {saving && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  border: "2px solid rgba(0,0,0,0.2)",
                  borderTopColor: "#0d0d0d",
                  animation: "spin 0.7s linear infinite",
                }}
              />
            )}
            {saving ? "Saving to portfolio…" : "Save Profile"}
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
            Your skills and details are now live. View your Portfolio tab to see
            how clients see you.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#c8f135",
              color: "#0d0d0d",
              border: "none",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 13.5,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            Upload Another Video
          </button>
        </div>
      )}
    </div>
  );
}
