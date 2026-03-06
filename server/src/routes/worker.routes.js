import express from 'express';
import { getWorker, getWorkerDetails } from '../controllers/worker.controller.js';

const router = express.Router();

router.get('/', getWorker);
router.get('/:id', getWorkerDetails);

export default router;