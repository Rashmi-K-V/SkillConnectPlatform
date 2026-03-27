import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema({
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  category: {
    type: String,
    enum: ["plumber", "electrician", "cleaner", "cook"]
  },

  videoUrl: String,

  autoDescription: String, // BLIP output

  skills: [String],

  experience: String,

  priceRange: {
    min: Number,
    max: Number
  },

  languages: [String],

  location: {
    lat: Number,
    lng: Number
  },

  rating: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

export default mongoose.model("Portfolio", portfolioSchema);