import { uploadVideo } from "../services/cloudinary.services";
import Portfolio from "../models/Portfolio.model";

export const uploadWorkerVideo = async(req,res) =>{
  try{
    const videoUrl = await uploadVideo(req.file.path);
    const portfolio = await Portfolio.findOneAndUpdate(
      {workerId : req.worker.id},
      {videoUrl},
      {new : true, upsert : true}
    );
    res.json({message : "Video uploaded successfully", videoUrl ,portfolio});

  }catch(error){
    res.status(500).json({message : "Failed to upload video", error : error.message});
  }
}