// src/pages/worker/PortfolioPage.jsx
import { useState, useEffect, useContext, useRef } from "react";
import api from "../../services/api.services.js";
import { useWorker } from "../../context/WorkerContext.jsx";
import { LanguageContext } from "../../context/LanguageContext.jsx";

const CATEGORIES = ["electrician", "plumber", "cleaner", "cook", "tailor"];
const ALL_LANGUAGES = [
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
];

// ── Voice → English translation ───────────────────────────────
// Uses Web Speech API to transcribe, then sends to backend for translation
async function transcribeAndTranslate(transcript, targetLang = "en") {
  if (!transcript) return "";
  try {
    const res = await api.post("/auth/translate", {
      text: transcript,
      targetLang,
    });
    return res.data.translated || transcript;
  } catch {
    return transcript; // fallback: return as-is
  }
}

function useVoiceToEnglish(onResult, mode = "text") {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const start = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported. Please use Chrome.");
      return;
    }

    const rec = new SR();
    recRef.current = rec;
    rec.lang = "en-US"; // browser handles multilingual input
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = async (e) => {
      const raw = e.results[0][0].transcript;
      // Translate to English regardless of spoken language
      const english = await transcribeAndTranslate(raw, "en");
      onResult(english, raw);
    };
    rec.start();
  };

  const stop = () => {
    recRef.current?.stop();
    setListening(false);
  };
  return { listening, start, stop };
}

