import express from 'express';
import {
  getWorker,
  getWorkerDetails
} from '../controllers/worker.controller.js';

import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public
router.get('/', getWorker);
router.get('/:id', getWorkerDetails);

// Worker actions (IMPORTANT)
router.post('/portfolio', protect, async (req, res) => {
  res.send("Create portfolio route (to implement)");
});

export default router;