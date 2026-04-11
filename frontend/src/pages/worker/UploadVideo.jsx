// src/pages/worker/UploadVideo.jsx
import { useState } from "react";
import axios from "axios";
import { useWorker } from "../../context/WorkerContext.jsx";

export default function UploadVideo() {
  const { refreshPortfolio } = useWorker();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState("idle"); // idle | uploading | done
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    contact: "",
    experience: "",
    pricing: "",
    skills: [],
  });
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  };
  const label = {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.45)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    display: "block",
    marginBottom: 6,
  };
  const input = {
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
  const btn = (color = "#c8f135", text = "#0d0d0d") => ({
    padding: "11px 24px",
    background: color,
    color: text,
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'Manrope',sans-serif",
    transition: "opacity 0.15s",
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStep("uploading");
    const data = new FormData();
    data.append("video", file);
    try {
      const res = await axios.post("/api/video/upload", data);
      const { auto_fill, portfolio } = res.data;
      setForm({
        name: auto_fill?.name || "",
        age: auto_fill?.age || "",
        gender: auto_fill?.gender || "",
        email: "",
        contact: "",
        experience: auto_fill?.experience || "",
        pricing: "",
        skills: portfolio?.skills || [],
      });
      setStep("done");
    } catch (err) {
      alert("Upload failed: " + (err.response?.data?.message || err.message));
      setStep("idle");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("/api/portfolio/update", form);
      await refreshPortfolio();
      setSaved(true);
    } catch (err) {
      alert("Save failed: " + err.message);
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

  const STEPS = [
    "Uploading to Cloudinary",
    "Extracting frames",
    "Detecting skills (BLIP)",
    "Transcribing speech (Whisper)",
    "Saving to database",
  ];
  const [stepIdx] = useState(0);

  return (
    <div style={{ maxWidth: 600 }}>
      <h2
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 6,
          marginTop: 0,
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

      {step === "idle" && (
        <div style={card}>
          <label style={label}>Select video file</label>
          <div
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
            onMouseOver={(e) =>
              (e.currentTarget.style.borderColor = "rgba(200,241,53,0.4)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              style={{ width: 40, height: 40, margin: "0 auto 12px" }}
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
            style={{ ...btn(), opacity: file ? 1 : 0.4, width: "100%" }}
            disabled={!file}
            onClick={handleUpload}
          >
            Upload & Analyse
          </button>
        </div>
      )}

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
                  background:
                    i <= stepIdx ? "#c8f135" : "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {i <= stepIdx ? (
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
                      background: "rgba(255,255,255,0.2)",
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: i <= stepIdx ? "#fff" : "rgba(255,255,255,0.3)",
                }}
              >
                {s}
              </span>
              {i === stepIdx + 1 && (
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    border: "2px solid #c8f135",
                    borderTopColor: "transparent",
                    animation: "spin 0.8s linear infinite",
                    marginLeft: "auto",
                  }}
                />
              )}
            </div>
          ))}
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {step === "done" && !saved && (
        <>
          <div style={{ ...card, borderColor: "rgba(200,241,53,0.2)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
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
                Video analysed — review and save your profile
              </span>
            </div>

            {/* Skills */}
            <label style={label}>
              Detected Skills{" "}
              <span
                style={{
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "none",
                  fontSize: 11,
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
                marginBottom: 16,
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
                      opacity: 0.7,
                    }}
                  >
                    ×
                  </span>
                </span>
              ))}
              <div style={{ display: "flex", gap: 4 }}>
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Add skill…"
                  style={{
                    ...input,
                    width: 120,
                    padding: "5px 10px",
                    fontSize: 12,
                    borderRadius: 20,
                  }}
                />
                <button
                  onClick={addSkill}
                  style={{
                    ...btn("rgba(255,255,255,0.1)", "#fff"),
                    padding: "5px 12px",
                    fontSize: 12,
                    borderRadius: 20,
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
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {[
                { label: "Full Name", field: "name", type: "text" },
                { label: "Age", field: "age", type: "number" },
                { label: "Email", field: "email", type: "email" },
                { label: "Contact No.", field: "contact", type: "tel" },
                { label: "Experience", field: "experience", type: "text" },
                { label: "Pricing", field: "pricing", type: "text" },
              ].map(({ label: lb, field, type }) => (
                <div key={field}>
                  <label style={label}>{lb}</label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, [field]: e.target.value }))
                    }
                    style={input}
                    placeholder={lb}
                  />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={label}>Gender</label>
              <select
                value={form.gender}
                onChange={(e) =>
                  setForm((p) => ({ ...p, gender: e.target.value }))
                }
                style={{ ...input, cursor: "pointer" }}
              >
                <option value="">Select gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <button
            style={{ ...btn(), width: "100%", padding: "14px" }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </>
      )}

      {saved && (
        <div style={{ ...card, textAlign: "center", padding: "48px 24px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(200,241,53,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
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
            Your skills and details have been updated.
          </p>
          <button
            style={btn()}
            onClick={() => {
              setStep("idle");
              setSaved(false);
              setFile(null);
            }}
          >
            Upload Another Video
          </button>
        </div>
      )}
    </div>
  );
}
