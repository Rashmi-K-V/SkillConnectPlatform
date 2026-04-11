// server/src/controllers/job.controller.js
import Job from "../models/Job.js";

const requestJob = async (req, res) => {
  try {
    const { workerId, description, location, price } = req.body;
    const job = await Job.create({
      clientId: req.user._id,
      workerId,
      description,
      location,
      price,
      status: "pending"
    });
    // populate for response
    const populated = await Job.findById(job._id)
      .populate("clientId", "name email")
      .populate("workerId", "name email");
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const acceptJob = async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const rejectJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    job.status = "rejected";
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.workerId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });
    job.status = "completed";
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWorkerJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ workerId: req.user._id })
      .populate("clientId", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getClientJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ clientId: req.user._id })
      .populate("workerId", "name email")
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// NEW — add negotiate endpoint
const negotiateJob = async (req, res) => {
  try {
    const { price, note } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    job.price = price;
    job.status = "pending"; // still pending, just price updated
    if (note) job.description = job.description + `\n[Worker note: ${note}]`;
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export { requestJob, acceptJob, rejectJob, completeJob, getWorkerJobs, getClientJobs, negotiateJob };