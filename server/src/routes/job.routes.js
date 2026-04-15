// routes/job.routes.js
import express from "express";
import {
  requestJob,
  acceptJob,
  rejectJob,
  negotiateJob,
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

router.post("/",                        protect, requestJob);
router.get("/worker",                   protect, getWorkerJobs);
router.get("/client",                   protect, getClientJobs);
router.put("/:id/accept",               protect, acceptJob);
router.put("/:id/reject",               protect, rejectJob);
router.put("/:id/negotiate",            protect, negotiateJob);


router.put("/:id/en-route",             protect, workerEnRoute);
router.put("/:id/enroute",              protect, workerEnRoute);
router.put("/:id/arrival-otp",          protect, workerEnRoute); // legacy alias

router.post("/:id/verify-arrival",      protect, verifyArrivalOtp);
router.put("/:id/work-done",            protect, markWorkDone);
router.post("/:id/verify-completion",   protect, verifyCompletionOtp);
router.post("/:id/feedback",            protect, submitFeedback);

export default router;