import Portfolio from "../models/Portfolio.js";

export const uploadWorkerVideo = async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "No video uploaded"
      });
    }

    const videoUrl = req.file.path;

    const portfolio = await Portfolio.findOneAndUpdate(
      { workerId: req.user.id },
      { videoUrl },
      { new: true, upsert: true }
    );

    res.json({
      message: "Video uploaded successfully",
      videoUrl,
      portfolio
    });

  } catch (error) {

    res.status(500).json({
      message: "Failed to upload video",
      error: error.message
    });

  }

};