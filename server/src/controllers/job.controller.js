import Job from "../models/Job.js";
import { calculateETA } from "../services/eta.services.js";




const requestJob = async (req, res) => {
  const { workerId, description, location } = req.body;

  const job = await Job.create({
    clientId: req.user._id,
    workerId,
    description,
    location,
    status: "pending"
  });

  res.json(job);
};

const acceptJob = async (req, res) => {
  const { price } = req.body;

  const job = await Job.findById(req.params.id);

  if (!job) return res.status(404).json({ message: "Job not found" });

  // 🔒 Only worker can accept
  if (job.workerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  job.status = "accepted";
  job.price = price;

  // simple ETA logic
const etaData = await calculateETA(workerLocation, job.location);

job.eta = etaData.duration;
  await job.save();

  res.json(job);
};

const rejectJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job.workerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  job.status = "rejected";
  await job.save();

  res.json(job);
};

const completeJob = async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job.workerId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not authorized" });
  }

  job.status = "completed";
  await job.save();

  res.json(job);
};

const getWorkerJobs = async (req, res) => {
  const jobs = await Job.find({ workerId: req.user.id });
  res.json(jobs);
};

const getClientJobs = async (req, res) => {
  const jobs = await Job.find({ clientId: req.user.id });
  res.json(jobs);
};

export {
  requestJob,
  acceptJob,
  rejectJob,
  completeJob,
  getWorkerJobs,
  getClientJobs
};