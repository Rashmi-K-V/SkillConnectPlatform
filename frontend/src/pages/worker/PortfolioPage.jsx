import { useState, useEffect, useContext, useRef } from "react";
import api from "../../services/api.services.js";
import { useWorker } from "../../context/WorkerContext.jsx";
import { LanguageContext } from "../../context/LanguageContext.jsx";
import { CATEGORY_DATA, ALL_CATEGORIES } from "../../data/categoryData.js";

const ALL_LANGUAGES = [
  "English",
  "Hindi",
  "Kannada",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
];

// ── Category list: "tailor" replaced with "steam_ironing" ──────────────────
// Make sure your categoryData.js has an entry for "steam_ironing"
// with icon, label, and workTypes. See note at bottom of this file.
const DISPLAY_CATEGORIES = ALL_CATEGORIES.map((c) =>
  c === "tailor" ? "steam_ironing" : c,
);

function isBlipDescription(text) {
  if (!text || text.trim().length < 15) return true;
  var blipPhrases = [
    "a person is",
    "a man is",
    "a woman is",
    "indian girl",
    "girl in shorts",
    "playing with a toy",
    "standing in the middle",
    "person using",
    "person holding",
    "someone is",
    "man is using",
    "woman is using",
    "striped shirt",
    "standing near",
    "wearing a",
    "looking at",
    "sitting on",
    "holding a",
    "using a phone",
    "a boy is",
    "a girl is",
    "painting a wall",
    "working on a circuit",
    "man in a yellow shirt",
    "man working on",
    "a person ironing",
    "person pressing clothes",
  ];
  return blipPhrases.some(function (b) {
    return text.toLowerCase().includes(b);
  });
}

async function translateToEnglish(text) {
  try {
    var res = await api.post("/auth/translate", { text, targetLang: "en" });
    return res.data.translated || text;
  } catch {
    return text;
  }
}

var ALL_NUMBERS = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
  hundred: 100,
  thousand: 1000,
  "two hundred": 200,
  "five hundred": 500,
  "two thousand": 2000,
  "five thousand": 5000,
  ondu: 1,
  eradu: 2,
  mooru: 3,
  naalku: 4,
  aidu: 5,
  aaru: 6,
  yelu: 7,
  entu: 8,
  ombattu: 9,
  hattu: 10,
  saavira: 1000,
  "aidu nooru": 500,
  "eradu nooru": 200,
  do: 2,
  teen: 3,
  chaar: 4,
  paanch: 5,
  che: 6,
  saat: 7,
  aath: 8,
  nau: 9,
  das: 10,
  bees: 20,
  tees: 30,
  chaalees: 40,
  pachaas: 50,
  sattar: 70,
  assi: 80,
  navve: 90,
  sau: 100,
  hazaar: 1000,
  "do sau": 200,
  "paanch sau": 500,
  okati: 1,
  rendu: 2,
  moodu: 3,
  naalugu: 4,
  edu: 7,
  enimidi: 8,
  tommidi: 9,
  padi: 10,
  veyyi: 1000,
  onnu: 1,
  moonu: 3,
  naalu: 4,
  anju: 5,
  ezhu: 7,
  ettu: 8,
  onbadu: 9,
  pathu: 10,
  aayiram: 1000,
  randu: 2,
  anchu: 5,
  onpathu: 9,
  ek_mr: 1,
  don: 2,
  paach: 5,
  saha: 6,
  daha: 10,
  vis: 20,
  chaalis: 40,
  pannaas: 50,
  ainshi: 80,
  shambhar: 100,
  "don shambhar": 200,
  "paach shambhar": 500,
};

function parseIndianNumbers(text) {
  var result = text.toLowerCase();
  var entries = Object.entries(ALL_NUMBERS).sort(function (a, b) {
    return b[0].length - a[0].length;
  });
  entries.forEach(function (entry) {
    result = result.replace(
      new RegExp("\\b" + entry[0] + "\\b", "gi"),
      entry[1].toString(),
    );
  });
  return result;
}

