import axios from "axios";

export const generateDescription = async (framePaths, videoPath) => {
  const res = await axios.post(
    "http://localhost:5001/generate",
    {
      images:     framePaths,
      video_path: videoPath   // send absolute path so Python can read the audio
    },
    { headers: { "Content-Type": "application/json" } }
  );

  return {
    description: res.data.description || "",
    skills:      res.data.skills      || [],
    auto_fill:   res.data.auto_fill   || {}   // { name, age, gender, experience }
  };
};