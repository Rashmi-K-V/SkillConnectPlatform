import User from '../models/User.js';
import Portfolio from '../models/Portfolio.js';

const getWorker = async (req, res) => {
  try{
    const {category} = req.query;
    const filter = {role: 'worker'};
    if(category){
      filter.category = category;
    }
    const workers = await User.find(filter).select('-password');
    res.json(workers);
  }catch(error){
    res.status(500).json({message:error.message});
  }
};

const getWorkerDetails = async(req,res) =>{
  try{
    const worker = await User.findById(req.params.id).select('-password');
    if(!worker || worker.role !== 'worker'){
      return res.status(404).json({message:'Worker not found'});
    }
    const portfolio = await Portfolio.findOne({workerId : req.params.id});
    res.json({worker, portfolio});
  }catch(error){
    res.status(500).json({message:error.message});
  }
}


export {getWorker, getWorkerDetails};