function useVoiceInput(onResult, parseNumbers) {
  var [listening, setListening] = useState(false);
  var recRef = useRef(null);
  var start = function () {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition requires Chrome browser.");
      return;
    }
    var rec = new SR();
    recRef.current = rec;
    rec.lang = "";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = function () {
      setListening(true);
    };
    rec.onend = function () {
      setListening(false);
    };
    rec.onerror = function () {
      setListening(false);
    };
    rec.onresult = async function (e) {
      var raw = e.results[0][0].transcript;
      var processed = parseNumbers ? parseIndianNumbers(raw) : raw;
      var english = await translateToEnglish(processed);
      onResult(english, raw);
    };
    rec.start();
  };
  var stop = function () {
    if (recRef.current) recRef.current.stop();
    setListening(false);
  };
  return { listening, start, stop };
}

export default function PortfolioPage() {
  var { portfolio, loading, refreshPortfolio, user } = useWorker();
  var { t } = useContext(LanguageContext);

  var [saving, setSaving] = useState(false);
  var [saved, setSaved] = useState(false);
  var [errors, setErrors] = useState({});
  var [newSkill, setNewSkill] = useState("");

  // Normalize category: map "tailor" → "steam_ironing" for display
  function normalizeCategory(cat) {
    if (!cat) return "";
    return cat === "tailor" ? "steam_ironing" : cat;
  }

  var [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    email: "",
    contact: "",
    experience: "",
    description: "",
    skills: [],
    // Pre-fill category from user registration immediately
    category: normalizeCategory(user?.category) || "",
    videoUrl: "",
    languagesKnown: [],
    selectedWorkTypes: [],
    priceMin: "",
    priceMax: "",
  });

  useEffect(
    function () {
      // Always prefer live user data for name/email
      // portfolio data fills in the rest
      var cat = normalizeCategory(portfolio?.category || user?.category || "");

      if (portfolio) {
        setForm({
          name: user?.name || portfolio.name || "",
          age: portfolio.age || "",
          gender: portfolio.gender || "",
          email: user?.email || portfolio.email || "",
          contact: portfolio.contact || "",
          experience: portfolio.experience || "",
          description: isBlipDescription(portfolio.description)
            ? ""
            : portfolio.description || "",
          skills: portfolio.skills || [],
          category: cat,
          videoUrl: portfolio.videoUrl || "",
          languagesKnown: portfolio.languagesKnown || [],
          selectedWorkTypes: portfolio.selectedWorkTypes || [],
          priceMin: portfolio.priceMin || "",
          priceMax: portfolio.priceMax || "",
        });
      } else if (user) {
        setForm(function (p) {
          return {
            ...p,
            name: user.name || "",
            email: user.email || "",
            category: cat,
          };
        });
      }
    },
    [portfolio, user],
  );

  var voiceAbout = useVoiceInput(function (english) {
    setForm(function (p) {
      return {
        ...p,
        description: p.description ? p.description + " " + english : english,
      };
    });
  }, false);

  var voiceSkill = useVoiceInput(function (english) {
    var words = english.split(/[,،、]/);
    setForm(function (p) {
      var newSkills = [...p.skills];
      words.forEach(function (w) {
        var s = w.trim();
        if (s && s.length > 1 && !newSkills.includes(s)) newSkills.push(s);
      });
      return { ...p, skills: newSkills };
    });
  }, false);

  var voicePriceMin = useVoiceInput(function (english) {
    var nums = english.match(/\d+/g);
    if (nums && nums.length > 0)
      setForm(function (p) {
        return { ...p, priceMin: nums[0] };
      });
  }, true);

  var voicePriceMax = useVoiceInput(function (english) {
    var nums = english.match(/\d+/g);
    if (nums && nums.length > 0)
      setForm(function (p) {
        return { ...p, priceMax: nums[0] };
      });
  }, true);

  var catData = CATEGORY_DATA[form.category] || null;

  var validate = function () {
    var e = {};
    if (!form.category) e.category = "Select your category";
    if (!form.name?.trim()) e.name = "Full name required";
    if (!form.contact?.trim()) e.contact = "Contact number required";
    if (!form.experience?.trim()) e.experience = "Experience required";
    if (form.skills.length === 0) e.skills = "Add at least one skill";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  var handleSave = async function () {
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
        description: form.description?.trim() || undefined,
        skills: form.skills,
        category: form.category || undefined,
        videoUrl: form.videoUrl || undefined,
        languagesKnown: form.languagesKnown,
        selectedWorkTypes: form.selectedWorkTypes,
        priceMin: form.priceMin ? Number(form.priceMin) : undefined,
        priceMax: form.priceMax ? Number(form.priceMax) : undefined,
      });
      await refreshPortfolio();
      setSaved(true);
      setTimeout(function () {
        setSaved(false);
      }, 3000);
    } catch (err) {
      alert("Error saving: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  var addSkill = function () {
    var s = newSkill.trim();
    if (s && !form.skills.includes(s))
      setForm(function (p) {
        return { ...p, skills: [...p.skills, s] };
      });
    setNewSkill("");
  };
  var removeSkill = function (s) {
    setForm(function (p) {
      return {
        ...p,
        skills: p.skills.filter(function (x) {
          return x !== s;
        }),
      };
    });
  };
  var toggleLang = function (lang) {
    setForm(function (p) {
      return {
        ...p,
        languagesKnown: p.languagesKnown.includes(lang)
          ? p.languagesKnown.filter(function (l) {
              return l !== lang;
            })
          : [...p.languagesKnown, lang],
      };
    });
  };
  var toggleWorkType = function (id) {
    setForm(function (p) {
      return {
        ...p,
        selectedWorkTypes: p.selectedWorkTypes.includes(id)
          ? p.selectedWorkTypes.filter(function (x) {
              return x !== id;
            })
          : [...p.selectedWorkTypes, id],
      };
    });
  };

  var card = {
    background: "#1a1a1a",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "22px 24px",
    marginBottom: 14,
  };
  var lb = {
    fontSize: 11,
    fontWeight: 600,
    color: "rgba(255,255,255,0.38)",
    textTransform: "uppercase",
    letterSpacing: "0.09em",
    display: "block",
    marginBottom: 7,
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
  var errSt = { fontSize: 12, color: "#f87171", marginTop: 4 };
  var req = <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>;

  function VoiceBtn(props) {
    var active = props.active;
    return (
      <button
        onClick={active ? props.onStop : props.onStart}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "5px 12px",
          borderRadius: 20,
          border:
            "1.5px solid " +
            (active ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.12)"),
          background: active ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.05)",
          color: active ? "#f87171" : "rgba(255,255,255,0.5)",
          fontFamily: "'Manrope',sans-serif",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {active ? (
          <>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#f87171",
                animation: "pulse 1s infinite",
              }}
            />
            Stop
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: 12, height: 12 }}
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
            </svg>
            {props.label}
          </>
        )}
      </button>
    );
  }

  if (loading)
    return (
      <div
        style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, padding: 24 }}
      >
        Loading portfolio…
      </div>
    );

  return (
    <div style={{ maxWidth: 700 }}>
      <style>{`
        .pp-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.09)!important;}
        .pp-cat:hover,.pp-lang-pill:hover,.pp-work-pill:hover{border-color:rgba(255,255,255,0.3)!important;}
        .pp-err{border-color:#f87171!important;}
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;}
        select option{background:#1e1e1e;color:#fff;}
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
          <label style={lb}>
            Your Video{" "}
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontWeight: 400,
                fontSize: 10,
                textTransform: "none",
              }}
            >
              (visible to you only)
            </span>
          </label>
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

      {/* ── Category — pre-selected from registration, read-only feel ── */}
      <div style={card}>
        <label style={lb}>
          Worker Category {req}
          <span
            style={{
              color: "rgba(200,241,53,0.6)",
              fontWeight: 400,
              marginLeft: 8,
              fontSize: 10,
              textTransform: "none",
            }}
          >
            (set during registration)
          </span>
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {DISPLAY_CATEGORIES.map(function (cat) {
            var cd = CATEGORY_DATA[cat];
            if (!cd) return null;
            return (
              <button
                key={cat}
                className="pp-cat"
                onClick={function () {
                  setForm(function (p) {
                    return { ...p, category: cat, selectedWorkTypes: [] };
                  });
                  setErrors(function (e) {
                    return { ...e, category: undefined };
                  });
                }}
                style={{
                  padding: "8px 18px",
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
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {cd.icon} {cd.label}
              </button>
            );
          })}
        </div>
        {errors.category && <div style={errSt}>{errors.category}</div>}
      </div>

      {/* Work Types + Pricing */}
      {catData && (
        <div style={card}>
          <label style={lb}>Services You Offer &amp; Pricing (₹)</label>
          <div
            style={{
              fontSize: 12.5,
              color: "rgba(255,255,255,0.35)",
              marginBottom: 14,
            }}
          >
            Select the services you provide. Set your own price below.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 20,
            }}
          >
            {catData.workTypes.map(function (wt) {
              return (
                <button
                  key={wt.id}
                  className="pp-work-pill"
                  onClick={function () {
                    toggleWorkType(wt.id);
                  }}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: form.selectedWorkTypes.includes(wt.id)
                      ? "1.5px solid #c8f135"
                      : "1.5px solid rgba(255,255,255,0.1)",
                    background: form.selectedWorkTypes.includes(wt.id)
                      ? "rgba(200,241,53,0.08)"
                      : "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "'Manrope',sans-serif",
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: form.selectedWorkTypes.includes(wt.id)
                        ? "#c8f135"
                        : "#fff",
                      marginBottom: 3,
                    }}
                  >
                    {wt.label}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    Suggested: ₹{wt.minPrice.toLocaleString()} – ₹
                    {wt.maxPrice.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.03)",
              borderRadius: 12,
              padding: "16px",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(255,255,255,0.5)",
                marginBottom: 12,
              }}
            >
              Set your own price range — clients will see this on your profile
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <label style={lb}>Min Price (₹)</label>
                  <VoiceBtn
                    active={voicePriceMin.listening}
                    onStart={voicePriceMin.start}
                    onStop={voicePriceMin.stop}
                    label="Speak"
                  />
                </div>
                {voicePriceMin.listening && (
                  <div
                    style={{ fontSize: 11, color: "#f87171", marginBottom: 4 }}
                  >
                    🎤 Say e.g. "nooru" (100)
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      pointerEvents: "none",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    className="pp-inp"
                    type="number"
                    value={form.priceMin}
                    onChange={function (e) {
                      setForm(function (p) {
                        return { ...p, priceMin: e.target.value };
                      });
                    }}
                    placeholder="e.g. 200"
                    style={{ ...inp, paddingLeft: 28 }}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <label style={lb}>Max Price (₹)</label>
                  <VoiceBtn
                    active={voicePriceMax.listening}
                    onStart={voicePriceMax.start}
                    onStop={voicePriceMax.stop}
                    label="Speak"
                  />
                </div>
                {voicePriceMax.listening && (
                  <div
                    style={{ fontSize: 11, color: "#f87171", marginBottom: 4 }}
                  >
                    🎤 Say e.g. "saavira" (1000)
                  </div>
                )}
                <div style={{ position: "relative" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: 13,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      pointerEvents: "none",
                    }}
                  >
                    ₹
                  </span>
                  <input
                    className="pp-inp"
                    type="number"
                    value={form.priceMax}
                    onChange={function (e) {
                      setForm(function (p) {
                        return { ...p, priceMax: e.target.value };
                      });
                    }}
                    placeholder="e.g. 2000"
                    style={{ ...inp, paddingLeft: 28 }}
                  />
                </div>
              </div>
            </div>
            {form.priceMin && form.priceMax && (
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  color: "#c8f135",
                  fontWeight: 600,
                }}
              >
                Clients will see: ₹{Number(form.priceMin).toLocaleString()} – ₹
                {Number(form.priceMax).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* About You */}
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
          <VoiceBtn
            active={voiceAbout.listening}
            onStart={voiceAbout.start}
            onStop={voiceAbout.stop}
            label="Speak (any language → English)"
          />
        </div>
        {voiceAbout.listening && (
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
            Listening… speak in any language
          </div>
        )}
        <textarea
          className="pp-inp"
          placeholder="Describe your skills and experience…"
          value={form.description}
          onChange={function (e) {
            setForm({ ...form, description: e.target.value });
          }}
          rows={4}
          style={{ ...inp, resize: "vertical", lineHeight: 1.65 }}
        />
      </div>

      {/* Skills */}
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
          <VoiceBtn
            active={voiceSkill.listening}
            onStart={voiceSkill.start}
            onStop={voiceSkill.stop}
            label="Say skill names"
          />
        </div>
        {voiceSkill.listening && (
          <div style={{ fontSize: 12, color: "#f87171", marginBottom: 8 }}>
            🎤 Say skill names separated by commas in any language
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
          {form.skills.map(function (sk) {
            return (
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
                  onClick={function () {
                    removeSkill(sk);
                  }}
                  style={{ cursor: "pointer", fontSize: 14, opacity: 0.6 }}
                >
                  ×
                </span>
              </span>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            className={"pp-inp" + (errors.skills ? " pp-err" : "")}
            placeholder="Type a skill and press Enter…"
            value={newSkill}
            onChange={function (e) {
              setNewSkill(e.target.value);
            }}
            onKeyDown={function (e) {
              if (e.key === "Enter") addSkill();
            }}
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
          {ALL_LANGUAGES.map(function (lang) {
            return (
              <button
                key={lang}
                className="pp-lang-pill"
                onClick={function () {
                  toggleLang(lang);
                }}
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
            );
          })}
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
          <div>
            <label style={lb}>Full Name {req}</label>
            <input
              className={"pp-inp" + (errors.name ? " pp-err" : "")}
              value={form.name}
              onChange={function (e) {
                setForm(function (p) {
                  return { ...p, name: e.target.value };
                });
                setErrors(function (e2) {
                  return { ...e2, name: undefined };
                });
              }}
              style={inp}
              placeholder="Full name"
            />
            {errors.name && <div style={errSt}>{errors.name}</div>}
          </div>
          <div>
            <label style={lb}>Age</label>
            <input
              className="pp-inp"
              type="number"
              value={form.age}
              onChange={function (e) {
                setForm(function (p) {
                  return { ...p, age: e.target.value };
                });
              }}
              style={inp}
              placeholder="e.g. 30"
              min="18"
              max="80"
            />
          </div>
          <div>
            <label style={lb}>Email</label>
            <input
              className="pp-inp"
              type="email"
              value={form.email}
              readOnly
              style={{
                ...inp,
                background: "rgba(255,255,255,0.03)",
                cursor: "not-allowed",
              }}
              placeholder="(from your account)"
            />
          </div>
          <div>
            <label style={lb}>Contact No. {req}</label>
            <input
              className={"pp-inp" + (errors.contact ? " pp-err" : "")}
              type="tel"
              value={form.contact}
              onChange={function (e) {
                setForm(function (p) {
                  return { ...p, contact: e.target.value };
                });
                setErrors(function (e2) {
                  return { ...e2, contact: undefined };
                });
              }}
              style={inp}
              placeholder="Phone number"
            />
            {errors.contact && <div style={errSt}>{errors.contact}</div>}
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lb}>Experience {req}</label>
            <input
              className={"pp-inp" + (errors.experience ? " pp-err" : "")}
              value={form.experience}
              onChange={function (e) {
                setForm(function (p) {
                  return { ...p, experience: e.target.value };
                });
                setErrors(function (e2) {
                  return { ...e2, experience: undefined };
                });
              }}
              style={inp}
              placeholder="e.g. 3 years"
            />
            {errors.experience && <div style={errSt}>{errors.experience}</div>}
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={lb}>Gender</label>
          <select
            className="pp-inp"
            value={form.gender}
            onChange={function (e) {
              setForm(function (p) {
                return { ...p, gender: e.target.value };
              });
            }}
            style={{
              ...inp,
              cursor: "pointer",
              color: "#fff",
              background: "#1e1e1e",
              appearance: "auto",
            }}
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Client Reviews */}
      {portfolio?.reviews?.length > 0 && (
        <div style={card}>
          <label style={{ ...lb, marginBottom: 16 }}>
            Client Reviews ({portfolio.reviews.length})
          </label>
          {portfolio.reviews.map(function (r, i) {
            return (
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
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}
                  >
                    {r.clientName || "Client"}
                  </span>
                  <span style={{ color: "#fbbf24" }}>
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
              </div>
            );
          })}
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
