
import axios from "axios";

export const generateDescription = async (framePaths) => {
  const res = await axios.post(
    "http://localhost:5001/generate",
    {
      images: framePaths
    },
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  return res.data.description;
};