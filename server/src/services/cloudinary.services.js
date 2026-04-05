import cloudinary from '../config/cloudinary.js';

export const uploadVideo = async(filePath) =>{
  

  const result = await cloudinary.uploader.upload(filePath, {
    resource_type : "video",
    folder : "worker_videos"
  });
  console.log("Cloudinary upload result:", result);
  return result.secure_url;
};

