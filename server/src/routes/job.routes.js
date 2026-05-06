import express from "express";
import {
  requestJob,
  negotiateJob,
  acceptJob,
  rejectJob,
  workerEnRoute,
  verifyArrivalOtp,
  markWorkDone,
  verifyCompletionOtp,
  submitFeedback,
  getWorkerJobs,
  getClientJobs,
} from "../controllers/job.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",                  protect, requestJob);
router.put("/:id/negotiate",      protect, negotiateJob);
router.put("/:id/accept",         protect, acceptJob);
router.put("/:id/reject",         protect, rejectJob);
router.put("/:id/enroute",        protect, workerEnRoute);
router.put("/:id/verify-arrival", protect, verifyArrivalOtp);
router.put("/:id/work-done",      protect, markWorkDone);
router.put("/:id/complete",       protect, verifyCompletionOtp);
router.post("/:id/feedback",      protect, submitFeedback);
router.get("/worker",             protect, getWorkerJobs);
router.get("/client",             protect, getClientJobs);

export default router;