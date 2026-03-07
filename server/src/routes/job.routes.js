import express from 'express';
import { requestJob,acceptJob,rejectJob,completeJob,getWorkerJobs , getClientJobs } from '../controllers/job.controller.js';

import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/request',protect,requestJob);
router.post('/accept/:id',protect,acceptJob);
router.post('/reject/:id',protect,rejectJob);
router.post('/complete/:id',protect,completeJob);
router.get('/worker',protect,getWorkerJobs);
router.get('/client',protect,getClientJobs);

export default router;