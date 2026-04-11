// controllers/message.controller.js
import Message from "../models/Message.js";
import { translateText } from "../services/translation.services.js";

const LANG_MAP = {
  en: "English", hi: "Hindi", kn: "Kannada",
  ta: "Tamil",   te: "Telugu", ml: "Malayalam", mr: "Marathi",
};

// GET /api/messages/:jobId — fetch all messages for a job
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId })
      .populate("senderId", "name role")
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/messages/:jobId — send a message (text or voice)
// Body (multipart/form-data):
//   text       — plain text message
//   audio      — audio file (webm/wav) for voice messages
//   targetLang — language code to translate INTO (client's chosen language)
export const sendMessage = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { text, targetLang = "en" } = req.body;
    const senderRole = req.user.role; // "worker" | "client"

    let originalText = text || "";

    // If audio file was sent, transcribe it via Whisper (Python service)
    // Your existing blip.services or a dedicated whisper service handles this
    if (req.file) {
      try {
        const { transcribeAudio } = await import("../services/whisper.services.js");
        originalText = await transcribeAudio(req.file.path);
      } catch (e) {
        console.error("Transcription error:", e.message);
        originalText = "[Voice message — transcription failed]";
      }
    }

    if (!originalText.trim()) {
      return res.status(400).json({ message: "Empty message" });
    }

    // Translate if sender is worker AND targetLang is set
    // Workers speak their native language → client sees it in their chosen language
    let translatedText = originalText;
    if (senderRole === "worker" && targetLang && targetLang !== "en") {
      try {
        translatedText = await translateText(originalText, targetLang);
      } catch (e) {
        console.error("Translation error:", e.message);
        translatedText = originalText; // fallback to original
      }
    }
    // If sender is client, also translate for the worker (to English as common base)
    // Workers see client messages in English — you can extend this
    if (senderRole === "client" && targetLang !== "en") {
      try {
        const workerTranslation = await translateText(originalText, "en");
        translatedText = workerTranslation;
      } catch (_) {}
    }

    const message = await Message.create({
      jobId,
      senderId:       req.user._id,
      senderRole,
      text:           originalText,
      translatedText: translatedText !== originalText ? translatedText : undefined,
      targetLang,
    });

    await message.populate("senderId", "name role");
    res.json(message);

  } catch (err) {
    console.error("sendMessage:", err);
    res.status(500).json({ message: err.message });
  }
};