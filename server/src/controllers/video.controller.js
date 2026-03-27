import Portfolio from "../models/Portfolio.js";
import { uploadVideo } from "../services/cloudinary.services.js";

export const uploadWorkerVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No video uploaded" });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    resource_type: "video"
  });

  const portfolio = await Portfolio.findOneAndUpdate(
    { workerId: req.user.id },
    { videoUrl: result.secure_url },
    { new: true, upsert: true }
  );

  res.json({
    videoUrl: result.secure_url,
    portfolio
  });
};