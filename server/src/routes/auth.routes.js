// routes/auth.routes.js
import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  uploadAvatar,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

// ✅ Translate endpoint — used by Portfolio voice input
// Calls your existing translation service
const translateHandler = async (req, res) => {
  try {
    const { text, targetLang = "en" } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });
    const { translateText } = await import("../services/translation.services.js");
    const translated = await translateText(text, targetLang);
    res.json({ original: text, translated, targetLang });
  } catch (err) {
    // Graceful fallback — return original if translation fails
    console.error("translate error:", err.message);
    res.json({ original: req.body.text, translated: req.body.text, targetLang: req.body.targetLang });
  }
};

const router = express.Router();

// Public
router.post("/register",        register);
router.post("/login",           login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.post("/translate",       translateHandler); // ✅ No auth needed — voice translation

// Protected
router.get("/me",      protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password",protect, changePassword);
router.post("/avatar", protect, uploadAvatar);

export default router;