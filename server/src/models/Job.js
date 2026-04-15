// models/Job.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  rating:         { type: Number, min: 1, max: 5 },
  jobQuality:     { type: Number, min: 1, max: 5 },
  timeliness:     { type: Number, min: 1, max: 5 },
  communication:  { type: Number, min: 1, max: 5 },
  wouldRecommend: { type: Boolean },
  comment:        { type: String },
  submittedAt:    { type: Date, default: Date.now },
}, { _id: false });

const jobSchema = new mongoose.Schema({
  clientId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  workerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  location:    { type: String },
  price:       { type: Number },

  // Payment method chosen by client at booking
  paymentMethod: {
    type: String,
    enum: ["cash", "upi", "bank_transfer"],
    default: "cash",
  },
  upiId: { type: String }, // if UPI selected

  status: {
    type: String,
    enum: [
      "pending",       // client sent request, waiting for worker
      "negotiating",   // worker opened negotiate chat
      "accepted",      // worker accepted
      "rejected",      // worker rejected
      "ongoing",       // worker en route — arrival OTP generated (client shows OTP)
      "verified",      // worker entered client's arrival OTP — work begins
      "work_done",     // worker marked work done, asking for payment
      "completed",     // client entered completion OTP — job fully done
      "rated",         // client submitted feedback
      "payment_dispute", // client didn't pay within 10 mins
    ],
    default: "pending",
  },

  eta: { type: String },

  // ARRIVAL OTP: client generates & shows → worker enters
  arrivalOtp:        { type: String },
  arrivalOtpExpires: { type: Date },
  arrivalVerified:   { type: Boolean, default: false },

  // COMPLETION OTP: worker generates & shows → client enters
  completionOtp:        { type: String },
  completionOtpExpires: { type: Date },
  completionVerified:   { type: Boolean, default: false },

  // Payment tracking
  paymentConfirmedAt: { type: Date },
  paymentDisputeAt:   { type: Date },

  // Negotiation
  negotiationStarted: { type: Date },
  negotiationExpiry:  { type: Date },

  feedback: { type: feedbackSchema },
  rating:   { type: Number, min: 1, max: 5 },

}, { timestamps: true });

export default mongoose.model("Job", jobSchema);