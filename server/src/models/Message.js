// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  jobId:          { type: mongoose.Schema.Types.ObjectId, ref: "Job",  required: true },
  senderId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  senderRole:     { type: String, enum: ["worker","client"], required: true },
  text:           { type: String, required: true },           // original text/transcript
  translatedText: { type: String },                           // translated for recipient
  targetLang:     { type: String, default: "en" },            // language translated into
  isVoice:        { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);