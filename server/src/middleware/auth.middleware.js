import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const protect = (req,res,next) =>{
  const token = req.headers.authorization;
  if(!token){
    return res.status(401).json({message:"No token provided, authorization denied"});
  }
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();

  }catch(error){
    res.status(401).json({message:"Invalid token, authorization denied"});
  }
}