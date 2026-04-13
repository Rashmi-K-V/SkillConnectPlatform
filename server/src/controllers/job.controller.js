// controllers/job.controller.js
import Job       from "../models/Job.js";
import Portfolio from "../models/Portfolio.js";
import { io, userSockets } from "../server.js";
import { notifyUser }       from "../socket/socket.js";

// Helper: generate 4-digit OTP
function genOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ── REQUEST JOB ───────────────────────────────────────────────
export const requestJob = async (req, res) => {
  try {
    const { workerId, description, location, price } = req.body;
    const job = await Job.create({
      clientId: req.user._id, workerId, description, location, price, status: "pending",
    });

    const populated = await Job.findById(job._id)
      .populate("clientId", "name email")
      .populate("workerId", "name email contact");

    // 🔔 Notify worker instantly via socket
    notifyUser(io, userSockets, workerId, "new_job_request", {
      jobId:       job._id,
      clientName:  req.user.name,
      description,
      location,
      price,
      message:     `New job request from ${req.user.name}: "${description}"`,
    });

    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── NEGOTIATE — opens chat window (5 min timer) ───────────────
export const negotiateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const now    = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    job.status             = "negotiating";
    job.negotiationStarted = now;
    job.negotiationExpiry  = expiry;
    await job.save();

    // 🔔 Notify client that worker opened negotiation chat
    notifyUser(io, userSockets, job.clientId.toString(), "negotiation_started", {
      jobId:      job._id,
      workerName: req.user.name,
      expiry:     expiry.toISOString(),
      message:    `${req.user.name} wants to negotiate. Chat open for 5 minutes.`,
    });

    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ACCEPT JOB ────────────────────────────────────────────────
export const acceptJob = async (req, res) => {
  try {
    const { price } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    job.status = "accepted";
    if (price) job.price = price;
    await job.save();

    // 🔔 Notify client job was accepted
    notifyUser(io, userSockets, job.clientId.toString(), "job_accepted", {
      jobId:      job._id,
      workerName: req.user.name,
      price:      job.price,
      message:    `${req.user.name} accepted your job request!`,
    });

    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── REJECT JOB ────────────────────────────────────────────────
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    job.status = "rejected";
    await job.save();

    notifyUser(io, userSockets, job.clientId.toString(), "job_rejected", {
      jobId:   job._id,
      message: `${req.user.name} declined your job request.`,
    });

    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GENERATE ARRIVAL OTP (worker en route, generates OTP) ─────
export const generateArrivalOtp = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const otp     = genOtp();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    job.arrivalOtp        = otp;
    job.arrivalOtpExpires = expires;
    job.status            = "ongoing";
    if (req.body.eta) job.eta = req.body.eta;
    await job.save();

    // Send OTP to BOTH worker (response) and client (socket)
    notifyUser(io, userSockets, job.clientId.toString(), "arrival_otp", {
      jobId:      job._id,
      otp,
      workerName: req.user.name,
      message:    `${req.user.name} is on the way! Verification code: ${otp}`,
    });

    res.json({ otp, message: "OTP generated. Share with client to verify arrival." });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── VERIFY ARRIVAL OTP (client enters OTP to confirm worker arrived) ──
export const verifyArrivalOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (job.arrivalOtp !== otp)
      return res.status(400).json({ message: "Incorrect OTP" });
    if (job.arrivalOtpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    job.status          = "verified";
    job.arrivalVerified = true;
    await job.save();

    // Notify worker that work can begin
    notifyUser(io, userSockets, job.workerId.toString(), "arrival_verified", {
      jobId:   job._id,
      message: "Client verified your arrival. You can start working!",
    });

    res.json({ message: "Arrival verified! Work can begin.", job });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── COMPLETE JOB (worker marks done) ─────────────────────────
export const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    job.status = "completed";
    await job.save();

    // Notify client to provide feedback
    notifyUser(io, userSockets, job.clientId.toString(), "job_completed", {
      jobId:      job._id,
      workerName: req.user.name,
      message:    `${req.user.name} marked the job as complete. Please leave a review!`,
    });

    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SUBMIT FEEDBACK (client only, non-editable after submit) ──
export const submitFeedback = async (req, res) => {
  try {
    const { rating, jobQuality, timeliness, communication, wouldRecommend, comment } = req.body;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Overall rating (1-5) is required" });

    const job = await Job.findById(req.params.id).populate("clientId", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the client can submit feedback" });
    if (job.status !== "completed")
      return res.status(400).json({ message: "Can only rate completed jobs" });
    if (job.feedback?.rating)
      return res.status(400).json({ message: "Feedback already submitted" });

    // Save feedback on job
    job.feedback = { rating, jobQuality, timeliness, communication, wouldRecommend, comment };
    job.rating   = rating;
    job.status   = "rated";
    await job.save();

    // Add review to worker's portfolio (non-editable by worker)
    const avgFields = { jobQuality, timeliness, communication };
    const validRatings = Object.values(avgFields).filter(Boolean);
    const detailAvg = validRatings.length
      ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
      : rating;

    await Portfolio.findOneAndUpdate(
      { workerId: job.workerId },
      {
        $push: {
          reviews: {
            clientId:      req.user._id,
            clientName:    job.clientId.name,
            jobId:         job._id,
            rating,
            jobQuality:    jobQuality   || null,
            timeliness:    timeliness   || null,
            communication: communication || null,
            wouldRecommend,
            comment,
          },
        },
      }
    );

    // Recalculate average rating on portfolio
    const allJobs = await Job.find({ workerId: job.workerId, rating: { $exists: true, $ne: null } });
    const avg = allJobs.reduce((sum, j) => sum + j.rating, 0) / allJobs.length;
    await Portfolio.findOneAndUpdate(
      { workerId: job.workerId },
      { avgRating: Math.round(avg * 10) / 10, totalRatings: allJobs.length }
    );

    // Notify worker of new review
    notifyUser(io, userSockets, job.workerId.toString(), "new_review", {
      jobId:      job._id,
      rating,
      clientName: job.clientId.name,
      message:    `${job.clientId.name} left you a ${rating}★ review!`,
    });

    res.json({ message: "Feedback submitted successfully", job });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET WORKER JOBS ───────────────────────────────────────────
export const getWorkerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.user._id })
      .populate("clientId", "name email contact profilePicture")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET CLIENT JOBS ───────────────────────────────────────────
export const getClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .populate("workerId", "name email contact profilePicture")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};