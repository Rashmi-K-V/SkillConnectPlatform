import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";
import path from "path";
import fs from "fs";                          // ← was missing
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to frames dir — works regardless of cwd for both Node and Python
const outputDir = path.join(__dirname, "../../frames");

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

export const extractFrames = (videoPath) => {
  return new Promise((resolve, reject) => {

    // Clean up old frames
    if (fs.existsSync(outputDir)) {
      fs.readdirSync(outputDir).forEach(file => {
        fs.unlinkSync(path.join(outputDir, file));
      });
    } else {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(videoPath)
      .on("end", () => {
        const files = fs.readdirSync(outputDir);

        if (files.length === 0) {
          return reject(new Error("FFmpeg ran but extracted no frames"));
        }

        // Absolute paths with forward slashes so Python can open them on Windows
        const framePaths = files.map(file =>
          path.join(outputDir, file).replace(/\\/g, "/")
        );

        console.log("Frame paths sent to Python:", framePaths); // ← confirm paths
        resolve(framePaths);
      })
      .on("error", (err) => {
        reject(new Error(`FFmpeg frame extraction failed: ${err?.message || String(err)}`));
      })
      .screenshots({
        count: 3,
        folder: outputDir,
        filename: "frame-%i.png"
      });
  });
};