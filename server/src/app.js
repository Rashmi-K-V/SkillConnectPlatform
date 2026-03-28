import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import workerRoutes from "./routes/worker.routes.js";
import videoRoutes from "./routes/video.routes.js";
import jobRoutes from "./routes/job.routes.js";
import portfolioRoutes from "./routes/portfolio.routes.js";

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/portfolios", portfolioRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});


export default app;