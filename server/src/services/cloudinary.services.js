import cloudinary from 'cloudinary';

export const uploadVideo = async(filePath) =>{
  const result = await cloudinary.v2.uploader.upload(filePath, {
    resource_type : "video",
    folder : "worker_videos"
  });
  console.log("Cloudinary upload result:", result);
  return result.secure_url;
};