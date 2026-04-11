// routes/message.routes.js
import express from "express";
import multer  from "multer";
import { getMessages, sendMessage } from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

// store voice files temporarily in uploads/
const upload = multer({ dest: "uploads/" });

const router = express.Router();

router.get("/:jobId",              protect, getMessages);
router.post("/:jobId", protect, upload.single("audio"), sendMessage);

export default router;