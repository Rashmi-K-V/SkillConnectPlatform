import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import videoRoutes from "./routes/video.routes.js";
import jobRoutes from "./routes/job.routes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/jobs", jobRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});


export default app;