// controllers/job.controller.js
import Job       from "../models/Job.js";
import Portfolio from "../models/Portfolio.js";
import { io, userSockets } from "../server.js";
import { notifyUser } from "../socket/socket.js"

function genOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// ── REQUEST JOB ───────────────────────────────────────────────
export const requestJob = async (req, res) => {
  try {
    const { workerId, description, location, price, paymentMethod, upiId } = req.body;
    const job = await Job.create({
      clientId: req.user._id,
      workerId,
      description,
      location,
      price,
      paymentMethod: paymentMethod || "cash",
      upiId: upiId || undefined,
      status: "pending",
    });
    const populated = await Job.findById(job._id)
      .populate("clientId", "name email")
      .populate("workerId", "name email contact");

    notifyUser(io, userSockets, workerId, "new_job_request", {
      jobId:       job._id,
      clientName:  req.user.name,
      description,
      location,
      price,
      paymentMethod: paymentMethod || "cash",
      message:     `New job request from ${req.user.name}: "${description}"`,
    });

    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── NEGOTIATE ─────────────────────────────────────────────────
export const negotiateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    const now    = new Date();
    const expiry = new Date(now.getTime() + 5 * 60 * 1000);
    job.status             = "negotiating";
    job.negotiationStarted = now;
    job.negotiationExpiry  = expiry;
    await job.save();
    notifyUser(io, userSockets, job.clientId.toString(), "negotiation_started", {
      jobId: job._id, workerName: req.user.name, expiry: expiry.toISOString(),
      message: `${req.user.name} wants to negotiate. Chat open for 5 minutes.`,
    });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── ACCEPT ────────────────────────────────────────────────────
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
    notifyUser(io, userSockets, job.clientId.toString(), "job_accepted", {
      jobId: job._id, workerName: req.user.name, price: job.price,
      message: `${req.user.name} accepted your job request!`,
    });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── REJECT ────────────────────────────────────────────────────
export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    job.status = "rejected";
    await job.save();
    notifyUser(io, userSockets, job.clientId.toString(), "job_rejected", {
      jobId: job._id,
      message: `${req.user.name} declined your job request.`,
    });
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// In job.controller.js — fix workerEnRoute (404 was because route was /enroute not /en-route)
export const workerEnRoute = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (!["accepted"].includes(job.status))
      return res.status(400).json({ message: "Job must be accepted before going en route" });

    const otp     = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    job.status            = "ongoing";
    job.arrivalOtp        = otp;
    job.arrivalOtpExpires = expires;
    if (req.body.eta) job.eta = req.body.eta;
    await job.save();

    // ✅ Send OTP to CLIENT via socket — they show it on their screen
    const { io, userSockets } = await import("../server.js");
    if (io && userSockets) {
      const clientSocketId = userSockets[job.clientId.toString()];
      if (clientSocketId) {
        io.to(clientSocketId).emit("arrival_otp", {
          jobId:      job._id,
          otp,
          workerName: req.user.name,
          message:    req.user.name + " is on the way! Show them the code below.",
        });
      }
    }

    res.json({ message: "En route! OTP sent to client.", eta: job.eta });
  } catch (err) {
    console.error("enRoute error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Fix verifyArrivalOtp — was comparing wrong fields
export const verifyArrivalOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ message: "OTP is required" });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the worker can verify arrival" });

    console.log("Stored OTP:", job.arrivalOtp, "| Entered OTP:", otp); // debug

    if (!job.arrivalOtp)
      return res.status(400).json({ message: "No arrival OTP found. Please go en route first." });
    if (job.arrivalOtp.toString() !== otp.toString())
      return res.status(400).json({ message: "Incorrect code. Ask the client to check their screen." });
    if (job.arrivalOtpExpires && job.arrivalOtpExpires < new Date())
      return res.status(400).json({ message: "Code expired. Go en route again to get a new code." });

    job.status          = "verified";
    job.arrivalVerified = true;
    await job.save();

    const { io, userSockets } = await import("../server.js");
    if (io && userSockets) {
      const clientSocketId = userSockets[job.clientId.toString()];
      if (clientSocketId) {
        io.to(clientSocketId).emit("arrival_verified", {
          jobId:   job._id,
          message: req.user.name + " has arrived and verified! Work is starting now.",
        });
      }
    }

    res.json({ message: "Arrival verified! Work has started.", job });
  } catch (err) {
    console.error("verifyArrival error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ Fix markWorkDone — completion OTP shown to WORKER, client enters it
export const markWorkDone = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const { paymentReceived } = req.body;

    if (!paymentReceived) {
      job.status           = "work_done";
      job.paymentDisputeAt = new Date(Date.now() + 10 * 60 * 1000);
      await job.save();

      const { io, userSockets } = await import("../server.js");
      if (io && userSockets) {
        const clientSocketId = userSockets[job.clientId.toString()];
        if (clientSocketId) {
          io.to(clientSocketId).emit("payment_requested", {
            jobId:      job._id,
            workerName: req.user.name,
            deadline:   job.paymentDisputeAt,
            message:    req.user.name + " has finished the work. Please pay ₹" + job.price + " within 10 minutes.",
          });
        }
      }

      setTimeout(async () => {
        try {
          const fresh = await Job.findById(job._id);
          if (fresh && fresh.status === "work_done" && !fresh.completionOtp) {
            fresh.status = "payment_dispute";
            await fresh.save();
          }
        } catch (e) { console.error("dispute timeout error:", e); }
      }, 10 * 60 * 1000);

      return res.json({ message: "Work marked done. Client has 10 minutes to pay.", job });
    }

    // ✅ Payment received — generate completion OTP
    // Worker shows this OTP to client, client enters it to confirm job is done
    const otp     = Math.floor(1000 + Math.random() * 9000).toString();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    job.status               = "work_done";
    job.completionOtp        = otp;
    job.completionOtpExpires = expires;
    job.paymentConfirmedAt   = new Date();
    await job.save();

    // ✅ Do NOT send OTP to client via socket — worker shows it physically
    // Client must ask worker "what's the code?" — prevents fraud
    // Worker sees it on their screen in Jobs.jsx

    res.json({
      message: "Payment confirmed! Show the completion code to your client.",
      otp,      // returned so worker's Jobs.jsx can display it
      job,
    });
  } catch (err) {
    console.error("markWorkDone error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── CLIENT ENTERS COMPLETION OTP to finalize job ─────────────
export const verifyCompletionOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the client can complete the job" });

    if (job.completionOtp !== otp)
      return res.status(400).json({ message: "Incorrect completion code" });
    if (job.completionOtpExpires < new Date())
      return res.status(400).json({ message: "Completion code expired" });

    job.status             = "completed";
    job.completionVerified = true;
    await job.save();

    notifyUser(io, userSockets, job.workerId.toString(), "job_completed_worker", {
      jobId:   job._id,
      message: "Job confirmed as complete by the client! Great work.",
    });

    res.json({ message: "Job completed successfully!", job });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── SUBMIT FEEDBACK ───────────────────────────────────────────
export const submitFeedback = async (req, res) => {
  try {
    const { rating, jobQuality, timeliness, communication, wouldRecommend, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Overall rating (1-5) required" });

    const job = await Job.findById(req.params.id).populate("clientId", "name");
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the client can submit feedback" });
    if (job.status !== "completed")
      return res.status(400).json({ message: "Can only rate completed jobs" });
    if (job.feedback?.rating)
      return res.status(400).json({ message: "Feedback already submitted" });

    job.feedback = { rating, jobQuality, timeliness, communication, wouldRecommend, comment };
    job.rating   = rating;
    job.status   = "rated";
    await job.save();

    await Portfolio.findOneAndUpdate(
      { workerId: job.workerId },
      {
        $push: {
          reviews: {
            clientId: req.user._id, clientName: job.clientId.name,
            jobId: job._id, rating, jobQuality: jobQuality||null,
            timeliness: timeliness||null, communication: communication||null,
            wouldRecommend, comment,
          },
        },
      }
    );

    const allJobs = await Job.find({ workerId: job.workerId, rating: { $exists: true, $ne: null } });
    const avg = allJobs.reduce((s, j) => s + j.rating, 0) / allJobs.length;
    await Portfolio.findOneAndUpdate(
      { workerId: job.workerId },
      { avgRating: Math.round(avg * 10) / 10, totalRatings: allJobs.length }
    );

    notifyUser(io, userSockets, job.workerId.toString(), "new_review", {
      jobId: job._id, rating, clientName: job.clientId.name,
      message: `${job.clientId.name} left you a ${rating}★ review!`,
    });

    res.json({ message: "Feedback submitted", job });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── GET JOBS ──────────────────────────────────────────────────
export const getWorkerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.user._id })
      .populate("clientId", "name email contact profilePicture")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .populate("workerId", "name email contact profilePicture")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ message: err.message }); }
};