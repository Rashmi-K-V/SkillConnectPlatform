import mongoose, { mongo } from 'mongoose';

const JobSchema = new mongoose.Schema({
  clientId :{
    type : mongoose.Schema.Types.ObjectId,
    ref  : "User",
    required : true
  },
  workerId : {
    type : mongoose.Schema.Types.ObjectId,
    ref  : "User",
    required : true
  },
  status: {
  type: String,
  enum: ["pending", "accepted", "rejected", "completed"],
  default: "pending"
},
  price : {
    type : Number,
    
  },
  description : {
    type : String,
  },
  location : {
    lat : Number,
    lng : Number,
    address : String
  },
  eta : {
    type : Number
  }
},{timestamps : true});


const Job = mongoose.model("Job",JobSchema);

export default Job;