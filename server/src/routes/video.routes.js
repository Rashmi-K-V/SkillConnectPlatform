import express from 'express';
import { uploadWorkerVideo } from '../controllers/video.controller.js';
import upload from '../middleware/upload.middleware.js';
import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('video'), uploadWorkerVideo);

export default router;