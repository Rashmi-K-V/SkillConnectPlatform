import mongoose from "mongoose";

const portfolioSchema  = new mongoose.Schema({
  workerId : {
    type : mongoose.Schema.Types.ObjectId,
    ref:"User",
    required : true,
  } ,
  videoUrl : {
    type : String
  },
  skills:[
    {
      type: String
    }
  ],
  experience : {
    type : String
  },
  priceRange : {
    min : Number,
    max : Number
  }
},{timestamps:true});

const Portfolio = mongoose.model("Portfolio", portfolioSchema);
export default Portfolio;