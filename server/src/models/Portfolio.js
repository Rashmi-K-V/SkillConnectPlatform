// models/Portfolio.js
import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  workerId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl:     { type: String },
  description:  { type: String },
  skills:       { type: [String], default: [] },
  name:         { type: String },
  age:          { type: Number },
  gender:       { type: String, enum: ["Male","Female","Other"] },
  email:        { type: String },
  contact:      { type: String },
  experience:   { type: String },
  pricing:      { type: String },
  category:     { type: String, enum: ["plumber","electrician","cook","cleaner","tailor"] },
  avgRating:    { type: Number, default: 0 },     // auto-updated on job rating
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);