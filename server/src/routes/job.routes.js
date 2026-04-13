// routes/job.routes.js
import express from "express";
import {
  requestJob,
  acceptJob,
  rejectJob,
  negotiateJob,
  generateArrivalOtp,
  verifyArrivalOtp,
  completeJob,
  submitFeedback,
  getWorkerJobs,
  getClientJobs,
} from "../controllers/job.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",                      protect, requestJob);
router.get("/worker",                 protect, getWorkerJobs);
router.get("/client",                 protect, getClientJobs);
router.put("/:id/accept",             protect, acceptJob);
router.put("/:id/reject",             protect, rejectJob);
router.put("/:id/negotiate",          protect, negotiateJob);       // opens 5-min chat
router.put("/:id/arrival-otp",        protect, generateArrivalOtp); // worker en route → OTP
router.post("/:id/verify-arrival",    protect, verifyArrivalOtp);   // client verifies OTP
router.put("/:id/complete",           protect, completeJob);
router.post("/:id/feedback",          protect, submitFeedback);     // client submits review

export default router;