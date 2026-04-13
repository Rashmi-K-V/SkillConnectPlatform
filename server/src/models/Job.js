// models/Job.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  rating:          { type: Number, min: 1, max: 5 },
  jobQuality:      { type: Number, min: 1, max: 5 },  // How well was job done
  timeliness:      { type: Number, min: 1, max: 5 },  // On time?
  communication:   { type: Number, min: 1, max: 5 },  // Communication quality
  wouldRecommend:  { type: Boolean },
  comment:         { type: String },
  submittedAt:     { type: Date, default: Date.now },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  location:    { type: String },
  price:       { type: Number },

  status: {
    type: String,
    enum: [
      "pending",      // client sent request
      "negotiating",  // worker opened negotiate chat
      "accepted",     // worker accepted
      "rejected",     // worker rejected
      "verified",     // OTP verified at location — work begins
      "ongoing",      // worker marked started
      "completed",    // worker marked done
      "rated",        // client submitted feedback
    ],
    default: "pending",
  },

  eta:               { type: String },

  // Arrival verification OTP (4-digit, both client and worker see it)
  arrivalOtp:        { type: String },
  arrivalOtpExpires: { type: Date },
  arrivalVerified:   { type: Boolean, default: false },

  // Negotiation chat expiry (5 min window)
  negotiationStarted: { type: Date },
  negotiationExpiry:  { type: Date },

  // Feedback from client (non-editable after submit)
  feedback:          { type: feedbackSchema },

  // Overall rating (derived from feedback)
  rating:            { type: Number, min: 1, max: 5 },

}, { timestamps: true });

export default mongoose.model("Job", jobSchema);