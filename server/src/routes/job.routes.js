import express from 'express';
import {
  requestJob, acceptJob, rejectJob,
  completeJob, getWorkerJobs, getClientJobs, negotiateJob
} from '../controllers/job.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/',                protect, requestJob);
router.put('/:id/accept',      protect, acceptJob);
router.put('/:id/reject',      protect, rejectJob);
router.put('/:id/complete',    protect, completeJob);
router.put('/:id/negotiate',   protect, negotiateJob);  // NEW
router.get('/worker',          protect, getWorkerJobs);
router.get('/client',          protect, getClientJobs);

export default router;