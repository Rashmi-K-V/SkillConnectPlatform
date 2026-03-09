import cloudinary from 'cloudinary';

export const uploadVideo = async(filePath) =>{
  console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key:", process.env.CLOUDINARY_API_KEY);
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type : "video",
    folder : "worker_videos"
  });
  console.log("Cloudinary upload result:", result);
  return result.secure_url;
};