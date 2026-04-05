import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";  // ← add this
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

export const extractFrames = (videoPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = "frames";

    // Clean up old frames first to avoid stale file mixing
    if (fs.existsSync(outputDir)) {
      fs.readdirSync(outputDir).forEach(file => {
        fs.unlinkSync(path.join(outputDir, file));
      });
    } else {
      fs.mkdirSync(outputDir);
    }

    ffmpeg(videoPath)
      .on("end", () => {
        const files = fs.readdirSync(outputDir);

        if (files.length === 0) {
          return reject(new Error("FFmpeg ran but extracted no frames"));
        }

        const framePaths = files.map(file => path.join(outputDir, file));
        resolve(framePaths);
      })
      .on("error", (err) => {
        // Normalize ffmpeg errors — they're often plain objects, not Error instances
        reject(new Error(`FFmpeg frame extraction failed: ${err?.message || String(err)}`));
      })
      .screenshots({
        count: 3,
        folder: outputDir,
        filename: "frame-%i.png"
      });
  });
};