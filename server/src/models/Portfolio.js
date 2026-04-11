// import mongoose from "mongoose";

// const portfolioSchema = new mongoose.Schema({
//   workerId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },

//   category: {
//     type: String,
//     enum: ["plumber", "electrician", "cleaner", "cook"]
//   },

//   videoUrl: String,

//   autoDescription: String, // BLIP output

//   skills: [String],

//   experience: String,

//   priceRange: {
//     min: Number,
//     max: Number
//   },

//   languages: [String],

//   location: {
//     lat: Number,
//     lng: Number
//   },

//   rating: {
//     type: Number,
//     default: 0
//   }

// }, { timestamps: true });

// export default mongoose.model("Portfolio", portfolioSchema);

import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  workerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  videoUrl:    { type: String },
  description: { type: String },
  skills:      { type: [String], default: [] },  // ["Stitching", "Embroidery"]

  // Profile fields — editable by worker, pre-filled by ML
  name:        { type: String },
  age:         { type: Number },
  gender:      { type: String, enum: ["Male", "Female", "Other"] },
  email:       { type: String },
  contact:     { type: String },
  experience:  { type: String },
  pricing:     { type: String },
  category:    { type: String, enum: ["plumber", "electrician", "cook", "cleaner", "tailor"] },
}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);