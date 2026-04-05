import Portfolio from "../models/Portfolio.js";
import { uploadVideo } from "../services/cloudinary.services.js";
import { extractFrames } from "../services/frameExtractor.services.js";
import { generateDescription } from "../services/blip.services.js";
import fs from "fs";

export const uploadWorkerVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const videoPath = req.file.path;

    // 1. Upload video (optional but good)
    const videoUrl = await uploadVideo(videoPath);
    console.log("Video uploaded to:", videoUrl);

    // 2. Extract frames
    const framePaths = await extractFrames(videoPath);
    console.log("Extracted frames:", framePaths);

    // 3. Generate description using BLIP
    const description = await generateDescription(framePaths);
    console.log("Generated description:", description);

    framePaths.forEach((path) =>{
      try{
        fs.unlinkSync(path);
      } catch (err) {
        console.error("Error deleting frame:", err.message);
      }
    }); // cleanup frames

    // 4. Save portfolio
    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user.id },
      { videoUrl, description },
      { new: true, upsert: true }
    );

    res.json({ portfolio });

  } catch (err) {
    console.error("ML ERROR:", err);               // log the full error, not just .message
    console.error("ML ERROR type:", typeof err);
    console.error("ML ERROR stack:", err?.stack);
    res.status(500).json({ message: err?.message || String(err) });
  }
};