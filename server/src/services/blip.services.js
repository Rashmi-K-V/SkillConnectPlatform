import axios from "axios";

export const generateDescription = async (imageUrls) => {
  const res = await axios.post("http://localhost:5001/generate", {
    images: imageUrls
  });

  return res.data.description;
};