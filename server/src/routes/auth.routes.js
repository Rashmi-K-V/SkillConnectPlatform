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
import { translateText } from "../services/translation.services.js";

const router = express.Router();

// ── Public ───────────────────────────────────────────────────────────────────
router.post("/register",        register);
router.post("/login",           login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

// ── Translation (no auth needed — used by voice input + page translation) ───
router.post("/translate", async (req, res) => {
  try {
    const { text, targetLang = "en" } = req.body;
    if (!text) return res.status(400).json({ message: "text is required" });
    const translated = await translateText(text, targetLang);
    res.json({ original: text, translated, targetLang });
  } catch (err) {
    console.error("translate error:", err.message);
    // Graceful fallback — return original text if translation fails
    res.json({ original: req.body.text, translated: req.body.text, targetLang: req.body.targetLang });
  }
});

router.post("/translate-batch", async (req, res) => {
  try {
    const { texts, targetLang = "en" } = req.body;
    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ message: "texts array is required" });
    }
    // Translate in parallel, fall back to original on error
    const translated = await Promise.all(
      texts.map(async (text) => {
        try {
          return await translateText(text, targetLang);
        } catch {
          return text;
        }
      })
    );
    res.json({ translations: translated });
  } catch (err) {
    console.error("translate-batch error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── Protected ────────────────────────────────────────────────────────────────
router.get("/me",       protect, getMe);
router.put("/profile",  protect, updateProfile);
router.put("/password", protect, changePassword);
router.post("/avatar",  protect, uploadAvatar);

export default router;