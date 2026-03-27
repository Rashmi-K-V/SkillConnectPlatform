import express from 'express';
import {
  requestJob,
  acceptJob,
  rejectJob,
  completeJob,
  getWorkerJobs,
  getClientJobs
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create job
router.post('/', protect, requestJob);

// Update job status
router.put('/:id/accept', protect, acceptJob);
router.put('/:id/reject', protect, rejectJob);
router.put('/:id/complete', protect, completeJob);

// Fetch jobs
router.get('/worker', protect, getWorkerJobs);
router.get('/client', protect, getClientJobs);

export default router;