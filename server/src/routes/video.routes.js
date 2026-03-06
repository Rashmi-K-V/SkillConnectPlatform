import express from 'express';
import { uploadWorkerVideo } from '../controllers/video.controller';
import upload from '../middleware/upload.middleware';
import {protect} from '../middleware/auth.middleware';

const router = express.Router();

router.post('/upload', protect, upload.single('video'), uploadWorkerVideo);

export default router;