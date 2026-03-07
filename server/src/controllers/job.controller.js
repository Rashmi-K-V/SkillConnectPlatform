import Job from "../models/Job.js";

const requestJob = async (req,res) =>{
  try{
    const {workerId,description,location} = req.body;
    const job = await Job.create({
      clientId : req.user._id,
      workerId,
      description,
      location
    });
    res.json(job);
  }catch(error){
    res.status(500).json({message : error.message});
  }
};

const acceptJob = async (req,res )=>{
  try{
    const {price} = req.body;
    const job = await Job.findById(req.params.id);
    if(!job){
      return res.status(404).json({message : "Job not found"});
    }
    job.status = "accepted";
    job.price = price;
    await job.save();
    res.json(job);
  }catch(error){
    res.status(500).json({message : error.message});
  }
};

const rejectJob = async(req,res) =>{
  try{
    const job = await Job.findById(req.params.id);
    job.status = "cancelled";
    await job.save();
    res.json(job);
  }catch(error){
    res.status(500).json({message : error.message});
  }
};

const completeJob = async(req,res) =>{
  try{
    const job = await Job.findById(req.params.id);
    job.status = "completed";
    await job.save();
    res.json(job);
  }catch(error){
    res.status(500).json({message : error.message});
  }
};

const getWorkerJobs = async(req,res) =>{
  try{
    const jobs = await Job.find({workerId : req.user.id});
    res.json(jobs);
  }catch(error){
    res.status(500).json({message : error.message});
  }
};

const getClientJobs = async(req,res) =>{
  try{
    const jobs = await Job.find({clientId : req.user.id});
    res.json(jobs);
  }catch(error){
    res.status(500).json({message : error.message});
  }
};

export {requestJob,acceptJob,rejectJob,completeJob,getWorkerJobs , getClientJobs};