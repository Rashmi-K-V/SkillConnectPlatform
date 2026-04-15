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
  workerId:          { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl:          { type: String },
  description:       { type: String },
  skills:            { type: [String], default: [] },
  name:              { type: String },
  age:               { type: Number },
  gender:            { type: String, enum: ["Male","Female","Other"] },
  email:             { type: String },
  contact:           { type: String },
  experience:        { type: String },

  // Category and work types
  category:          { type: String, enum: ["plumber","electrician","cook","cleaner","tailor"] },
  selectedWorkTypes: { type: [String], default: [] }, // IDs of selected work types
  priceMin:          { type: Number },                // worker's min price
  priceMax:          { type: Number },                // worker's max price

  // Legacy single pricing field kept for backward compat
  pricing:           { type: String },

  languagesKnown:    { type: [String], default: [] },

  // Auto-calculated from client reviews — worker cannot edit
  avgRating:         { type: Number, default: 0 },
  totalRatings:      { type: Number, default: 0 },
  reviews:           { type: [reviewSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);