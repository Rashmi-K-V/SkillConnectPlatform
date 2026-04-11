import Portfolio from "../models/Portfolio.js";
import { uploadVideo }        from "../services/cloudinary.services.js";
import { extractFrames }      from "../services/frameExtractor.services.js";
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

    // Absolute path so Python can also read the audio
    const videoPath = path.resolve(req.file.path).replace(/\\/g, "/");

    // 1. Upload to Cloudinary
    console.log("Step 1: Uploading to Cloudinary...");
    const videoUrl = await uploadVideo(videoPath);
    console.log("Video uploaded:", videoUrl);

    // 2. Extract frames
    console.log("Step 2: Extracting frames...");
    const framePaths = await extractFrames(videoPath);
    console.log("Frames:", framePaths);

    // 3. Run BLIP + Whisper
    console.log("Step 3: Running ML pipeline...");
    const { description, skills, auto_fill } = await generateDescription(framePaths, videoPath);
    console.log("Description:", description);
    console.log("Skills:", skills);
    console.log("Auto-fill:", auto_fill);

    // 4. Cleanup frames
    framePaths.forEach((p) => {
      try { fs.unlinkSync(p); } catch (e) { console.error("Frame delete error:", e.message); }
    });

    // 5. Save / update portfolio
    console.log("Step 4: Saving portfolio...");
    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user.id },
      {
        videoUrl,
        description,
        skills,           // array of skill strings from keyword map
        auto_fill,        // { name, age, gender, experience } — frontend uses this to pre-fill
      },
      { returnDocument: "after", upsert: true }
    );

    res.json({ portfolio, auto_fill });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err?.message || String(err) });
  }
};