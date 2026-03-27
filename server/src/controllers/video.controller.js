import { uploadVideo } from "../services/cloudinary.services.js";
import { extractFrames } from "../services/frameExtractor.services.js";
import { generateDescription } from "../services/blip.services.js";
import Portfolio from "../models/Portfolio.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadWorkerVideo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video uploaded" });
    }

    // 1. Upload video
    const videoUrl = await uploadVideo(req.file.path);

    // 2. Extract frames
    const framePaths = await extractFrames(req.file.path);

    // 3. Upload frames to cloudinary
    const imageUrls = [];

    for (let frame of framePaths) {
      const img = await cloudinary.uploader.upload(frame);
      imageUrls.push(img.secure_url);
    }

    // 4. Generate AI description
    const description = await generateDescription(imageUrls);

    // 5. Save to DB
    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user._id },
      {
        videoUrl,
        autoDescription: description
      },
      { new: true, upsert: true }
    );

    // 6. Cleanup
    fs.unlinkSync(req.file.path);
    framePaths.forEach(f => fs.unlinkSync(f));

    res.json({
      videoUrl,
      autoDescription: description,
      portfolio
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};