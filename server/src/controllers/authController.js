import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const register = async(req , res) => {
  try{
    const { name, email, password, role, category, language } = req.body;
    const userExists = await User.findOne({email});
    if(userExists){
      return res.status(400).json({message:"User already exists"});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      name,
      email,
      password : hashedPassword,
      role,
      language,
    };
    if(role === "worker") {
      user.category = category;
    }
    const newUser = await User.create(user);
    res.json(user);

  
  }catch(error){
    res.status(500).json({message:error.message});
  }
}