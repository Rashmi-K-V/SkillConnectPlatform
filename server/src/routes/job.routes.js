// routes/job.routes.js
import express from "express";
import {
  requestJob,
  acceptJob,
  rejectJob,
  negotiateJob,
  markOngoing,
  completeJob,
  rateJob,
  getWorkerJobs,
  getClientJobs,
} from "../controllers/job.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/",                    protect, requestJob);
router.get("/worker",               protect, getWorkerJobs);
router.get("/client",               protect, getClientJobs);
router.put("/:id/accept",           protect, acceptJob);
router.put("/:id/reject",           protect, rejectJob);
router.put("/:id/negotiate",        protect, negotiateJob);
router.put("/:id/ongoing",          protect, markOngoing);  // worker marks arrived
router.put("/:id/complete",         protect, completeJob);
router.post("/:id/rate",            protect, rateJob);      // client rates worker

export default router;