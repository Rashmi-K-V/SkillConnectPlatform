// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",      required: true },
  workerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",      required: true },
  description: { type: String, required: true },
  location:    { type: String },
  price:       { type: Number },
  status:      {
    type: String,
    enum: ["pending","accepted","rejected","ongoing","completed"],
    default: "pending",
  },
  eta:         { type: String },          // e.g. "15 mins" set by worker on accept
  rating:      { type: Number, min:1, max:5 },
  feedback:    { type: String },
}, { timestamps: true });

export default mongoose.model("Job", jobSchema);