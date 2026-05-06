// // src/pages/worker/UploadVideo.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../../services/api.services.js";
// import { useWorker } from "../../context/WorkerContext.jsx";

// const CATEGORIES = ["electrician", "plumber", "cleaner", "cook", "tailor"];

// function isUselessDescription(text) {
//   if (!text) return true;
//   const bad = [
//     "a person",
//     "a man",
//     "a woman",
//     "someone is",
//     "person is",
//     "man is",
//     "woman is",
//     "using a",
//     "holding a",
//     "standing near",
//   ];
//   return bad.some((b) => text.toLowerCase().includes(b));
// }

// export default function UploadVideo() {
//   const { refreshPortfolio, user, portfolio } = useWorker();
//   const navigate = useNavigate();

//   const [file, setFile] = useState(null);
//   const [step, setStep] = useState("idle"); // idle | uploading | done
//   const [stepIdx, setStepIdx] = useState(0);
//   const [uploading, setUploading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [newSkill, setNewSkill] = useState("");

//   const [form, setForm] = useState({
//     name: user?.name || "",
//     age: "",
//     gender: "",
//     email: user?.email || "",
//     contact: "",
//     experience: "",
//     pricing: "",
//     skills: [],
//     category: portfolio?.category || "", // pre-fill from registration
//     videoUrl: "",
//   });

//   const STEPS = [
//     "Uploading to Cloudinary",
//     "Extracting frames",
//     "Detecting skills (BLIP)",
//     "Transcribing speech (Whisper)",
//     "Saving to database",
//   ];

