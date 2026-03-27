import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath);

export const extractFrames = (videoPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = "frames";

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    ffmpeg(videoPath)
      .on("end", () => {
        const files = fs.readdirSync(outputDir);
        const framePaths = files.map(file => path.join(outputDir, file));
        resolve(framePaths);
      })
      .on("error", reject)
      .screenshots({
        count: 5,
        folder: outputDir,
        filename: "frame-%i.png"
      });
  });
};