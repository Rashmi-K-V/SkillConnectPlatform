// controllers/video.controller.js
import Portfolio from "../models/Portfolio.js";
import { uploadVideo }         from "../services/cloudinary.services.js";
import { extractFrames }       from "../services/frameExtractor.services.js";
import { generateDescription } from "../services/blip.services.js";
import fs   from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

export const uploadWorkerVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const videoPath = path.resolve(req.file.path).replace(/\\/g, "/");

    // 1. Upload to Cloudinary
    console.log("Step 1: Uploading to Cloudinary...");
    const videoUrl = await uploadVideo(videoPath);
    console.log("Video uploaded:", videoUrl);

    // 2. Extract frames
    console.log("Step 2: Extracting frames...");
    const framePaths = await extractFrames(videoPath);
    console.log("Frames extracted:", framePaths.length);

    // 3. Run BLIP + Whisper ML pipeline
    console.log("Step 3: Running ML pipeline...");
    const { description, skills, auto_fill } = await generateDescription(framePaths, videoPath);
    console.log("Skills detected:", skills);
    console.log("Auto-fill data:", auto_fill);

    // 4. Cleanup temp frames
    framePaths.forEach((p) => {
      try { fs.unlinkSync(p); } catch (e) { console.error("Frame delete error:", e.message); }
    });

    // 5. Save to Portfolio — map auto_fill fields directly to schema fields
    // FIX: Portfolio has no auto_fill field — save each field individually
    console.log("Step 4: Saving to portfolio...");

    const portfolioUpdate = {
      workerId:    req.user._id,
      videoUrl,
      description,
      skills: skills || [],
    };

    // Map auto_fill fields to Portfolio schema fields (only if truthy)
    if (auto_fill?.name)       portfolioUpdate.name       = auto_fill.name;
    if (auto_fill?.age)        portfolioUpdate.age        = Number(auto_fill.age) || undefined;
    if (auto_fill?.gender)     portfolioUpdate.gender     = auto_fill.gender;
    if (auto_fill?.experience) portfolioUpdate.experience = auto_fill.experience;
    if (auto_fill?.contact)    portfolioUpdate.contact    = auto_fill.contact;
    if (auto_fill?.pricing)    portfolioUpdate.pricing    = auto_fill.pricing;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      { $set: portfolioUpdate },
      { new: true, upsert: true }
    );

    // Return both portfolio and auto_fill so frontend can pre-fill the form
    res.json({ portfolio, auto_fill: auto_fill || {} });

  } catch (err) {
    console.error("uploadWorkerVideo ERROR:", err);
    res.status(500).json({ message: err?.message || String(err) });
  }
};