export default function PortfolioPage() {
  const { portfolio, loading, refreshPortfolio, user } = useWorker();
  const { t } = useContext(LanguageContext);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [newSkill, setNewSkill] = useState("");

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
    languagesKnown: [],
  });

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
        description: portfolio.description || "",
        skills: portfolio.skills || [],
        category: portfolio.category || "",
        videoUrl: portfolio.videoUrl || "",
        languagesKnown: portfolio.languagesKnown || [],
      });
    } else if (user) {
      setForm((p) => ({
        ...p,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [portfolio, user]);

  // Voice for "About You" — translates to English
  const {
    listening: voiceAbout,
    start: startAbout,
    stop: stopAbout,
  } = useVoiceToEnglish((english) =>
    setForm((p) => ({
      ...p,
      description: p.description ? p.description + " " + english : english,
    })),
  );

  // Voice for Skills — translates to English and adds as skill
  const { listening: voiceSkill, start: startSkillVoice } = useVoiceToEnglish(
    (english, raw) => {
      // Each word/phrase becomes a skill
      const words = english.split(/[,،、]/); // split by comma (any language)
      words.forEach((w) => {
        const s = w.trim();
        if (s && s.length > 1) {
          setForm((p) => ({
            ...p,
            skills: p.skills.includes(s) ? p.skills : [...p.skills, s],
          }));
        }
      });
    },
  );

  const validate = () => {
    const e = {};
    if (!form.category) e.category = "Select your category";
    if (!form.name?.trim()) e.name = "Full name required";
    if (!form.contact?.trim()) e.contact = "Contact number required";
    if (!form.experience?.trim()) e.experience = "Experience required";
    if (!form.pricing?.trim()) e.pricing = "Pricing required";
    if (!form.gender) e.gender = "Gender required";
    if (form.skills.length === 0) e.skills = "Add at least one skill";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSaved(false);
    try {
      await api.post("/portfolios", {
        name: form.name,
        age: form.age ? Number(form.age) : undefined,
        gender: form.gender || undefined,
        email: form.email || undefined,
        contact: form.contact,
        experience: form.experience,
        pricing: form.pricing,
        description: form.description || undefined,
        skills: form.skills,
        category: form.category,
        videoUrl: form.videoUrl || undefined,
        languagesKnown: form.languagesKnown,
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

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !form.skills.includes(s))
      setForm((p) => ({ ...p, skills: [...p.skills, s] }));
    setNewSkill("");
  };
  const removeSkill = (s) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
  const toggleLang = (lang) =>
    setForm((p) => ({
      ...p,
      languagesKnown: p.languagesKnown.includes(lang)
        ? p.languagesKnown.filter((l) => l !== lang)
        : [...p.languagesKnown, lang],
    }));

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
  };
  const errSt = { fontSize: 12, color: "#f87171", marginTop: 4 };
  const req = <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>;

  const voiceBtn = (active, onStart, onStop, label) => (
    <button
      onClick={active ? onStop : onStart}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 20,
        border: `1.5px solid ${active ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)"}`,
        background: active ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
        color: active ? "#f87171" : "rgba(255,255,255,0.5)",
        fontFamily: "'Manrope',sans-serif",
        fontSize: 12.5,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      {active ? (
        <>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#f87171",
              animation: "pulse 1s infinite",
            }}
          />{" "}
          Stop
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ width: 13, height: 13 }}
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>{" "}
          {label}
        </>
      )}
    </button>
  );

  if (loading)
    return (
      <div
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, padding: 24 }}
      >
        Loading portfolio…
      </div>
    );

  return (
    <div style={{ maxWidth: 680 }}>
      <style>{`
        .pp-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.09)!important;}
        .pp-cat:hover,.pp-lang-pill:hover{border-color:rgba(255,255,255,0.3)!important;}
        .pp-err{border-color:#f87171!important;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>

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
          Your public profile shown to clients. Fields marked * are required.
        </p>
      </div>

      {!portfolio && (
        <div
          style={{
            ...card,
            borderColor: "rgba(251,191,36,0.2)",
            background: "rgba(251,191,36,0.04)",
            marginBottom: 16,
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>💡</span>
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
                Upload a video to auto-fill your profile, or fill manually
                below.
              </div>
            </div>
          </div>
        </div>
      )}

      {form.videoUrl && (
        <div style={card}>
          <label style={lb}>Your Video</label>
          <video
            src={form.videoUrl}
            controls
            style={{
              width: "100%",
              borderRadius: 10,
              maxHeight: 200,
              background: "#000",
            }}
          />
        </div>
      )}

      {/* Category */}
      <div style={card}>
        <label style={lb}>Worker Category {req}</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className="pp-cat"
              onClick={() => {
                setForm((p) => ({ ...p, category: cat }));
                setErrors((e) => ({ ...e, category: undefined }));
              }}
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
        {errors.category && <div style={errSt}>{errors.category}</div>}
      </div>

      {/* About You — voice to English */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <label style={{ ...lb, marginBottom: 0 }}>About You</label>
          <div style={{ display: "flex", gap: 8 }}>
            {voiceBtn(
              voiceAbout,
              startAbout,
              stopAbout,
              "Speak (any language → English)",
            )}
          </div>
        </div>
        {voiceAbout && (
          <div
            style={{
              fontSize: 12,
              color: "#f87171",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#f87171",
                animation: "pulse 1s infinite",
              }}
            />
            Listening… speak in any language — will be translated to English
            automatically
          </div>
        )}
        <textarea
          className="pp-inp"
          placeholder="Describe your skills and experience… or use the voice button to speak in any language."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={4}
          style={{ ...inp, resize: "vertical", lineHeight: 1.65 }}
        />
      </div>

      {/* Skills — with voice */}
      <div style={card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <label style={{ ...lb, marginBottom: 0 }}>Skills {req}</label>
          {voiceBtn(voiceSkill, startSkillVoice, () => {}, "Say skill names")}
        </div>
        {voiceSkill && (
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>
            🎤 Say skill names separated by commas — e.g. "Stitching,
            Embroidery, Blouse making"
          </div>
        )}
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
            className={`pp-inp ${errors.skills ? "pp-err" : ""}`}
            placeholder="Type a skill and press Enter…"
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
        {errors.skills && <div style={errSt}>{errors.skills}</div>}
      </div>

      {/* Languages Known */}
      <div style={card}>
        <label style={lb}>Languages Known</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_LANGUAGES.map((lang) => (
            <button
              key={lang}
              className="pp-lang-pill"
              onClick={() => toggleLang(lang)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: form.languagesKnown.includes(lang)
                  ? "1.5px solid #c8f135"
                  : "1.5px solid rgba(255,255,255,0.12)",
                background: form.languagesKnown.includes(lang)
                  ? "rgba(200,241,53,0.1)"
                  : "rgba(255,255,255,0.04)",
                color: form.languagesKnown.includes(lang)
                  ? "#c8f135"
                  : "rgba(255,255,255,0.45)",
                fontFamily: "'Manrope',sans-serif",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Personal Details */}
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
          Personal Details
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          {[
            {
              label: "Full Name",
              field: "name",
              type: "text",
              r: true,
              ro: false,
            },
            { label: "Age", field: "age", type: "number", r: false, ro: false },
            {
              label: "Email",
              field: "email",
              type: "email",
              r: true,
              ro: true,
            },
            {
              label: "Contact No.",
              field: "contact",
              type: "tel",
              r: true,
              ro: false,
            },
            {
              label: "Experience",
              field: "experience",
              type: "text",
              r: true,
              ro: false,
            },
            {
              label: "Pricing",
              field: "pricing",
              type: "text",
              r: true,
              ro: false,
            },
          ].map(({ label, field, type, r, ro }) => (
            <div key={field}>
              <label style={lb}>
                {label}
                {r && (
                  <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>
                )}
              </label>
              <input
                className={`pp-inp ${errors[field] ? "pp-err" : ""}`}
                type={type}
                value={form[field]}
                readOnly={ro}
                onChange={(e) => {
                  if (ro) return;
                  setForm((p) => ({ ...p, [field]: e.target.value }));
                  setErrors((e2) => ({ ...e2, [field]: undefined }));
                }}
                style={{
                  ...inp,
                  background: ro ? "rgba(255,255,255,0.03)" : inp.background,
                  cursor: ro ? "not-allowed" : "text",
                }}
                placeholder={ro ? "(from your account)" : label}
              />
              {errors[field] && <div style={errSt}>{errors[field]}</div>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={lb}>Gender {req}</label>
          <select
            className={`pp-inp ${errors.gender ? "pp-err" : ""}`}
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
          {errors.gender && <div style={errSt}>{errors.gender}</div>}
        </div>
      </div>

      {/* Reviews — read only, from clients */}
      {portfolio?.reviews?.length > 0 && (
        <div style={card}>
          <label style={{ ...lb, marginBottom: 16 }}>
            Client Reviews ({portfolio.reviews.length})
          </label>
          {portfolio.reviews.map((r, i) => (
            <div
              key={i}
              style={{
                padding: "14px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 12,
                marginBottom: 10,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {r.clientName || "Client"}
                </span>
                <span style={{ color: "#fbbf24", fontSize: 14 }}>
                  {"★".repeat(r.rating)}
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>
                    {"★".repeat(5 - r.rating)}
                  </span>
                </span>
              </div>
              {r.comment && (
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {r.comment}
                </p>
              )}
              <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                {r.jobQuality && (
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                  >
                    Quality: {r.jobQuality}/5
                  </span>
                )}
                {r.timeliness && (
                  <span
                    style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}
                  >
                    Time: {r.timeliness}/5
                  </span>
                )}
                {r.wouldRecommend !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      color: r.wouldRecommend ? "#4ade80" : "#f87171",
                    }}
                  >
                    {r.wouldRecommend
                      ? "👍 Recommends"
                      : "👎 Doesn't recommend"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Save */}
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
          {saving && (
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
          )}
          {saving ? "Saving…" : t("save") || "Save Portfolio"}
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
    </div>
  );
}