//   const validate = () => {
//     const e = {};
//     if (!form.category) e.category = "Please select your category";
//     if (!form.name?.trim()) e.name = "Full name is required";
//     if (!form.contact?.trim()) e.contact = "Contact number is required";
//     if (!form.experience?.trim()) e.experience = "Experience is required";
//     if (form.skills.length === 0) e.skills = "Add at least one skill";
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const handleUpload = async () => {
//     if (!file) return;
//     setUploading(true);
//     setStep("uploading");
//     setStepIdx(0);

//     const data = new FormData();
//     data.append("video", file);

//     const interval = setInterval(() => {
//       setStepIdx((p) => (p < STEPS.length - 2 ? p + 1 : p));
//     }, 2500);

//     try {
//       const res = await api.post("/video/upload", data, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       clearInterval(interval);
//       setStepIdx(STEPS.length - 1);

//       const { auto_fill = {}, portfolio: p = {} } = res.data;

//       setForm((prev) => ({
//         ...prev,
//         name: auto_fill.name || user?.name || prev.name,
//         age: auto_fill.age || prev.age,
//         gender: auto_fill.gender || prev.gender,
//         email: user?.email || prev.email,
//         contact: auto_fill.contact || prev.contact,
//         experience: auto_fill.experience || prev.experience,
//         pricing: auto_fill.pricing || prev.pricing,
//         // Filter BLIP garbage skills
//         skills: (p.skills || auto_fill.skills || []).filter(
//           (s) => s && s.trim().length > 1 && !isUselessDescription(s),
//         ),
//         videoUrl: p.videoUrl || "",
//         category: prev.category || p.category || "",
//         // Do NOT auto-fill description from BLIP
//       }));

//       setTimeout(() => setStep("done"), 400);
//     } catch (err) {
//       clearInterval(interval);
//       alert("Upload failed: " + (err.response?.data?.message || err.message));
//       setStep("idle");
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSave = async () => {
//     if (!validate()) return;
//     setSaving(true);
//     try {
//       await api.post("/portfolios", {
//         name: form.name,
//         age: form.age ? Number(form.age) : undefined,
//         gender: form.gender || undefined,
//         email: form.email || undefined,
//         contact: form.contact,
//         experience: form.experience,
//         pricing: form.pricing || undefined,
//         skills: form.skills,
//         category: form.category,
//         videoUrl: form.videoUrl || undefined,
//       });
//       await refreshPortfolio();
//       // ✅ Fix 1: Redirect to portfolio page after save instead of showing saved state
//       navigate("/worker/portfolio");
//     } catch (err) {
//       alert("Save failed: " + (err.response?.data?.message || err.message));
//     } finally {
//       setSaving(false);
//     }
//   };

//   const addSkill = () => {
//     const s = newSkill.trim();
//     if (s && !form.skills.includes(s))
//       setForm((p) => ({ ...p, skills: [...p.skills, s] }));
//     setNewSkill("");
//   };
//   const removeSkill = (s) =>
//     setForm((p) => ({ ...p, skills: p.skills.filter((x) => x !== s) }));
//   const reset = () => {
//     setStep("idle");
//     setFile(null);
//     setStepIdx(0);
//   };

//   const card = {
//     background: "#1a1a1a",
//     border: "1px solid rgba(255,255,255,0.07)",
//     borderRadius: 16,
//     padding: 24,
//     marginBottom: 16,
//   };
//   const lb = {
//     fontSize: 11,
//     fontWeight: 600,
//     color: "rgba(255,255,255,0.4)",
//     textTransform: "uppercase",
//     letterSpacing: "0.09em",
//     display: "block",
//     marginBottom: 6,
//   };
//   const inp = {
//     width: "100%",
//     background: "rgba(255,255,255,0.05)",
//     border: "1px solid rgba(255,255,255,0.1)",
//     borderRadius: 10,
//     padding: "10px 14px",
//     color: "#fff",
//     fontSize: 14,
//     fontFamily: "'Manrope',sans-serif",
//     outline: "none",
//     boxSizing: "border-box",
//     transition: "border-color 0.15s",
//   };
//   const errSt = { fontSize: 12, color: "#f87171", marginTop: 4 };
//   const req = <span style={{ color: "#f87171", marginLeft: 3 }}>*</span>;

//   return (
//     <div style={{ maxWidth: 620 }}>
//       <style>{`
//         @keyframes spin{to{transform:rotate(360deg)}}
//         .uv-inp:focus{border-color:#c8f135!important;box-shadow:0 0 0 3px rgba(200,241,53,0.1)!important;}
//         .uv-drop:hover{border-color:rgba(200,241,53,0.45)!important;}
//         .uv-cat:hover{border-color:rgba(255,255,255,0.25)!important;}
//         .uv-err{border-color:#f87171!important;}
//         input[type=number]::-webkit-outer-spin-button,
//         input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
//         input[type=number]{-moz-appearance:textfield;}
//         select option{background:#1e1e1e;color:#fff;}
//       `}</style>

//       <h2
//         style={{
//           fontFamily: "'Syne',sans-serif",
//           fontSize: 22,
//           fontWeight: 700,
//           color: "#fff",
//           margin: "0 0 6px",
//         }}
//       >
//         Upload Video
//       </h2>
//       <p
//         style={{
//           fontSize: 13,
//           color: "rgba(255,255,255,0.35)",
//           marginBottom: 24,
//         }}
//       >
//         Upload a video of your work. Skills will be auto-detected and your
//         profile pre-filled.
//       </p>

//       {/* ── IDLE ── */}
//       {step === "idle" && (
//         <div style={card}>
//           <label style={lb}>Select video file</label>
//           <div
//             className="uv-drop"
//             onClick={() => document.getElementById("uv-file").click()}
//             style={{
//               border: "2px dashed rgba(255,255,255,0.12)",
//               borderRadius: 12,
//               padding: "32px 20px",
//               textAlign: "center",
//               cursor: "pointer",
//               transition: "border-color 0.15s",
//               marginBottom: 16,
//             }}
//           >
//             <svg
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="rgba(255,255,255,0.3)"
//               strokeWidth="1.5"
//               style={{
//                 width: 40,
//                 height: 40,
//                 margin: "0 auto 12px",
//                 display: "block",
//               }}
//             >
//               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//               <polyline points="17 8 12 3 7 8" />
//               <line x1="12" y1="3" x2="12" y2="15" />
//             </svg>
//             {file ? (
//               <div style={{ color: "#c8f135", fontSize: 14, fontWeight: 600 }}>
//                 {file.name}
//               </div>
//             ) : (
//               <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
//                 Click to select a video (mp4, mov, avi)
//               </div>
//             )}
//           </div>
//           <input
//             id="uv-file"
//             type="file"
//             accept="video/*"
//             style={{ display: "none" }}
//             onChange={(e) => setFile(e.target.files[0])}
//           />
//           <button
//             disabled={!file}
//             onClick={handleUpload}
//             style={{
//               width: "100%",
//               padding: "13px",
//               background: file ? "#c8f135" : "rgba(200,241,53,0.4)",
//               color: "#0d0d0d",
//               border: "none",
//               borderRadius: 10,
//               fontSize: 14,
//               fontWeight: 700,
//               cursor: file ? "pointer" : "not-allowed",
//               fontFamily: "'Manrope',sans-serif",
//             }}
//           >
//             Upload &amp; Analyse
//           </button>
//         </div>
//       )}

//       {/* ── UPLOADING ── */}
//       {step === "uploading" && (
//         <div style={card}>
//           <div
//             style={{
//               fontSize: 15,
//               fontWeight: 600,
//               color: "#fff",
//               marginBottom: 20,
//             }}
//           >
//             Analysing your video…
//           </div>
//           {STEPS.map((s, i) => (
//             <div
//               key={s}
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 marginBottom: 14,
//               }}
//             >
//               <div
//                 style={{
//                   width: 24,
//                   height: 24,
//                   borderRadius: "50%",
//                   flexShrink: 0,
//                   background:
//                     i < stepIdx
//                       ? "#c8f135"
//                       : i === stepIdx
//                         ? "rgba(200,241,53,0.15)"
//                         : "rgba(255,255,255,0.07)",
//                   border: i === stepIdx ? "2px solid #c8f135" : "none",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 {i < stepIdx ? (
//                   <svg
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="#0d0d0d"
//                     strokeWidth="3"
//                     style={{ width: 12, height: 12 }}
//                   >
//                     <polyline points="20 6 9 17 4 12" />
//                   </svg>
//                 ) : (
//                   <div
//                     style={{
//                       width: 8,
//                       height: 8,
//                       borderRadius: "50%",
//                       background:
//                         i === stepIdx ? "#c8f135" : "rgba(255,255,255,0.2)",
//                     }}
//                   />
//                 )}
//               </div>
//               <span
//                 style={{
//                   fontSize: 13,
//                   color: i <= stepIdx ? "#fff" : "rgba(255,255,255,0.3)",
//                   flex: 1,
//                 }}
//               >
//                 {s}
//               </span>
//               {i === stepIdx && (
//                 <div
//                   style={{
//                     width: 14,
//                     height: 14,
//                     borderRadius: "50%",
//                     border: "2px solid #c8f135",
//                     borderTopColor: "transparent",
//                     animation: "spin 0.8s linear infinite",
//                   }}
//                 />
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── DONE: review & save ── */}
//       {step === "done" && (
//         <>
//           {/* Category — pre-filled from registration */}
//           <div style={{ ...card, borderColor: "rgba(200,241,53,0.15)" }}>
//             <label style={lb}>Your Category {req}</label>
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: 8,
//                 marginBottom: errors.category ? 4 : 0,
//               }}
//             >
//               {CATEGORIES.map((cat) => (
//                 <button
//                   key={cat}
//                   className="uv-cat"
//                   onClick={() => {
//                     setForm((p) => ({ ...p, category: cat }));
//                     setErrors((e) => ({ ...e, category: undefined }));
//                   }}
//                   style={{
//                     padding: "7px 16px",
//                     borderRadius: 20,
//                     border:
//                       form.category === cat
//                         ? "1.5px solid #c8f135"
//                         : "1.5px solid rgba(255,255,255,0.12)",
//                     background:
//                       form.category === cat
//                         ? "rgba(200,241,53,0.12)"
//                         : "rgba(255,255,255,0.04)",
//                     color:
//                       form.category === cat
//                         ? "#c8f135"
//                         : "rgba(255,255,255,0.5)",
//                     fontFamily: "'Manrope',sans-serif",
//                     fontSize: 13,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                     textTransform: "capitalize",
//                     transition: "all 0.15s",
//                   }}
//                 >
//                   {cat}
//                 </button>
//               ))}
//             </div>
//             {errors.category && <div style={errSt}>{errors.category}</div>}

//             {/* Skills */}
//             <label style={{ ...lb, marginTop: 18 }}>
//               Detected Skills {req}
//             </label>
//             <div
//               style={{
//                 display: "flex",
//                 flexWrap: "wrap",
//                 gap: 8,
//                 marginBottom: 10,
//               }}
//             >
//               {form.skills.map((sk) => (
//                 <span
//                   key={sk}
//                   style={{
//                     padding: "5px 12px",
//                     background: "rgba(200,241,53,0.1)",
//                     color: "#c8f135",
//                     borderRadius: 20,
//                     fontSize: 12,
//                     fontWeight: 600,
//                     border: "1px solid rgba(200,241,53,0.2)",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 6,
//                   }}
//                 >
//                   {sk}
//                   <span
//                     onClick={() => removeSkill(sk)}
//                     style={{ cursor: "pointer", fontSize: 14, opacity: 0.6 }}
//                   >
//                     ×
//                   </span>
//                 </span>
//               ))}
//               <div style={{ display: "flex", gap: 6 }}>
//                 <input
//                   className="uv-inp"
//                   value={newSkill}
//                   onChange={(e) => setNewSkill(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && addSkill()}
//                   placeholder="Add skill…"
//                   style={{
//                     ...inp,
//                     width: 130,
//                     padding: "5px 10px",
//                     fontSize: 12,
//                     borderRadius: 20,
//                   }}
//                 />
//                 <button
//                   onClick={addSkill}
//                   style={{
//                     padding: "5px 12px",
//                     background: "rgba(255,255,255,0.08)",
//                     color: "#fff",
//                     border: "none",
//                     borderRadius: 20,
//                     fontSize: 13,
//                     fontWeight: 600,
//                     cursor: "pointer",
//                   }}
//                 >
//                   +
//                 </button>
//               </div>
//             </div>
//             {errors.skills && <div style={errSt}>{errors.skills}</div>}
//           </div>

//           {/* Profile fields */}
//           <div style={card}>
//             <div
//               style={{
//                 fontSize: 11,
//                 fontWeight: 700,
//                 color: "rgba(255,255,255,0.35)",
//                 textTransform: "uppercase",
//                 letterSpacing: "0.1em",
//                 marginBottom: 16,
//               }}
//             >
//               Profile Details
//             </div>
//             <div
//               style={{
//                 display: "grid",
//                 gridTemplateColumns: "1fr 1fr",
//                 gap: 14,
//               }}
//             >
//               {[
//                 {
//                   label: "Full Name",
//                   field: "name",
//                   type: "text",
//                   r: true,
//                   ro: false,
//                 },
//                 {
//                   label: "Age",
//                   field: "age",
//                   type: "number",
//                   r: false,
//                   ro: false,
//                 },
//                 {
//                   label: "Email",
//                   field: "email",
//                   type: "email",
//                   r: true,
//                   ro: true,
//                 },
//                 {
//                   label: "Contact No.",
//                   field: "contact",
//                   type: "tel",
//                   r: true,
//                   ro: false,
//                 },
//                 {
//                   label: "Experience",
//                   field: "experience",
//                   type: "text",
//                   r: true,
//                   ro: false,
//                 },
//                 {
//                   label: "Pricing",
//                   field: "pricing",
//                   type: "text",
//                   r: false,
//                   ro: false,
//                 },
//               ].map(({ label, field, type, r, ro }) => (
//                 <div key={field}>
//                   <label style={lb}>
//                     {label}
//                     {r && req}
//                   </label>
//                   <input
//                     className={`uv-inp ${errors[field] ? "uv-err" : ""}`}
//                     type={type}
//                     value={form[field]}
//                     readOnly={ro}
//                     onChange={(e) => {
//                       if (ro) return;
//                       setForm((p) => ({ ...p, [field]: e.target.value }));
//                       setErrors((e2) => ({ ...e2, [field]: undefined }));
//                     }}
//                     style={{
//                       ...inp,
//                       background: ro
//                         ? "rgba(255,255,255,0.03)"
//                         : inp.background,
//                       cursor: ro ? "not-allowed" : "text",
//                     }}
//                     placeholder={ro ? "(from your account)" : label}
//                   />
//                   {errors[field] && <div style={errSt}>{errors[field]}</div>}
//                 </div>
//               ))}
//             </div>
//             <div style={{ marginTop: 14 }}>
//               <label style={lb}>Gender</label>
//               <select
//                 className="uv-inp"
//                 value={form.gender}
//                 onChange={(e) =>
//                   setForm((p) => ({ ...p, gender: e.target.value }))
//                 }
//                 style={{
//                   ...inp,
//                   cursor: "pointer",
//                   color: "#fff",
//                   background: "#1e1e1e",
//                 }}
//               >
//                 <option
//                   value=""
//                   style={{ background: "#1e1e1e", color: "#fff" }}
//                 >
//                   Select gender
//                 </option>
//                 <option style={{ background: "#1e1e1e", color: "#fff" }}>
//                   Male
//                 </option>
//                 <option style={{ background: "#1e1e1e", color: "#fff" }}>
//                   Female
//                 </option>
//                 <option style={{ background: "#1e1e1e", color: "#fff" }}>
//                   Other
//                 </option>
//               </select>
//             </div>
//           </div>

//           {/* ✅ Fix 1: Button says "Save & Go to Portfolio" */}
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             style={{
//               width: "100%",
//               padding: "14px",
//               background: saving ? "rgba(200,241,53,0.5)" : "#c8f135",
//               color: "#0d0d0d",
//               border: "none",
//               borderRadius: 10,
//               fontSize: 14,
//               fontWeight: 700,
//               cursor: saving ? "not-allowed" : "pointer",
//               fontFamily: "'Manrope',sans-serif",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 8,
//             }}
//           >
//             {saving && (
//               <div
//                 style={{
//                   width: 16,
//                   height: 16,
//                   borderRadius: "50%",
//                   border: "2px solid rgba(0,0,0,0.2)",
//                   borderTopColor: "#0d0d0d",
//                   animation: "spin 0.7s linear infinite",
//                 }}
//               />
//             )}
//             {saving ? "Saving…" : "Save & Go to Portfolio →"}
//           </button>
//         </>
//       )}
//     </div>
//   );
// }
// src/pages/worker/UploadVideo.jsx
// src/pages/worker/UploadVideo.jsx
// src/pages/worker/UploadVideo.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api.services.js";
import { useWorker } from "../../context/WorkerContext.jsx";

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
  return bad.some((b) => text.toLowerCase().includes(b));
}

export default function UploadVideo() {
  const { refreshPortfolio, user, portfolio } = useWorker();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [step, setStep] = useState("idle"); // idle | uploading | review
  const [stepIdx, setStepIdx] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // Review state after upload
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");

  const STEPS = [
    "Uploading to Cloudinary",
    "Extracting frames",
    "Detecting skills (BLIP)",
    "Transcribing speech (Whisper)",
    "Saving to database",
  ];

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStep("uploading");
    setStepIdx(0);

    const data = new FormData();
    data.append("video", file);
    if (user?.category) data.append("worker_category", user.category);

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

      const extracted = (p.skills || auto_fill.skills || []).filter(
        (s) => s && s.trim().length > 1 && !isUselessDescription(s),
      );

      // Merge with existing skills, no duplicates
      const existingSkills = portfolio?.skills || [];
      const merged = [
        ...existingSkills,
        ...extracted.filter((s) => !existingSkills.includes(s)),
      ];

      setExtractedSkills(merged);
      setVideoUrl(p.videoUrl || "");

      setTimeout(() => setStep("review"), 400);
    } catch (err) {
      clearInterval(interval);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
      setStep("idle");
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !extractedSkills.includes(s))
      setExtractedSkills((prev) => [...prev, s]);
    setNewSkill("");
  };

  const removeSkill = (s) =>
    setExtractedSkills((prev) => prev.filter((x) => x !== s));

  const handleSave = async () => {
    setSaving(true);
    try {
      const category =
        user?.category === "tailor"
          ? "steam_ironing"
          : user?.category || portfolio?.category || "";

      const portfolioPayload = {
        name: portfolio?.name || user?.name,
        email: user?.email || portfolio?.email,
        age: portfolio?.age || undefined,
        gender: portfolio?.gender || undefined,
        contact: portfolio?.contact || undefined,
        experience: portfolio?.experience || undefined,
        description: portfolio?.description || undefined,
        skills: extractedSkills,
        videoUrl: videoUrl || portfolio?.videoUrl || undefined,
        category: category || undefined,
        languagesKnown: portfolio?.languagesKnown || [],
        selectedWorkTypes: portfolio?.selectedWorkTypes || [],
        priceMin: portfolio?.priceMin || undefined,
        priceMax: portfolio?.priceMax || undefined,
        pricing: portfolio?.pricing || undefined,
      };

      // Strip undefined/null/empty
      Object.keys(portfolioPayload).forEach(
        (k) =>
          (portfolioPayload[k] === undefined ||
            portfolioPayload[k] === null ||
            portfolioPayload[k] === "") &&
          delete portfolioPayload[k],
      );

      await api.post("/portfolios", portfolioPayload);
      await refreshPortfolio();

      setTimeout(() => navigate("/worker/portfolio"), 300);
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ──────────────────────────────────────────────────────────────
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
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .uv-drop:hover { border-color: rgba(200,241,53,0.45) !important; }
        .uv-inp:focus { border-color:#c8f135!important; box-shadow:0 0 0 3px rgba(200,241,53,0.1)!important; }
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
        portfolio updated automatically.
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
              padding: "36px 20px",
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
              background: file ? "#c8f135" : "rgba(200,241,53,0.3)",
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
          <div
            style={{
              marginTop: 8,
              fontSize: 12,
              color: "rgba(255,255,255,0.3)",
              textAlign: "center",
            }}
          >
            Please wait while we analyse your video…
          </div>
        </div>
      )}

      {/* ── REVIEW: Show extracted skills before saving ── */}
      {step === "review" && (
        <>
          {/* Success banner */}
          <div
            style={{
              ...card,
              borderColor: "rgba(74,222,128,0.2)",
              background: "rgba(74,222,128,0.05)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(74,222,128,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4ade80"
                strokeWidth="2.5"
                style={{ width: 18, height: 18 }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#4ade80",
                  marginBottom: 2,
                }}
              >
                Video analysed!
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                Review the detected skills below, edit if needed, then save to
                your portfolio.
              </div>
            </div>
          </div>

          {/* Category — read-only, from registration */}
          <div style={{ ...card, borderColor: "rgba(200,241,53,0.12)" }}>
            <label style={lb}>
              Your Category
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
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 20,
                border: "1.5px solid #c8f135",
                background: "rgba(200,241,53,0.1)",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#c8f135",
                  textTransform: "capitalize",
                }}
              >
                {user?.category === "tailor"
                  ? "Steam Ironing"
                  : user?.category || portfolio?.category || "Not set"}
              </span>
            </div>
          </div>

          {/* Detected Skills — editable */}
          <div style={card}>
            <label style={lb}>Detected Skills</label>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.35)",
                marginBottom: 12,
              }}
            >
              Remove irrelevant ones or add more before saving.
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 12,
              }}
            >
              {extractedSkills.length === 0 && (
                <div
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.3)",
                    fontStyle: "italic",
                  }}
                >
                  No skills detected — add them manually below.
                </div>
              )}
              {extractedSkills.map((sk) => (
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
                className="uv-inp"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                placeholder="Add a skill…"
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

          {/* Save button */}
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
            {saving ? "Saving…" : "Save & Go to Portfolio →"}
          </button>

          <button
            onClick={() => {
              setStep("idle");
              setFile(null);
              setStepIdx(0);
            }}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: 10,
              background: "transparent",
              color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            Upload a different video
          </button>
        </>
      )}
    </div>
  );
}
