// models/Portfolio.js
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  clientId:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  clientName:     { type: String },
  jobId:          { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
  rating:         { type: Number, min: 1, max: 5 },
  jobQuality:     { type: Number, min: 1, max: 5 },
  timeliness:     { type: Number, min: 1, max: 5 },
  communication:  { type: Number, min: 1, max: 5 },
  wouldRecommend: { type: Boolean },
  comment:        { type: String },
  submittedAt:    { type: Date, default: Date.now },
}, { _id: true });

const portfolioSchema = new mongoose.Schema({
  workerId:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl:        { type: String },
  description:     { type: String },
  skills:          { type: [String], default: [] },
  name:            { type: String },
  age:             { type: Number },
  gender:          { type: String, enum: ["Male", "Female", "Other"] },
  email:           { type: String },
  contact:         { type: String },
  experience:      { type: String },
  pricing:         { type: String },
  category:        { type: String, enum: ["plumber", "electrician", "cook", "cleaner", "tailor"] },
  languagesKnown:  { type: [String], default: [] },  // NEW: languages worker speaks

  // Auto-calculated from reviews — worker cannot edit these
  avgRating:       { type: Number, default: 0 },
  totalRatings:    { type: Number, default: 0 },
  reviews:         { type: [reviewSchema], default: [] }, // Client reviews, non-editable
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);