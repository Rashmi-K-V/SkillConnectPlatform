// controllers/job.controller.js
import Job from "../models/Job.js";

export const requestJob = async (req, res) => {
  try {
    const { workerId, description, location, price } = req.body;
    const job = await Job.create({
      clientId: req.user._id,
      workerId,
      description,
      location,
      price,
      status: "pending",
    });
    const populated = await Job.findById(job._id)
      .populate("clientId", "name email")
      .populate("workerId", "name email contact");
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

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
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    job.status = "rejected";
    await job.save();
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const negotiateJob = async (req, res) => {
  try {
    const { price, note } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.price = price;
    job.status = "pending";
    if (note) job.description = job.description + `\n[Worker note: ${note}]`;
    await job.save();
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const markOngoing = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    job.status = "ongoing";
    if (req.body.eta) job.eta = req.body.eta;
    await job.save();
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    job.status = "completed";
    await job.save();
    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ── NEW: Client rates the worker after job completes ──
export const rateJob = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be 1-5" });

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.clientId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    if (job.status !== "completed")
      return res.status(400).json({ message: "Can only rate completed jobs" });
    if (job.rating)
      return res.status(400).json({ message: "Already rated" });

    job.rating   = rating;
    job.feedback = feedback || "";
    await job.save();

    // Update worker's portfolio average rating
    const Portfolio = (await import("../models/Portfolio.js")).default;
    const allJobs = await Job.find({ workerId: job.workerId, rating: { $exists: true, $ne: null } });
    const avg = allJobs.reduce((sum, j) => sum + j.rating, 0) / allJobs.length;
    await Portfolio.findOneAndUpdate(
      { workerId: job.workerId },
      { $set: { avgRating: Math.round(avg * 10) / 10, totalRatings: allJobs.length } }
    );

    res.json(job);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

export const getWorkerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.user._id })
      .populate("clientId", "name email profilePicture")
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