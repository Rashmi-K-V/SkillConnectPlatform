import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name:{
    type: String,
    required : true,
  },
  email : {
    type : String,
    required : true,
    unique : true,
  },
  password : {
    type: String,
    required : true
  },
  role : {
    type : String,
    enum : ['worker','client'],
    required : true
  },
  category : {
    type : String,
    enum : ['plumber','electrician','cleaner','cook'],
  },
  language: {
      type: String,
      default: "en"
  },
  profilePicture: {
    type: String,
    default: ""
  },
  
},{timestamps:true});

const User = mongoose.model("User", UserSchema);