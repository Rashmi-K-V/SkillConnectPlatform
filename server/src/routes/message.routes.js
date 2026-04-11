
import express from "express";
import Message from "../models/Message.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get all messages for a job
router.get("/:jobId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId })
      .populate("senderId", "name")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;